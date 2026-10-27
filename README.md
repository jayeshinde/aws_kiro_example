# Product List — Kiro + DynamoDB + React + AWS Amplify

Read-only product catalogue: React + Vite frontend, API Gateway HTTP API + Lambda (Node.js 22), DynamoDB.

## Architecture
- React + Vite frontend hosted by AWS Amplify Hosting
- API Gateway HTTP API + AWS Lambda (Node.js 22) backend
- DynamoDB table keyed by `productId`; `productCode` is unique by application convention
- Kiro specs and steering files guide spec-driven implementation

The browser calls the API — never DynamoDB directly. The Lambda role has read-only `dynamodb:Scan` permission. For large catalogues, replace Scan with Query against a GSI and rely on the built-in pagination (see below).

## Product schema
`productId` (string, partition key), `productCode` (string), `type` (string), `name` (string), `amount` (number), `availableInventory` (number).

## API contract
```
GET /products?pageSize=50&pageToken=<token>
→ 200 { "items": Product[], "count": number, "nextPageToken": string | null }
```

- `pageSize`: 1–200 (default 50). Items above 200 are clamped to 50.
- `pageToken`: opaque base64url continuation token from a previous `nextPageToken` value.
- When `nextPageToken` is `null`, there are no more pages.
- Errors return JSON `{ "message": "..." }` with status 500. Internal details are never exposed.
- No write endpoints are included.

## Prerequisites
- Git and Node.js 20+ (Node 22 recommended)
- AWS account and AWS CLI configured (`aws configure` or SSO)
- AWS SAM CLI
- Kiro IDE: https://kiro.dev/downloads/

## 1. Open in Kiro
Open this folder in Kiro. Read `.kiro/steering/tech.md` and `.kiro/specs/product-list/requirements.md`, `design.md` and `tasks.md`.

## 1.1 Paste this prompt into Kiro:
```javascript
Review the Product List application repository. 
Implement the requirements in .kiro/specs/product-list/. 
Use React and TypeScript for the frontend, DynamoDB for storage, and API Gateway with Lambda for the read-only REST API. 
Keep IAM permissions least-privileged. 
Add tests for successful, empty and failed API responses. 
Add pagination before production use. 
Review CORS, error handling and security. Run the available build and tests, and report any failures. 
Do not deploy AWS resources without my confirmation.
```


## 2. Build and test locally (no AWS required)

### Backend
```bash
cd backend
npm install
npm test        # 24 Jest tests — success, empty, error, pagination
```

### Frontend
```bash
cd frontend
npm install
npm test        # 18 Vitest tests — all states + search + pagination
npm run build   # TypeScript compile + Vite production bundle
```

## 3. Deploy the backend
```bash
cd backend
sam build
sam deploy --guided
```
Use a stack name such as `product-list-api`, choose your AWS region, allow SAM to create IAM roles, save the configuration. Copy the `ApiUrl` output.

For later deployments:
```bash
sam deploy
```

## 4. Configure and run React locally
```bash
cd frontend
cp .env.example .env.local
```
Set `VITE_PRODUCTS_API_URL` in `.env.local` to the deployed `ApiUrl` (no trailing slash; the app appends `/products`). 
```bash
VITE_PRODUCTS_API_URL=https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com
```
Then:
```bash
npm install
npm run dev
```

## 5. Add sample data
Use the table name from the SAM stack output. Insert an item:
```json
{
  "productId": "p-1001",
  "productCode": "SKU-1001",
  "type": "Electronics",
  "name": "Wireless Mouse",
  "amount": 799.00,
  "availableInventory": 42
}
```
All attributes are case-sensitive. Items with `availableInventory` ≤ 5 are highlighted in the UI.

## 6. Deploy the frontend with Amplify Hosting
1. Push to GitHub (see step 7 below).
2. Open AWS Amplify Console → **Create new app** → **Deploy your app** → GitHub.
3. Set the app root to `frontend` if prompted.
4. Add environment variable `VITE_PRODUCTS_API_URL` with the backend `ApiUrl`.
5. Deploy. Amplify rebuilds on every push.

## 7. Create the GitHub repository
```bash
git init
git add .
git commit -m "Initial product list app"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/product-list-kiro.git
git push -u origin main
```

## IAM / security notes
- Lambda role is granted only `dynamodb:Scan` on the specific table ARN via SAM's `DynamoDBReadPolicy`.
- CORS is configurable via the `AllowedOrigin` CloudFormation parameter (default `*` for local dev — **set to your Amplify domain before production**).
- Internal error details (table name, ARN, AWS account ID) are never surfaced in API responses.
- No write endpoints exist in this starter.

## Pagination notes
The initial design used a bounded Scan (`Limit 500`). The implementation now supports cursor-based pagination via a `nextPageToken` / `pageToken` round-trip so the frontend can page through large catalogues. The UI shows Previous / Next controls when multiple pages exist.

Before production on a large table:
- Replace Scan with a `Query` on a designed GSI (e.g. by `type`).
- Add a GSI on `productCode` if uniqueness lookups are needed.
- Consider adding DynamoDB caching (DAX or API-level caching) for high-traffic scenarios.

## Production checklist
- [ ] Replace wildcard CORS with the exact Amplify domain.
- [ ] Add Cognito authentication/authorization if the catalogue is not public.
- [ ] Design a GSI and use Query for type/code lookups; avoid unbounded Scan for large tables.
- [ ] Add structured logs, CloudWatch alarms, and API throttling.
- [ ] Confirm amount precision / currency semantics.
- [ ] Run `npm audit` and update dependencies before production.
- [ ] Enable DynamoDB Point-in-Time Recovery (already on in the template).

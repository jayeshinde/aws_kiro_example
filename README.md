# Product List — Kiro + DynamoDB + React + AWS Amplify

Starter repository for a read-only product catalogue.

## Architecture
- React + Vite frontend hosted by AWS Amplify Hosting
- API Gateway HTTP API + AWS Lambda (Node.js 22) backend
- DynamoDB table keyed by `productId`; `productCode` is unique by application convention in this starter
- Kiro specs and steering files to guide spec-driven implementation

The browser calls the API, never DynamoDB directly. The Lambda role has read-only `Scan` permission for this initial demo. For large catalogues, replace Scan with Query against a designed index and add pagination.

## Product schema
`productId` (string, partition key), `productCode` (string), `type` (string), `name` (string), `amount` (number), `availableInventory` (number).

## Prerequisites
- Git and Node.js 20+ (Node 22 recommended)
- AWS account and AWS CLI configured (`aws configure` or SSO)
- AWS SAM CLI
- Kiro IDE: https://kiro.dev/downloads/

## 1. Open in Kiro
Open this folder in Kiro. Install the **AWS Amplify** power from the Kiro Powers catalogue (optional but recommended). Read `.kiro/steering/tech.md` and `.kiro/specs/product-list/requirements.md`.

In Kiro chat, ask:
> Review this repository and implement the product-list spec. Keep the backend API read-only, validate the response contract, add tests, and update README with any changed commands. Do not deploy without asking me first.

Review the generated requirements/design/tasks and diffs before accepting changes.

## 2. Deploy the backend
```bash
cd backend
sam build
sam deploy --guided
```
During guided deployment use a stack name such as `product-list-api`, choose your AWS region, allow SAM to create IAM roles, and save the configuration. Copy the `ApiUrl` output from the deployment.

For later deployments:
```bash
sam deploy
```

## 3. Configure and run React locally
```bash
cd ../frontend
cp .env.example .env.local
```
Set `VITE_PRODUCTS_API_URL` in `.env.local` to the deployed `ApiUrl` (include no extra path; the frontend appends `/products`). Then:
```bash
npm install
npm run dev
```
Open the local URL printed by Vite.

## 4. Add sample data
Use the table name from the CloudFormation/SAM stack output or AWS console. Insert an item in DynamoDB with these attributes:
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
All attributes are case-sensitive. The current API returns up to 500 records and sorts them by name in Lambda.

## 5. Deploy the frontend with Amplify Hosting
1. Push this project to a GitHub repository (steps below).
2. Open AWS Amplify Console → **Create new app** → **Deploy your app** → GitHub, authorize access, and select this repository/branch.
3. Set the app root directory to `frontend` if prompted. If Amplify expects a monorepo build config, use `frontend/amplify.yml` or copy its build settings into the console.
4. Add environment variable `VITE_PRODUCTS_API_URL` with the backend `ApiUrl`.
5. Deploy. Amplify will rebuild on each push to the connected branch.

The API's CORS allow-list is configurable through `AllowedOrigin`. For a quick test the template defaults to `*`; before production, update it to your exact Amplify domain and redeploy.

## 6. Create the GitHub repository
Create an empty repository on GitHub named `product-list-kiro`, then from this folder:
```bash
git init
git add .
git commit -m "Initial product list app scaffold"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/product-list-kiro.git
git push -u origin main
```
Replace `<YOUR_GITHUB_USERNAME>` with your GitHub username. This workspace has prepared the repository files but has not created a remote GitHub repository or deployed AWS resources.

## API contract
`GET /products` → `200 { "items": Product[], "count": number }`

Errors return JSON `{ "message": "..." }`. No write endpoints are included in this starter.

## Production checklist
- Replace wildcard CORS with the Amplify domain.
- Add Cognito authentication/authorization if the catalogue is not public.
- Design a GSI and use Query for type/code lookups; avoid unbounded Scan for large tables.
- Add pagination, structured logs, alarms, throttling, and API validation.
- Confirm amount precision/currency semantics and inventory update ownership.
- Add unit/integration tests and CI checks before production.

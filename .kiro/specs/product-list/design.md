# Design

## Components
- React/Vite frontend hosted by Amplify Hosting.
- API Gateway HTTP API exposes `GET /products`.
- Lambda reads from a DynamoDB table with `productId` as partition key.
- Lambda returns a stable JSON contract `{ items: Product[], count: number }`.

## Data model
- `productId`: string, partition key
- `productCode`: string
- `type`: string
- `name`: string
- `amount`: number
- `availableInventory`: number

## Trade-offs
The first version uses a bounded DynamoDB Scan (Limit 500) for a simple catalogue demo. DynamoDB Scan is not a scalable search strategy for a large table. Add pagination and Query/GSI access patterns before production. `productCode` uniqueness is not enforced by DynamoDB in this starter; if uniqueness is mandatory, add a transactional uniqueness-key pattern.

## Security
The browser calls API Gateway only. Lambda receives read-only DynamoDB permissions. CORS origin is configurable. Use Cognito/JWT authorization if the product list is private.

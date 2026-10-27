# Technical steering
- Frontend: React, TypeScript, Vite, accessible responsive UI.
- Hosting: AWS Amplify Hosting.
- Backend: API Gateway HTTP API + Lambda Node.js 22.
- Persistence: DynamoDB. Never access DynamoDB directly from browser code.
- Keep product-list API read-only unless requirements are explicitly changed.
- Validate all environment variables and API response shapes; show loading, empty, and error states.
- Never commit AWS credentials, `.env.local`, or generated secrets.
- Before changing infrastructure or deploying, explain cost/security implications and ask for confirmation.
- Prefer tests for API parsing, error states, and product rendering.

# Feature: Get Product List

## User story
As a catalogue user, I want to view products stored in DynamoDB through a React application so I can quickly review product details and available inventory.

## Requirements
1. The product record contains `productId`, `productCode`, `type`, `name`, `amount`, and `availableInventory`.
2. The frontend must fetch products from a backend API; it must not contain AWS database credentials or access DynamoDB directly.
3. The product list must display product code, name, type, amount, and available inventory.
4. The UI must provide loading, empty, and error states and a retry action after an API error.
5. Amount and inventory must be displayed as numeric values; invalid or missing values must not crash the page.
6. The initial API is read-only and returns `{ items, count }`.
7. CORS must be configurable for the Amplify frontend origin.
8. Infrastructure permissions must follow least privilege for read-only access.

## Acceptance criteria
- Given the API returns products, the page renders one row/card per product.
- Given the API returns no products, the page displays a helpful empty state.
- Given the API fails, the page displays an error and allows retry.
- Given the API URL is not configured, the app explains the configuration issue.
- No DynamoDB write operation is exposed by the initial API.

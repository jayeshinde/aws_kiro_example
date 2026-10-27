const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

exports.handler = async () => {
  const headers = {
    'content-type': 'application/json',
    'access-control-allow-origin': allowedOrigin,
    'access-control-allow-headers': 'content-type,authorization',
    'access-control-allow-methods': 'GET,OPTIONS',
  };

  try {
    const result = await client.send(new ScanCommand({
      TableName: process.env.PRODUCTS_TABLE,
      Limit: 500,
      ProjectionExpression: 'productId, productCode, #t, #n, amount, availableInventory',
      ExpressionAttributeNames: { '#t': 'type', '#n': 'name' },
    }));

    const items = (result.Items || []).map((item) => ({
      productId: String(item.productId ?? ''),
      productCode: String(item.productCode ?? ''),
      type: String(item.type ?? ''),
      name: String(item.name ?? ''),
      amount: Number.isFinite(Number(item.amount)) ? Number(item.amount) : 0,
      availableInventory: Number.isFinite(Number(item.availableInventory)) ? Number(item.availableInventory) : 0,
    })).sort((a, b) => a.name.localeCompare(b.name));

    return { statusCode: 200, headers, body: JSON.stringify({ items, count: items.length }) };
  } catch (error) {
    console.error('Failed to read products', { name: error.name, message: error.message });
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Unable to load products right now.' }) };
  }
};

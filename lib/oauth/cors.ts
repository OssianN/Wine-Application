export const oauthCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const oauthJson = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: oauthCorsHeaders,
  });

export const oauthOptions = () =>
  new Response(null, {
    status: 204,
    headers: oauthCorsHeaders,
  });

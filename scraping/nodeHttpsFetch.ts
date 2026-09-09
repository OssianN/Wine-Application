import https from 'node:https';

export const nodeHttpsFetch = (
  input: string | URL | Request,
  init: RequestInit = {}
): Promise<Response> => {
  const request = input instanceof Request ? input : null;
  const url = new URL(request ? request.url : String(input));
  const method = init.method ?? request?.method ?? 'GET';
  const headers = new Headers(init.headers ?? request?.headers);
  const timeoutMs = 10_000;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method,
        headers: Object.fromEntries(headers.entries()),
      },
      res => {
        const chunks: Buffer[] = [];
        res.on('data', chunk => chunks.push(chunk as Buffer));
        res.on('end', () => {
          const rawHeaders: [string, string][] = [];
          for (let i = 0; i < res.rawHeaders.length; i += 2) {
            rawHeaders.push([res.rawHeaders[i], res.rawHeaders[i + 1]]);
          }
          resolve(
            new Response(Buffer.concat(chunks), {
              status: res.statusCode ?? 500,
              statusText: res.statusMessage,
              headers: rawHeaders,
            })
          );
        });
      }
    );

    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Vivino request timed out: ${url.pathname}`));
    });

    if (init.signal) {
      const onAbort = () => {
        req.destroy();
        reject(init.signal?.reason ?? new Error('aborted'));
      };
      if (init.signal.aborted) {
        onAbort();
        return;
      }
      init.signal.addEventListener('abort', onAbort, { once: true });
    }

    const body = init.body ?? undefined;
    if (body) {
      req.write(typeof body === 'string' ? body : Buffer.from(body as ArrayBuffer));
    }
    req.end();
  });
};

// api/_utils.ts

export async function parseRequestBody<T>(req: any): Promise<T> {
  // 情况1: 标准 Web Request 对象 (有 .json 方法)
  if (typeof req.json === 'function') {
    return await req.json() as T;
  }
  
  // 情况2: Express req (body 已被 express.json() 解析)
  if (req.body !== undefined) {
    return req.body as T;
  }

  // 情况3: 原始 Node.js stream (手动读取)
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

export function getRequestUrl(req: any): string {
  // 情况1: 标准 Web Request
  if (req.url && req.url.startsWith('http')) {
    return req.url;
  }

  // 情况2: Express req
  const host =
    req.headers?.['x-forwarded-host'] ||
    req.headers?.host ||
    'localhost:3000';

  const protocol =
    req.headers?.['x-forwarded-proto']?.toString().split(',')[0] ||
    'https';

  const path = req.originalUrl || req.url || '/';

  return `${protocol}://${host}${path}`;
}
const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

// Add in-memory cache
const cacheStr = `
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}
`;

if (!code.includes('const cache = new Map')) {
    code = code.replace(/export async function getProducts/, cacheStr + "\nexport async function getProducts");
    
    code = code.replace(/export async function getProducts\(\): Promise<Product\[\]> \{\s*try \{/, `export async function getProducts(): Promise<Product[]> {
  const cacheKey = 'products_all';
  const cached = getCached<Product[]>(cacheKey);
  if (cached) return cached;
  try {`);
  
    code = code.replace(/return \(data \|\| \[\]\) as Product\[\];/, "const result = (data || []) as Product[];\n    setCache(cacheKey, result);\n    return result;");
}

fs.writeFileSync('src/lib/api.ts', code);

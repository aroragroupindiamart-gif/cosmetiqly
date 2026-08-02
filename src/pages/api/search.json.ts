import type { APIRoute } from 'astro';
import { searchProducts } from '../../lib/db.js';

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';

  const runtimeEnv = (locals as any)?.runtime?.env;
  const results = await searchProducts(q, runtimeEnv);

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};

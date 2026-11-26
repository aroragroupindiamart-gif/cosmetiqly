import dripManifest from '../../data/drip_manifest.json';
import { getCurrentDripDay, getPrunedUrlSet } from '../lib/drip.js';

export async function GET(context) {
  const runtimeEnv = context.locals?.runtime?.env;
  const currentDay = getCurrentDripDay(runtimeEnv);
  const prunedSet = getPrunedUrlSet();

  const SITE_DOMAIN = runtimeEnv?.SITE_DOMAIN ||
    (typeof import.meta !== 'undefined' && import.meta.env?.SITE_DOMAIN) ||
    'https://cosmetiqlyy.com';

  const activeEntries = dripManifest.filter(e => e.drip_day <= currentDay && !prunedSet.has(e.url));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const item of activeEntries) {
    const fullLoc = item.url === '/' ? `${SITE_DOMAIN}/` : `${SITE_DOMAIN}${item.url}`;
    const lastmod = item.verified_date || '2026-11-14';
    xml += `  <url><loc>${fullLoc}</loc><lastmod>${lastmod}</lastmod><changefreq>${item.changefreq}</changefreq><priority>${item.priority.toFixed(1)}</priority></url>\n`;
  }
  xml += `</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

import { execSync } from 'child_process';

async function checkHealthAndIndexing() {
  const timestamp = new Date().toISOString();
  console.log(`🔍 [${timestamp}] Starting Daily Indexing & Health Audit for Cosmetiqly.com...`);

  // 1. Test live edge health across key hubs
  const testUrls = [
    'https://cosmetiqly.com',
    'https://cosmetiqly.com/directory',
    'https://cosmetiqly.com/brand/cerave',
    'https://cosmetiqly.com/check/is-cerave-hydrating-facial-cleanser-fungal-acne-safe',
    'https://cosmetiqly.com/check/is-anastasia-beverly-hills-adapalene-gel-0-1-vol-1015-alcohol-free-safe',
    'https://cosmetiqly.com/sitemap.xml'
  ];

  let allOk = true;
  for (const url of testUrls) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status === 200) {
        console.log(`  ✅ [${res.status} OK] ${url}`);
      } else {
        console.log(`  ⚠️ [${res.status}] ${url}`);
        allOk = false;
      }
    } catch (e) {
      console.log(`  ❌ [ERR] ${url}: ${e.message}`);
      allOk = false;
    }
  }

  console.log(`\n📊 Server Status: ${allOk ? '100% Healthy (200 OK)' : 'Issues detected'}`);
}

checkHealthAndIndexing();

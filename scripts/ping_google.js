async function pingSearchEngines() {
  const sitemapUrl = 'https://cosmetiqly.com/sitemap.xml';

  console.log('🚀 Pinging search engines for Cosmetiqly sitemap index...');

  // Ping Google
  try {
    const googleRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    console.log(`✅ Google Sitemap Ping status: ${googleRes.status}`);
  } catch (err) {
    console.error('❌ Google ping error:', err.message);
  }

  // Ping Bing
  try {
    const bingRes = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    console.log(`✅ Bing Sitemap Ping status: ${bingRes.status}`);
  } catch (err) {
    console.error('❌ Bing ping error:', err.message);
  }
}

pingSearchEngines();

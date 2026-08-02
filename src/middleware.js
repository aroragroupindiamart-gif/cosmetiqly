export async function onRequest(context, next) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Allowed valid routes
  if (
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/contact' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/sitemap-index.xml' ||
    pathname.startsWith('/check/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/sitemaps/') ||
    pathname.startsWith('/_astro/') ||
    pathname.includes('.')
  ) {
    return next();
  }

  // 301 Permanent Redirect all legacy/unknown expired domain URLs to homepage
  return context.redirect('/', 301);
}

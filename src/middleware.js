export async function onRequest(context, next) {
  const url = new URL(context.request.url);
  const hostname = url.hostname;
  const pathname = url.pathname;

  // 1. Redirect www to apex domain
  if (hostname.startsWith('www.')) {
    const apexHost = hostname.replace('www.', '');
    url.hostname = apexHost;
    return Response.redirect(url.toString(), 301);
  }

  // 2. Normalize trailing slash (e.g. /terms/ -> /terms) except for root /
  if (pathname.length > 1 && pathname.endsWith('/')) {
    url.pathname = pathname.slice(0, -1);
    return Response.redirect(url.toString(), 301);
  }

  // 3. Let standard requests through and allow clean 404 responses
  return next();
}

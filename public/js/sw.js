self.addEventListener('install', e => {
  self.skipWaiting();
});

// self.addEventListener('activate', e => {
//   e.waitUntil(clients.claim());
// });

self.addEventListener('fetch', e => {
  const requestURL = new URL(e.request.url);

  // Check that the browser supports .webp images.
  const acceptHeader = e.request.headers.get('Accept');
  if (!acceptHeader.match(/image\/webp/)) {
    return;
  }

  // Only replace png and jpg images with webp.
  const regex = /.(jpg|png)$/;
  if (regex.test(requestURL.href)) {
    const newURL = requestURL.href.replace(regex, '.webp');
    e.respondWith(
      fetch(newURL).then(resp => {
        return resp.status === 200 ? resp : fetch(requestURL);
      })
    );
  }
});

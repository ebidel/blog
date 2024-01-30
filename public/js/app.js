/* global ga:false */

document.querySelector('.fab').addEventListener('click', e => {
  const scroller = document.scrollingElement || document.body;
  scroller.scrollTop = 0;
});

/**
 * Share the current page via navigator.share (if available) or Twitter
 * as fallback.
 * @param {Event} e
 */
async function share(e) {
  e.preventDefault();

  const url = location.href || '';
  const title = document.title || '';

  if (navigator.share) {
    try {
      await navigator.share({url, title, text: title});
      ga('send', 'event', 'share', 'success');
    } catch (err) {
      ga('send', 'event', 'share', 'error', err);
    }
  } else {
    const twitterUrl = `https://twitter.com/intent/tweet?text="${encodeURIComponent(title)}"&url=${encodeURIComponent(url)}&via=ebidel`;
    window.open(twitterUrl, 'intent',
      'scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=520,height=420');
  }
}

window.share = share;


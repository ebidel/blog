/* global ga:false */

const scroller = document.scrollingElement || document.body;

// From http://en.wikipedia.org/wiki/Smoothstep
// eslint-disable-next-line
function smoothStep(start, end, point) {
  if (point <= start) {
    return 0;
  }
  if (point >= end) {
    return 1;
  }
  const x = (point - start) / (end - start); // interpolation
  return x * x * (3 - 2 * x);
}

/**
 * Smooth scrolls to the top of an element.
 *
 * @param {Element} el Element to scroll to.
 * @param {number=} duration Optional duration for the animation to
 *     take. If not specified, the element is immediately scrolled to.
 * @param {function()=} callback Callback to execute at the end of the scroll.
 * @param {number=} offset Offset from the top to stop at.
 */
function smoothScroll(el, duration = 1, callback = null, offset = 0) {
  const startTime = performance.now();
  const endTime = startTime + duration;
  const startTop = scroller.scrollTop;
  const destY = el.getBoundingClientRect().top;

  if (destY === 0) {
    callback && callback();
    return; // already at top of element.
  }

  const cb = function(timestamp) {
    if (timestamp < endTime) {
      requestAnimationFrame(cb);
    }

    const point = smoothStep(startTime, endTime, timestamp);
    const scrollTop = Math.round(startTop + (destY * point)) - offset;

    scroller.scrollTop = scrollTop;

    // All done scrolling.
    if (point === 1 && callback) {
      callback();
    }
  };
debugger;
  cb(startTime);
}

const fab = document.querySelector('.fab');
fab.addEventListener('click', e => {
  smoothScroll(document.body, 1);
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

// export {
//   smoothScroll,
//   share,
// };

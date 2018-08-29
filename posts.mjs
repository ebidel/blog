import matter from 'gray-matter';
import recursiveReadDir from 'recursive-readdir';
import formatDate from 'date-fns/format';
import fetch from 'node-fetch';

const POSTS_DIR = '_posts';
const PATH_TO_CONTENT = new Map();
const POSTS_CACHE = [];
const MEDIUM_POSTS_CACHE = [];

/**
 * Returns a pretty printed version of a date.
 * @param {string} published
 * @return {string}
 */
function prettyDate(published) {
  const d = published.toISOString().split('T')[0];
  return formatDate(d, 'MMM Do, YYYY');
}

/**
 * Sorts posts by their 'published' date property.
 * @param {string} postA
 * @param {string} postB
 * @return {Array}
 */
function comparePostDate(postA, postB) {
  const a = new Date(postA.data.published);
  const b = new Date(postB.data.published);
  if (a > b) {
    return -1;
  }
  if (a < b) {
    return 1;
  }
  return 0;
}

/**
 * Fetches my posts from Medium which are originals and not re-posts.
 * @param {string=} username
 */
async function fetchMediumPosts(username='@ebidel') {
  const resp = await fetch(`https://medium.com/${username}/latest?format=json`);
  const text = await resp.text();
  const posts = Object.values(JSON.parse(text.split('</x>')[1]).payload.references.Post);
  return posts.filter(post => !post.importedUrl).map(post => {
    const href = `https://medium.com/${username}/${post.uniqueSlug}`;
    const published = new Date(post.firstPublishedAt);
    return {
      path: href,
      href,
      excerpt: post.previewContent.subtitle,
      data: {
        title: post.title,
        published,
        publishedStr: prettyDate(published),
      },
    };
  });
}

/**
 * Lists files in a directory, recursively.
 * @param {string} path Base folder to start.
 * @return {Array<Object>}
 */
async function list(path) {
  const posts = [];

  if (PATH_TO_CONTENT.size) {
    return POSTS_CACHE;
  }

  const firstTwoLines = function(file, opts) {
    file.excerpt = (file.content.split('\n').slice(0, 4).join(' '));
  };

  // TODO: cache and return this instead.
  const files = (await recursiveReadDir(path)).filter(f => f.endsWith('.md'));
  const results = files.map(f => {
    const result = matter.read(f, {excerpt: firstTwoLines});
    result.href = result.path.replace(POSTS_DIR, '/posts').replace('.md', '');
    result.data.publishedStr = prettyDate(result.data.published);

    PATH_TO_CONTENT.set(result.path, result); // add to cache.

    return result;
  });

  // Add in medium posts.
  if (!MEDIUM_POSTS_CACHE.length) {
    const posts = await fetchMediumPosts('@ebidel');
    MEDIUM_POSTS_CACHE.push(...posts);
  }

  posts.push(...results, ...MEDIUM_POSTS_CACHE);
  posts.sort(comparePostDate); // Sort final list.
  POSTS_CACHE.push(...posts); // Cache results for later.

  return posts;
}

/**
 * Gets a post.
 * @param {string} path
 * @return {Object}
 */
function get(path) {
  return PATH_TO_CONTENT.get(path);
}

export {list, get};

import matter from 'gray-matter';
import recursiveReadDir from 'recursive-readdir';
import formatDate from 'date-fns/format';

const PATH_TO_CONTENT = new Map();

/**
 * Lists files in a directory, recursively.
 * @param {string} path Base folder to start.
 * @return {Array<Object>}
 */
async function list(path) {
  const posts = [];

  if (PATH_TO_CONTENT.size) {
    posts.push(...PATH_TO_CONTENT.keys());
  } else {
    const files = (await recursiveReadDir(path)).filter(f => f.endsWith('.md'));
    posts.push(...files);
  }

  const firstTwoLines = function(file, opts) {
    file.excerpt = (file.content.split('\n').slice(0, 4).join(' '));
  };

  // TODO: cache and return this instead.
  const files = posts.map(f => {
    const result = matter.read(f, {excerpt: firstTwoLines});
    result.href = result.path.replace('_posts', '/posts').replace('.md', '');
    const published = result.data.published.toISOString().split('T')[0];
    result.data.publishedStr = formatDate(published, 'MMM Do, YYYY');

    PATH_TO_CONTENT.set(result.path, result);

    return result;
  }).sort(function compareDate(fileA, fileB) {
    const a = new Date(fileA.data.published);
    const b = new Date(fileB.data.published);
    if (a > b) {
      return -1;
    }
    if (a < b) {
      return 1;
    }
    return 0;
  });

  return files;
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

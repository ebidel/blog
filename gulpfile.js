'use strict';

const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const closureCompiler = require('google-closure-compiler').gulp();
const del = require('del');
const merge = require('merge-stream');
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins();

const DIST_DIR = 'dist';

function compileWithClosure(srcs) {
  //return gulp.src('./public/js/**/*.js', {base: './'})
  return gulp.src(srcs)
  .pipe(closureCompiler({
    compilation_level: 'SIMPLE',
    // warning_level: 'VERBOSE',
    language_in: 'ECMASCRIPT_NEXT',
    language_out: 'ECMASCRIPT5_STRICT',
    // output_wrapper: '(function(){\n%output%\n}).call(this)',
    isolation_mode: 'IIFE',
    js_output_file: 'app.min.js',
  }, {
    platform: ['native', 'java', 'javascript']
  }))
  // .pipe(gulp.dest(`./public/js/${DIST}`));
}

// function convertMarkdownToHtml(file) {
//   return $.grayMatter(function(file) { // pull out front matter data.
//     const data = file.data;
//     data.file = file;
//     data.title = data.title || '';
//     data.subtitle = data.subtitle || '';

//     let content = file.content;
//     // Inline code snippets before running through markdown for syntax highlighting.
//     content = content.replace(/<!--\s*include_file\s*([^\s]*)\s*-->/g,
//       (match, src) => fs.readFileSync(`app/${src}`));
//     // Markdown -> HTML.
//     content = markdownIt.render(content);

//     // If there is a table of contents, toc-ify it. Otherwise, wrap the
//     // original markdown content anyway, so that we can style it.
//     if (content.match(/<!--\s*toc\s*-->/gi)) {
//       // Leave a trailing opening <div class="article-wrapper"><article> in the TOC, so that we can wrap the original
//       // markdown content into a div, for styling
//       data.content = toc.process(content, {
//         header: '<h<%= level %><%= attrs %> id="<%= anchor %>" class="has-permalink"><%= header %></h<%= level %>>',
//         TOC: '<div class="details-wrapper"><details id="toc"><summary>Contents</summary><%= toc %></details></div><div class="article-wrapper"><article>',
//         openUL: '<ul data-depth="<%= depth %>">',
//         closeUL: '</ul>',
//         openLI: '<li data-level="H<%= level %>"><a href="#<%= anchor %>"><%= text %></a>',
//         closeLI: '</li>',
//         tocMax: 3,
//         anchor: function(header, attrs) {
//           // if we have an ID attribute, use that, otherwise
//           // use the default slug
//           var id = attrs.match(/(?:^|\s+)id="([^"]*)"/)
//           return id ? id[1] : toc.anchor(header);
//         }
//       }) + '</article></div>';
//     } else {
//       data.content = '<div class="article-wrapper"><article>' + content + '</article></div>';
//     }

//     // const tmpl = fs.readFileSync(templateName);
//     // const renderTemplate = $.util.template(tmpl);

//     // return renderTemplate(data);
//     return data;
//   });
// }

// Clean generated files.
gulp.task('clean', function() {
  del([
    // `public/js/${DIST_DIR}`,
    'public/js/**/*.{min,bundle}.js',
    'public/css/**/*.min.css',
    'public/img/**/*.webp',
  ], {dot: true});
});

gulp.task('images', function() {
  gulp.src([
    'public/img/**/*.{jpg,png}',
    '!public/img/unused/**/*',
  ])
  .pipe($.webp({quality: 75, preset: 'photo', method: 6}))
  .pipe(gulp.dest('public/img'));
});


// gulp.task('md', function() {
//   gulp.src([
//     '_posts/**/*.md',
//   ])
//   .pipe($.fn((file, enc) => {
//     console.log(file.buffer);
//   }))
//   .pipe($.rename({extname: '.html'}))
//   // .pipe(gulp.dest('posts'));
// });

// gulp.task('copy', function() {
//   const intersectionObserver = gulp.src([
//     'node_modules/intersection-observer/intersection-observer.js',
//   ])
//   .pipe(gulp.dest(`js/${DIST_DIR}`));

//   return merge(intersectionObserver);
// });

// Run scripts through Closure compiler.
gulp.task('build', function() {
  const app = compileWithClosure([
    'public/js/app.js',
  ])
    // .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest(`public/js/`));

  // const indexPage = gulp.src([
  //   'js/pages/index.js',
  // ])
  // .pipe(compileWithClosure('index.js'))
  // .pipe($.rename({suffix: '.min'}))
  // .pipe(gulp.dest(`js/${DIST_DIR}/pages`));

  // const insersectionObserver = gulp.src([
  //   `js/${DIST_DIR}/intersection-observer.js`,
  // ])
  // .pipe(compileWithClosure('intersection-observer.js'))
  // .pipe($.rename({suffix: '.min'}))
  // .pipe(gulp.dest(`js/${DIST_DIR}`));

  return merge(app);// , insersectionObserver);
});

// Build production files.
gulp.task('default', ['clean'], cb => {
  runSequence('build', 'images', cb);
});

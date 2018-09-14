import fs from 'fs';
import includePaths from 'rollup-plugin-includepaths';
import filesize from 'rollup-plugin-filesize';
import {terser} from 'rollup-plugin-terser';
import postcss from 'postcss';
import cssnano from 'cssnano';
// import postCSSCustomVariables from 'postcss-css-variables';
import postCSSImport from 'postcss-import';

// Minify css.
postcss([
  postCSSImport(),
  // postCSSCustomVariables(), // Google search runs Chrome 41, which doesn't support CSS custom properties :(
]).process(fs.readFileSync('./public/css/combined.css', 'utf8'), {
  from: './public/css/combined.css',
}).then(result => cssnano.process(result.css))
    .then(result => fs.writeFileSync('./public/css/combined.min.css', result.css));

postcss([
  postCSSImport(),
  // postCSSCustomVariables(),
]).process(fs.readFileSync('./node_modules/highlight.js/styles/github.css', 'utf8'), {
  from: './node_modules/highlight.js/styles/github.css',
}).then(result => cssnano.process(result.css))
    .then(result => fs.writeFileSync('./public/css/github.min.css', result.css));

export default [{
  input: 'public/js/app.js',
  // treeshake: false,
  output: {
    file: 'public/js/app.bundle.js',
    // dir: './dist',
    // name: 'app',
    format: 'es',
  },
  // experimentalDynamicImport: true,
  // experimentalCodeSplitting: true,
  inlineDynamicImports: true,
  plugins: [
    includePaths({
      paths: ['node_modules'],
      extensions: ['.js'],
    }),
    terser(), // minify
    filesize(),
  ],
}];

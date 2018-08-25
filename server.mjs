'use strict';

// import fs from 'fs';
// import url from 'url';
// const URL = url.URL;
import express from 'express';
// import firebaseAdmin from 'firebase-admin';
import nunjucks from 'nunjucks';

/* eslint-disable */
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  console.error('errorHandler', err);
  res.status(500).send({errors: `${err}`});
}
/* eslint-enable */

const PORT = process.env.PORT || 8080;
// const GA_ACCOUNT = 'UA-114816386-1';
const app = express();

nunjucks.configure(['./templates'], {
  autoescape: true,
  express: app,
  watch: process.env.DEV || false,
});

app.use(function forceSSL(req, res, next) {
  const fromCron = req.get('X-Appengine-Cron');
  if (!fromCron && req.hostname !== 'localhost' && req.get('X-Forwarded-Proto') === 'http') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  next();
});

// app.use(function enableCors(req, res, next) {
//   res.set('Access-Control-Allow-Origin', '*');
//   res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
//   next();
// });


// app.get('/:demoPage', (req, res, next) => {
//   // const demoPage = req.params.demoPage;
//   // console.log(demoPage)
//   res.send(fs.readFileSync('./public/index.html', {encoding: 'utf-8'}));
// });

// Try resource as static, first.
app.use(express.static('public', {extensions: ['html', 'htm']}));
// app.use(express.static('node_modules'));

// Handle / dynamically.
app.get('/', (req, res, next) => {
  return res.render(`pages/index.html`);//, {title: 'Posts'});
});

app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  // res.send(fs.readFileSync('./public/index.html', {encoding: 'utf-8'}));
  return res.render(`pages/${page}.html`);//, {title: 'Posts'});
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`); /* eslint-disable-line */
  console.log('Press Ctrl+C to quit.'); /* eslint-disable-line */
});


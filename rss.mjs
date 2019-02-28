import url from 'url';
const URL = url.URL;
import RSS from 'rss';

class RSSFeed {

  constructor(feedUrl) {
    this.feedUrl = feedUrl;
  }

  create(posts) {
    const siteOrigin = new URL(this.feedUrl).origin;
    const feed = new RSS({
      /* eslint-disable camelcase */
      title: 'Eric Bidelman',
      description: 'Posts from Eric Bidelman',
      feed_url: this.feedUrl,
      site_url: siteOrigin,
      image_url: `${siteOrigin}/img/icon_400x400.png`,
      pubDate: new Date(),
      ttl: 180,// mins for feed to be cached.
      // custom_namespaces: {
      //   content: 'http://purl.org/rss/1.0/modules/content/'
      // }
    });

    posts.forEach(post => {
      const url = post.href.startsWith('http') ? post.href :  `${siteOrigin}${post.href}`;
      feed.item({
        title: post.data.title,
        description: post.excerpt,
        author: 'Eric Bidelman',
        url,
        date: post.data.published,
        //custom_elements: [{'content:encoded': JSON.stringify(pwa)}]
      });
    });
    /* eslint-enable camelcase */

    return feed.xml({indent: true});
  }
}

export default RSSFeed;

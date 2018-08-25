Site: [https://ebidel.com/](ebidel.com)

### Development

Get the code:

    git clone https://github.com/ebidel/blog --recursive
    cd blog
    yarn install

Start up the App Engine dev server. Run `gulp` any time you make changes to JS code.

### Deployment

    ./scripts/deploy.sh 2017-01-01

### Updating the SSL cert

From https://github.com/AirConsole/letsencrypt:

1. Go to [https://ebidel.com/.well-known/acme-challenge/](https://ebidel.com/.well-known/acme-challenge/) and login as an administrator
2. Execute the displayed command in a shell that supports curl and openssl (Google Cloud Shell can be used)
Upload the obtained certificates on [https://console.cloud.google.com/appengine/settings/certificates](https://console.cloud.google.com/appengine/settings/certificates)

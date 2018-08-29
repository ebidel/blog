Site: [https://ericbidelman.com/](ericbidelman.com)

### Development

Get the code:

    git clone https://github.com/ebidel/blog --recursive
    cd blog
    yarn install

To run, start the server. The `env` variable `DEV=true` will recompile
nunjucks templates as edits are made and server the unminified JS/CSS files.

   yarn start
   DEV=true yarn start

Run `gulp` any time you make changes to JS code.

### Deployment

    yarn deploy

### Updating the SSL cert

From https://github.com/AirConsole/letsencrypt:

1. Go to [https://ericbidelman.com/.well-known/acme-challenge/](https://ericbidelman.com/.well-known/acme-challenge/) and login as an administrator
2. Execute the displayed command in a shell that supports curl and openssl (Google Cloud Shell can be used)
Upload the obtained certificates on [https://console.cloud.google.com/appengine/settings/certificates](https://console.cloud.google.com/appengine/settings/certificates)

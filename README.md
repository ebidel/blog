Site: [ericbidelman.com](https://ericbidelman.com/)

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

Ensure you've [installed](https://cloud.google.com/sdk/docs/install) the `gcloud` CLI, then run:

    yarn deploy

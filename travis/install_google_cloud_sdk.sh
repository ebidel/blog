#!/bin/bash
set -e

# Installs the Google Cloud SDK

# Decrypt the Service Account Key
openssl aes-256-cbc -K $encrypted_d85b971e2c22_key -iv $encrypted_d85b971e2c22_iv \
    -in serviceAccount.json.enc -out serviceAccount.json -d

# Download & install the Google Cloud SDK
curl https://sdk.cloud.google.com | bash

# Update any necessary components
$HOME/google-cloud-sdk/bin/gcloud components update -q

# Set the AppEngine App ID to $GAE_APP_ID
$HOME/google-cloud-sdk/bin/gcloud config set project $GAE_APP_ID

# Authenticate to AppEngine using the service account
$HOME/google-cloud-sdk/bin/gcloud auth activate-service-account \
    --key-file serviceAccount.json
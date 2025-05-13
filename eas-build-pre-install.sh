#!/bin/bash

# Decode the base64 environment variable to google-services.json
echo $GOOGLE_SERVICES_JSON_BASE64 | base64 --decode > google-services.json

echo "Created google-services.json"
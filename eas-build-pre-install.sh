#!/bin/bash

# Decode the base64 environment variable to google-services.json, removing spaces and newlines
echo "$GOOGLE_SERVICES_JSON_BASE64" | tr -d '\n ' | base64 -d > google-services.json

echo "Created google-services.json"
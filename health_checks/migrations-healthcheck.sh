#!/bin/bash
url="http://localhost"

# Run wget and capture the HTTP status code
http_status=$(wget --spider --server-response -O /dev/null "$url" 2>&1 | awk '/HTTP\/1.1/ {print $2}')

# Check if the status code is 404
if [ "$http_status" = "404" ]; then
  exit 0  # Return exit code 0 for HTTP 404
else
  exit 1  # Return a non-zero exit code for other status codes
fi
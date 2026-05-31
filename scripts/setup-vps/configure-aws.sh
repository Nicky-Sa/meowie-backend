#!/bin/bash

# Catch missing environment variables immediately
if [ -z "$AWS_KEY" ] || [ -z "$AWS_SECRET" ] || [ -z "$AWS_REGION" ]; then
    echo "❌ Error: Missing required environment variables."
    echo "Please export AWS_KEY, AWS_SECRET, and AWS_REGION before running this script."
    exit 1
fi

echo "🔐 Configuring AWS credentials..."

# Using 'set' configures AWS without triggering the interactive prompts
aws configure set aws_access_key_id "$AWS_KEY"
aws configure set aws_secret_access_key "$AWS_SECRET"
aws configure set default.region "$AWS_REGION"

echo "✅ AWS authentication complete! Your VPS is now connected to ECR."
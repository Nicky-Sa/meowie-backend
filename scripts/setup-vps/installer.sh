#!/bin/bash

echo "🔄 Updating system packages..."
sudo apt-get update -y

echo "🐳 Installing Docker..."
sudo apt-get install -y docker.io unzip curl
sudo systemctl start docker
sudo systemctl enable docker

# Add the ubuntu user to the docker group so the pipeline can run it without sudo
sudo usermod -aG docker ubuntu

echo "☁️ Installing AWS CLI v2..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Clean up installation files
rm -rf aws awscliv2.zip

echo "✅ Installation complete!"
#!/bin/bash

# Setup HTTPS with self-signed certificates for development

set -e

echo "🔒 Setting up HTTPS with self-signed certificates..."

# Install openssl if not present
if ! command -v openssl &> /dev/null; then
    echo "Installing openssl..."
    sudo yum install -y openssl
fi

# Create certificates directory
mkdir -p certs

# Generate self-signed certificate
echo "Generating self-signed SSL certificate..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/key.pem \
  -out certs/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Set proper permissions
chmod 600 certs/key.pem
chmod 644 certs/cert.pem

echo "✅ Certificates generated in ./certs/"
echo ""
echo "⚠️  Note: Self-signed certificates will show a security warning in browsers."
echo "    This is normal for development. Click 'Advanced' → 'Proceed to localhost'."
echo ""
echo "📝 Next steps:"
echo "   1. Update docker-compose.yml to mount certs and expose port 443"
echo "   2. Update frontend/nginx.conf for HTTPS"
echo "   3. Restart services"
echo ""
echo "Or use the provided docker-compose.https.yml"

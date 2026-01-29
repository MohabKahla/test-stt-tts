#!/bin/bash

# Setup production-ready HTTPS with Let's Encrypt SSL
# Requires a domain name pointed to your Lightsail server

set -e

echo "🔒 Setting up production HTTPS with Let's Encrypt..."
echo ""
echo "⚠️  Prerequisites:"
echo "   1. You must own a domain (e.g., yourdomain.com)"
echo "   2. Create an A record pointing to your Lightsail public IP"
echo "   3. Port 80 and 443 must be open in Lightsail firewall"
echo ""

# Check if domain is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your domain name"
    echo "   Usage: ./setup-production-ssl.sh yourdomain.com"
    echo "   Usage: ./setup-production-ssl.sh test.yourdomain.com"
    exit 1
fi

DOMAIN=$1

echo "📝 Domain: $DOMAIN"
echo ""

# Install certbot
echo "📦 Installing certbot..."
sudo yum install -y certbot

# Stop nginx if running
echo "🛑 Stopping services..."
docker-compose -f docker-compose.https.yml down 2>/dev/null || true

# Generate certificate
echo "🔐 Generating Let's Encrypt certificate..."
sudo certbot certonly --standalone \
  -d $DOMAIN \
  --email admin@$DOMAIN \
  --agree-tos \
  --non-interactive

# Copy certificates
echo "📋 Copying certificates..."
mkdir -p certs
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem certs/cert.pem
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem certs/key.pem
sudo chown $(whoami):$(whoami) certs/*.pem

# Create auto-renewal cron job
echo "⏰ Setting up certificate auto-renewal..."
(crontab -l 2>/dev/null; echo "0 0 * * 0 certbot renew --quiet && docker-compose -f /home/ec2-user/test-stt-tts/docker-compose.https.yml restart") | crontab -

echo ""
echo "✅ SSL certificate installed successfully!"
echo ""
echo "📝 Certificate location: /etc/letsencrypt/live/$DOMAIN/"
echo "🔄 Auto-renewal: Configured (runs weekly)"
echo ""
echo "🚀 Next steps:"
echo "   1. Start services: docker-compose -f docker-compose.https.yml up -d"
echo "   2. Access at: https://$DOMAIN"
echo ""
echo "⏳ Certificate expires in 90 days (auto-renews weekly)"

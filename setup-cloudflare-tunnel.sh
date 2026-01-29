#!/bin/bash

# Setup Cloudflare Tunnel for free HTTPS access
# No domain required - generates a random .trycloudflare.com URL

set -e

echo "🌐 Setting up Cloudflare Tunnel for HTTPS access..."
echo ""

# Install cloudflared if not present
if ! command -v cloudflared &> /dev/null; then
    echo "📦 Installing cloudflared..."
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
    sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
    sudo chmod +x /usr/local/bin/cloudflared
    echo "✅ cloudflared installed"
else
    echo "✅ cloudflared already installed"
fi

echo ""
echo "🚀 Starting Cloudflare Tunnel..."
echo ""
echo "Your HTTPS URL will appear below:"
echo "-----------------------------------"

# Start tunnel in background with logging
nohup cloudflared tunnel --url http://localhost:3000 > cloudflare-tunnel.log 2>&1 &

# Save the PID
TUNNEL_PID=$!
echo $TUNNEL_PID > cloudflare-tunnel.pid

# Wait a moment for tunnel to start
sleep 3

# Display the URL
echo ""
echo "🔗 Tunnel started! Your URL is:"
tail -n 20 cloudflare-tunnel.log | grep -o "https://.*\.trycloudflare\.com" | head -1

echo ""
echo "📝 Tunnel is running in background (PID: $TUNNEL_PID)"
echo ""
echo "📋 Useful commands:"
echo "   View URL:  tail -f cloudflare-tunnel.log"
echo "   Stop:      kill \$(cat cloudflare-tunnel.pid)"
echo "   Restart:   ./setup-cloudflare-tunnel.sh"
echo ""
echo "⚠️  Note: The URL will change if you restart the tunnel"
echo "    Save the URL above for your client!"
echo ""
echo "✅ Setup complete! Send the HTTPS URL to your client."

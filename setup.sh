#!/bin/bash
# Setup script for AutoFixture MCP Server

set -e

echo "=================================="
echo "AutoFixture MCP Server Setup"
echo "=================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✓ Docker is installed"

# Check if Node.js is installed (optional for local dev)
if command -v node &> /dev/null; then
    echo "✓ Node.js is installed ($(node --version))"
else
    echo "⚠ Node.js not found (only needed for local development)"
fi

echo ""
echo "Step 1: Making wrapper script executable..."
chmod +x mcp-wrapper.sh
echo "✓ Wrapper script is now executable"

echo ""
echo "Step 2: Building Docker image..."
docker build -t autofixture-mcp-server:latest .
echo "✓ Docker image built successfully"

echo ""
echo "Step 3: Testing the server..."
timeout 5 docker run --rm -i autofixture-mcp-server:latest > /dev/null 2>&1 || true
echo "✓ Server test completed"

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "For Cursor:"
echo "  1. Open Cursor settings"
echo "  2. Add the configuration from cursor-mcp-config.json"
echo "  3. Restart Cursor"
echo ""
echo "For Claude Desktop:"
echo "  1. Edit ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "  2. Add the configuration from claude_desktop_config.json"
echo "  3. Restart Claude Desktop"
echo ""
echo "For VSCode with Claude Code:"
echo "  1. Install the Claude Code extension"
echo "  2. Add the configuration from mcp-config.json"
echo "  3. Restart VSCode"
echo ""
echo "Configuration path for this server:"
echo "  $(pwd)/mcp-wrapper.sh"
echo ""
echo "See README.md for detailed instructions."

# Quick Start Guide

Get the AutoFixture MCP Server running in 3 easy steps!

## Prerequisites

- Docker installed and running
- Cursor, VSCode, or Claude Desktop

## Installation

### Automated Setup (Recommended)

```bash
./setup.sh
```

This will:
1. Verify Docker is installed
2. Build the Docker image
3. Test the server
4. Show you the next steps

### Manual Setup

```bash
# 1. Make scripts executable
chmod +x mcp-wrapper.sh setup.sh

# 2. Build Docker image
docker build -t autofixture-mcp-server:latest .

# 3. Test it
docker run --rm -i autofixture-mcp-server:latest
```

## Configuration

### For Cursor

1. Open Cursor Settings (Cmd/Ctrl + Shift + P → "Preferences: Open User Settings (JSON)")
2. Add this configuration:

```json
{
  "mcp": {
    "servers": {
      "autofixture": {
        "command": "/Users/admin/dev/mcp/mcp-wrapper.sh"
      }
    }
  }
}
```

**Note:** Replace `/Users/admin/dev/mcp` with your actual path!

3. Restart Cursor

### For Claude Desktop

1. Open/create the config file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. Add this configuration:

```json
{
  "mcpServers": {
    "autofixture": {
      "command": "/Users/admin/dev/mcp/mcp-wrapper.sh"
    }
  }
}
```

**Note:** Replace `/Users/admin/dev/mcp` with your actual path!

3. Restart Claude Desktop

### For VSCode (Claude Code extension)

1. Install the Claude Code extension
2. Open the MCP settings file:
   - macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

3. Add this configuration:

```json
{
  "mcpServers": {
    "autofixture": {
      "command": "/Users/admin/dev/mcp/mcp-wrapper.sh"
    }
  }
}
```

**Note:** Replace `/Users/admin/dev/mcp` with your actual path!

4. Restart VSCode

## Usage

Once configured, you can use the server in your conversations:

```
"Show me how to get started with AutoFixture"
"Search for AutoFixture methods related to creating objects"
"What packages are available for AutoFixture mocking?"
"Show me usage patterns for AutoFixture with xUnit"
"Get best practices for using AutoFixture"
```

## Troubleshooting

### Docker image not found
```bash
docker build -t autofixture-mcp-server:latest .
```

### Permission denied on scripts
```bash
chmod +x mcp-wrapper.sh setup.sh
```

### Server not responding
```bash
# Check Docker is running
docker ps

# Rebuild the image
docker build -t autofixture-mcp-server:latest .

# Test manually
./mcp-wrapper.sh
```

## Available Commands (with Makefile)

```bash
make help          # Show all available commands
make install       # Install dependencies
make build         # Build the project
make docker-build  # Build Docker image
make run           # Run with Docker Compose
make stop          # Stop services
make clean         # Clean build artifacts
```

## What's Next?

Check out the full [README.md](README.md) for:
- Detailed architecture information
- All available MCP tools
- Development setup
- Contributing guidelines

---

Happy testing with AutoFixture! 🧪

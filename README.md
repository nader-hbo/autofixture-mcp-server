# AutoFixture MCP Server

A Model Context Protocol (MCP) server that provides comprehensive documentation and usage examples for the [AutoFixture](https://github.com/AutoFixture/AutoFixture) testing library. This server runs in a Docker container and can be easily integrated with VSCode, Cursor, or Claude Desktop.

## Features

- **Quick Start Guide**: Get up and running with AutoFixture basics
- **Method Search**: Search for specific AutoFixture methods and their usage
- **Class Information**: Detailed documentation for core AutoFixture classes
- **Package Information**: NuGet package details for all AutoFixture extensions
- **Usage Patterns**: Common patterns and code examples
- **Best Practices**: Recommended approaches for using AutoFixture
- **GitHub Documentation**: Fetch latest docs directly from the repository

## Available Tools

1. **get_quick_start**: Get AutoFixture quick start guide and basic usage examples
2. **search_methods**: Search for AutoFixture methods (e.g., 'Create', 'Build', 'Freeze')
3. **get_class_info**: Get detailed information about classes like 'Fixture' or 'IFixture'
4. **get_packages**: List AutoFixture NuGet packages by category (core/mocking/testing/all)
5. **get_usage_pattern**: Get common usage patterns (e.g., 'customizing', 'automaq', 'xunit')
6. **get_best_practices**: Get AutoFixture best practices and recommendations
7. **fetch_github_docs**: Fetch latest documentation from GitHub (README, cheatsheet, FAQ)

## Prerequisites

- Docker installed on your system
- Node.js 20+ (for local development)
- VSCode, Cursor, or Claude Desktop

## Quick Setup

### Option 1: Using Docker (Recommended)

1. **Build the Docker image:**
   ```bash
   docker build -t autofixture-mcp-server:latest .
   ```

2. **Test the server:**
   ```bash
   docker run --rm -i autofixture-mcp-server:latest
   ```

### Option 2: Using Docker Compose

```bash
docker-compose up -d
```

## Integration with Cursor/VSCode

### Cursor Setup

1. Open Cursor settings (Cmd+Shift+P → "Preferences: Open User Settings (JSON)")
2. Add the MCP server configuration:

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

Or use the provided config file:
```bash
# Copy the configuration
cat cursor-mcp-config.json
# Add to your Cursor settings
```

### VSCode with Claude Code

1. Install the Claude Code extension
2. Open your MCP configuration file:
   - On macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - On Linux: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
   - On Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

3. Add the server configuration:
```json
{
  "mcpServers": {
    "autofixture": {
      "command": "/Users/admin/dev/mcp/mcp-wrapper.sh",
      "args": [],
      "env": {}
    }
  }
}
```

### Claude Desktop Setup

1. Open Claude Desktop settings:
   - On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - On Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - On Linux: `~/.config/Claude/claude_desktop_config.json`

2. Add the server configuration:
```json
{
  "mcpServers": {
    "autofixture": {
      "command": "/Users/admin/dev/mcp/mcp-wrapper.sh",
      "args": [],
      "env": {}
    }
  }
}
```

3. Restart Claude Desktop

## Local Development Setup

If you want to develop or modify the server locally:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Run locally (without Docker):**
   ```bash
   npm start
   ```

4. **Development mode with auto-rebuild:**
   ```bash
   npm run dev
   ```

## Usage Examples

Once integrated, you can use the MCP server in your conversations:

### Example 1: Getting Started
```
User: "Use the autofixture MCP to show me how to get started with AutoFixture"
AI: [Calls get_quick_start tool and provides quick start guide]
```

### Example 2: Searching for Methods
```
User: "Search for methods related to creating objects in AutoFixture"
AI: [Calls search_methods with query "create" and shows available methods]
```

### Example 3: Getting Usage Patterns
```
User: "Show me how to use AutoFixture with xUnit"
AI: [Calls get_usage_pattern with pattern "xunit" and provides examples]
```

### Example 4: Package Information
```
User: "What AutoFixture packages are available for mocking?"
AI: [Calls get_packages with category "mocking" and lists all mocking packages]
```

## Configuration Files

- `mcp-config.json`: Generic MCP configuration
- `cursor-mcp-config.json`: Cursor-specific configuration
- `claude_desktop_config.json`: Claude Desktop configuration
- `docker-compose.yml`: Docker Compose configuration
- `mcp-wrapper.sh`: Shell script wrapper for Docker integration

## Troubleshooting

### Server not starting
- Ensure Docker is running: `docker ps`
- Check Docker logs: `docker logs autofixture-mcp-server`
- Rebuild the image: `docker build -t autofixture-mcp-server:latest .`

### Permission issues with wrapper script
```bash
chmod +x mcp-wrapper.sh
```

### Cursor/VSCode not detecting the server
- Restart the editor after adding configuration
- Check that the wrapper script path is absolute
- Verify Docker is installed: `docker --version`

### Testing the server manually
```bash
# Run the wrapper script directly
./mcp-wrapper.sh

# Or use Docker directly
docker run --rm -i autofixture-mcp-server:latest
```

## Project Structure

```
.
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript (generated)
├── Dockerfile            # Docker image configuration
├── docker-compose.yml    # Docker Compose setup
├── mcp-wrapper.sh        # Shell wrapper for Docker
├── package.json          # Node.js dependencies
├── tsconfig.json         # TypeScript configuration
├── mcp-config.json       # Generic MCP config
├── cursor-mcp-config.json # Cursor-specific config
├── claude_desktop_config.json # Claude Desktop config
└── README.md             # This file
```

## Architecture

The server is built using:
- **TypeScript**: Type-safe server implementation
- **@modelcontextprotocol/sdk**: Official MCP SDK
- **axios**: HTTP client for fetching GitHub documentation
- **cheerio**: HTML parsing (for future enhancements)
- **Docker**: Containerization for easy deployment

## Contributing

Feel free to extend the server with additional tools:
1. Add new tool definitions in the `ListToolsRequestSchema` handler
2. Implement the tool logic in the `CallToolRequestSchema` handler
3. Rebuild the Docker image

## License

MIT

## Resources

- [AutoFixture GitHub Repository](https://github.com/AutoFixture/AutoFixture)
- [AutoFixture Documentation](https://autofixture.github.io)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)

## Version

1.0.0

---

Built with MCP for enhanced AI-assisted development with AutoFixture.

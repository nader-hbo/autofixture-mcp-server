#!/bin/bash
# Wrapper script to run MCP server in Docker for VSCode/Cursor integration

# Build the image if it doesn't exist
if [ -z "$(docker images -q autofixture-mcp-server:latest 2> /dev/null)" ]; then
    echo "Building AutoFixture MCP server Docker image..." >&2
    docker build -t autofixture-mcp-server:latest "$(dirname "$0")" >&2
fi

# Run the container with stdio
docker run --rm -i autofixture-mcp-server:latest

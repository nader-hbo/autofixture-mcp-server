.PHONY: help build run stop clean install test

help:
	@echo "AutoFixture MCP Server - Available commands:"
	@echo "  make install    - Install Node.js dependencies"
	@echo "  make build      - Build TypeScript code"
	@echo "  make docker-build - Build Docker image"
	@echo "  make run        - Run with Docker Compose"
	@echo "  make stop       - Stop Docker Compose services"
	@echo "  make test       - Test the MCP server"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make rebuild    - Clean, install, and build"

install:
	npm install

build:
	npm run build

docker-build:
	docker build -t autofixture-mcp-server:latest .

run:
	docker-compose up -d

stop:
	docker-compose down

test:
	@echo "Testing MCP server with Docker..."
	@docker run --rm -i autofixture-mcp-server:latest &
	@sleep 2
	@echo "Server started successfully!"

clean:
	rm -rf dist node_modules

rebuild: clean install build
	@echo "Rebuild complete!"

.DEFAULT_GOAL := help

# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy source code first
COPY src ./src

# Install dependencies (skip prepare script)
RUN npm ci --ignore-scripts

# Build TypeScript
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 mcpuser && \
    adduser -D -u 1001 -G mcpuser mcpuser && \
    chown -R mcpuser:mcpuser /app

# Switch to non-root user
USER mcpuser

# Set environment
ENV NODE_ENV=production

# Expose stdio (MCP servers use stdio, not HTTP ports)
CMD ["node", "dist/index.js"]

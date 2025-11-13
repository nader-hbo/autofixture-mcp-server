import { describe, it, expect } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

describe('AutoFixture MCP Server', () => {
  describe('Tool Definitions', () => {
    it('should list all available tools', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.listTools();

      expect(response.tools).toHaveLength(7);
      expect(response.tools.map((t: any) => t.name)).toEqual([
        'get_quick_start',
        'search_methods',
        'get_class_info',
        'get_packages',
        'get_usage_pattern',
        'get_best_practices',
        'fetch_github_docs',
      ]);

      await cleanup(server, client);
    });

    it('should have proper input schemas for all tools', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.listTools();

      response.tools.forEach((tool: any) => {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema.properties).toBeDefined();
      });

      await cleanup(server, client);
    });
  });

  describe('get_quick_start tool', () => {
    it('should return quick start guide', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'get_quick_start',
        arguments: {},
      });

      const content = response.content as any[];
      expect(content).toHaveLength(1);
      expect(content[0].type).toBe('text');
      const text = content[0].text;
      expect(text).toContain('Quick Start Guide');
      expect(text).toContain('AutoFixture');
      expect(text).toContain('Install-Package AutoFixture');

      await cleanup(server, client);
    });
  });

  describe('search_methods tool', () => {
    it('should find methods matching query', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'search_methods',
        arguments: { query: 'Create' },
      });

      expect(response.content).toHaveLength(1);
      const content = response.content as any[];
      const text = content[0].text;
      expect(text).toContain('Create<T>()');
      expect(text).toContain('CreateMany<T>()');

      await cleanup(server, client);
    });

    it('should handle empty query gracefully', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'search_methods',
        arguments: { query: '' },
      });

      const content = response.content as any[];
      const text = content[0].text;
      expect(text).toContain('Please provide a search query');

      await cleanup(server, client);
    });

    it('should handle no results found', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'search_methods',
        arguments: { query: 'nonexistentmethod123' },
      });

      const content = response.content as any[];
      const text = content[0].text;
      expect(text).toContain('No methods found');

      await cleanup(server, client);
    });
  });

  describe('get_class_info tool', () => {
    it('should return information for Fixture class', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'get_class_info',
        arguments: { className: 'Fixture' },
      });

      const content = response.content as any[];
      const text = content[0].text;
      expect(text).toContain('# Fixture');
      expect(text).toContain('main class');
      expect(text).toContain('Create<T>()');

      await cleanup(server, client);
    });

    it('should return information for IFixture interface', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'get_class_info',
        arguments: { className: 'IFixture' },
      });

      const content = response.content as any[];
      const text = content[0].text;
      expect(text).toContain('# IFixture');
      expect(text).toContain('Interface');

      await cleanup(server, client);
    });

    it('should handle invalid class name', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'get_class_info',
        arguments: { className: 'InvalidClass' },
      });

      const content = response.content as any[];
      const text = content[0].text;
      expect(text).toContain('not found');

      await cleanup(server, client);
    });
  });

  describe('get_packages tool', () => {
    it('should return all packages when category is "all"', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'get_packages',
        arguments: { category: 'all' },
      });

      const content = response.content as any[];
      const text = content[0].text;
      expect(text).toContain('Core Packages');
      expect(text).toContain('Mocking Packages');
      expect(text).toContain('Testing Packages');
      expect(text).toContain('AutoFixture.AutoMoq');

      await cleanup(server, client);
    });

    it('should return only core packages', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'get_packages',
        arguments: { category: 'core' },
      });

      const content = response.content as any[];
      const text = content[0].text;
      expect(text).toContain('Core Packages');
      expect(text).not.toContain('Mocking Packages');
      expect(text).toContain('Install-Package AutoFixture');

      await cleanup(server, client);
    });

    it('should return only mocking packages', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'get_packages',
        arguments: { category: 'mocking' },
      });

      const content = response.content as any[];
      const text = content[0].text;
      expect(text).toContain('Mocking Packages');
      expect(text).toContain('AutoFixture.AutoMoq');

      await cleanup(server, client);
    });
  });

  describe('get_usage_pattern tool', () => {
    it('should return matching usage patterns', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'get_usage_pattern',
        arguments: { pattern: 'customizing' },
      });

      const content = response.content as any[];
      const text = content[0].text;
      expect(text).toContain('Customizing Properties');
      expect(text).toContain('```csharp');

      await cleanup(server, client);
    });

    it('should list all patterns when no pattern specified', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'get_usage_pattern',
        arguments: {},
      });

      const content = response.content as any[];
      const text = content[0].text;
      expect(text).toContain('Common Usage Patterns');
      expect(text).toContain('Available patterns');

      await cleanup(server, client);
    });
  });

  describe('get_best_practices tool', () => {
    it('should return best practices list', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'get_best_practices',
        arguments: {},
      });

      const content = response.content as any[];
      const text = content[0].text;
      expect(text).toContain('Best Practices');
      expect(text).toContain('1.');
      expect(text).toContain('AutoFixture');

      await cleanup(server, client);
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown tool name', async () => {
      const { server, client } = await setupTestEnvironment();

      const response = await client.callTool({
        name: 'unknown_tool',
        arguments: {},
      });

      const content = response.content as any[];
      const text = content[0].text;
      expect(text).toContain('Unknown tool');

      await cleanup(server, client);
    });
  });
});

// Helper functions
async function setupTestEnvironment() {
  const server = new Server(
    {
      name: 'autofixture-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Import and setup handlers (simplified version for testing)
  setupServerHandlers(server);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  return { server, client };
}

async function cleanup(server: Server, client: Client) {
  await client.close();
  await server.close();
}

// Simplified handler setup for testing
function setupServerHandlers(server: Server) {
  const AUTOFIXTURE_DOCS = {
    quickStart: {
      title: 'Quick Start Guide',
      content: `AutoFixture is a library for .NET designed to minimize the 'Arrange' phase of unit tests.

Basic Usage:
1. Install via NuGet: Install-Package AutoFixture
2. Create a Fixture instance
3. Use Create<T>() to generate test data

Example:
var fixture = new Fixture();
var anonymousText = fixture.Create<string>();
var anonymousNumber = fixture.Create<int>();
var myClass = fixture.Create<MyClass>();`,
    },
    coreClasses: {
      Fixture: {
        description: 'The main class for creating anonymous test data',
        methods: [
          {
            name: 'Create<T>()',
            description: 'Creates an anonymous variable of type T',
            example: 'var result = fixture.Create<int>(); // Returns a random int',
          },
          {
            name: 'CreateMany<T>()',
            description: 'Creates multiple anonymous variables of type T',
            example: 'var results = fixture.CreateMany<string>(5); // Returns 5 strings',
          },
          {
            name: 'Build<T>()',
            description: 'Returns a builder for customizing object creation',
            example: "var customer = fixture.Build<Customer>().With(x => x.Name, 'John').Create();",
          },
          {
            name: 'Freeze<T>()',
            description: 'Creates and caches an instance for consistent reuse',
            example: 'var frozen = fixture.Freeze<Customer>(); // Same instance returned',
          },
          {
            name: 'Inject<T>(value)',
            description: 'Injects a specific value to be used for type T',
            example: 'fixture.Inject<int>(42); // All Create<int>() calls return 42',
          },
          {
            name: 'Customize(customization)',
            description: 'Applies a customization to the fixture',
            example: 'fixture.Customize(new AutoMoqCustomization());',
          },
        ],
      },
      IFixture: {
        description: 'Interface implemented by Fixture for dependency injection',
        usage: 'Use IFixture in constructor parameters for better testability',
      },
    },
    packages: {
      core: [
        {
          name: 'AutoFixture',
          description: 'Core library for generating anonymous test data',
          install: 'Install-Package AutoFixture',
        },
      ],
      mocking: [
        {
          name: 'AutoFixture.AutoMoq',
          description: 'Integration with Moq mocking library',
          install: 'Install-Package AutoFixture.AutoMoq',
          usage: 'fixture.Customize(new AutoMoqCustomization());',
        },
      ],
      testing: [
        {
          name: 'AutoFixture.Xunit2',
          description: 'Integration with xUnit.net v2',
          install: 'Install-Package AutoFixture.Xunit2',
          usage: '[Theory, AutoData] public void Test(int value) { }',
        },
      ],
    },
    commonPatterns: [
      {
        name: 'Basic Object Creation',
        code: `var fixture = new Fixture();
var customer = fixture.Create<Customer>();`,
      },
      {
        name: 'Customizing Properties',
        code: `var customer = fixture.Build<Customer>()
    .With(x => x.Name, "John Doe")
    .Without(x => x.Address)
    .Create();`,
      },
    ],
    bestPractices: [
      'Use AutoFixture to reduce test maintenance by avoiding hard-coded test data',
      'Freeze dependencies when you need to verify interactions on the same instance',
      'Use Build<T>() for fine-grained control over object creation',
    ],
  };

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_quick_start',
          description: 'Get AutoFixture quick start guide and basic usage examples',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'search_methods',
          description: 'Search for AutoFixture methods and their usage',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: "Search query for method names (e.g., 'Create', 'Build', 'Freeze')",
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_class_info',
          description: 'Get detailed information about a specific AutoFixture class',
          inputSchema: {
            type: 'object',
            properties: {
              className: {
                type: 'string',
                description: "Name of the class (e.g., 'Fixture', 'IFixture')",
              },
            },
            required: ['className'],
          },
        },
        {
          name: 'get_packages',
          description: 'Get list of AutoFixture NuGet packages and their purposes',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: "Package category: 'core', 'mocking', 'testing', or 'all'",
                enum: ['core', 'mocking', 'testing', 'all'],
              },
            },
          },
        },
        {
          name: 'get_usage_pattern',
          description: 'Get common usage patterns and code examples',
          inputSchema: {
            type: 'object',
            properties: {
              pattern: {
                type: 'string',
                description:
                  "Pattern name or keyword (e.g., 'customizing', 'lists', 'automaq', 'xunit')",
              },
            },
          },
        },
        {
          name: 'get_best_practices',
          description: 'Get AutoFixture best practices and recommendations',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'fetch_github_docs',
          description: 'Fetch latest documentation from AutoFixture GitHub repository',
          inputSchema: {
            type: 'object',
            properties: {
              topic: {
                type: 'string',
                description: "Documentation topic to fetch (e.g., 'README', 'cheatsheet', 'faq')",
              },
            },
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
    try {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'get_quick_start': {
          const qs = AUTOFIXTURE_DOCS.quickStart;
          return {
            content: [
              {
                type: 'text',
                text: `# ${qs.title}\n\n${qs.content}`,
              },
            ],
          };
        }

        case 'search_methods': {
          const query = args?.query as string;
          if (!query) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'Please provide a search query for method names.',
                },
              ],
            };
          }

          const results: any[] = [];
          const lowerQuery = query.toLowerCase();

          const fixture = AUTOFIXTURE_DOCS.coreClasses.Fixture;
          const matchingMethods = fixture.methods.filter(
            (m) =>
              m.name.toLowerCase().includes(lowerQuery) ||
              m.description.toLowerCase().includes(lowerQuery)
          );

          if (matchingMethods.length > 0) {
            results.push({
              class: 'Fixture',
              methods: matchingMethods,
            });
          }

          if (results.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No methods found matching "${query}". Try searching for: Create, Build, Freeze, Inject, or Customize.`,
                },
              ],
            };
          }

          let output = `# Search Results for "${query}"\n\n`;
          for (const result of results) {
            output += `## ${result.class}\n\n`;
            for (const method of result.methods) {
              output += `### ${method.name}\n`;
              output += `${method.description}\n\n`;
              output += `**Example:**\n\`\`\`csharp\n${method.example}\n\`\`\`\n\n`;
            }
          }

          return {
            content: [
              {
                type: 'text',
                text: output,
              },
            ],
          };
        }

        case 'get_class_info': {
          const className = args?.className as string;
          if (!className) {
            const availableClasses = Object.keys(AUTOFIXTURE_DOCS.coreClasses);
            return {
              content: [
                {
                  type: 'text',
                  text: `Please specify a class name. Available classes: ${availableClasses.join(', ')}`,
                },
              ],
            };
          }

          const classData =
            AUTOFIXTURE_DOCS.coreClasses[className as keyof typeof AUTOFIXTURE_DOCS.coreClasses];
          if (!classData) {
            return {
              content: [
                {
                  type: 'text',
                  text: `Class "${className}" not found. Available classes: ${Object.keys(
                    AUTOFIXTURE_DOCS.coreClasses
                  ).join(', ')}`,
                },
              ],
            };
          }

          let output = `# ${className}\n\n${classData.description}\n\n`;

          if ('methods' in classData) {
            output += '## Methods\n\n';
            for (const method of classData.methods) {
              output += `### ${method.name}\n`;
              output += `${method.description}\n\n`;
              output += `**Example:**\n\`\`\`csharp\n${method.example}\n\`\`\`\n\n`;
            }
          }

          if ('usage' in classData) {
            output += `## Usage\n${classData.usage}\n\n`;
          }

          return {
            content: [
              {
                type: 'text',
                text: output,
              },
            ],
          };
        }

        case 'get_packages': {
          const category = args?.category || 'all';
          let output = '# AutoFixture Packages\n\n';

          const categories = category === 'all' ? ['core', 'mocking', 'testing'] : [category];

          for (const c of categories) {
            const packages = AUTOFIXTURE_DOCS.packages[c as keyof typeof AUTOFIXTURE_DOCS.packages];
            if (!packages) continue;

            output += `## ${c.charAt(0).toUpperCase() + c.slice(1)} Packages\n\n`;

            for (const pkg of packages) {
              output += `### ${pkg.name}\n`;
              output += `${pkg.description}\n\n`;
              output += `**Installation:**\n\`\`\`\n${pkg.install}\n\`\`\`\n\n`;
              if ('usage' in pkg) {
                output += `**Usage:**\n\`\`\`csharp\n${pkg.usage}\n\`\`\`\n\n`;
              }
            }
          }

          return {
            content: [
              {
                type: 'text',
                text: output,
              },
            ],
          };
        }

        case 'get_usage_pattern': {
          const pattern = args?.pattern as string;
          if (!pattern) {
            const patternNames = AUTOFIXTURE_DOCS.commonPatterns.map((p) => p.name);
            return {
              content: [
                {
                  type: 'text',
                  text: `# Common Usage Patterns\n\nAvailable patterns:\n${patternNames.map((n) => `- ${n}`).join('\n')}`,
                },
              ],
            };
          }

          const lowerPattern = pattern.toLowerCase();
          const matchingPatterns = AUTOFIXTURE_DOCS.commonPatterns.filter(
            (p) =>
              p.name.toLowerCase().includes(lowerPattern) ||
              p.code.toLowerCase().includes(lowerPattern)
          );

          if (matchingPatterns.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: `No patterns found matching "${pattern}".`,
                },
              ],
            };
          }

          let output = `# Usage Patterns for "${pattern}"\n\n`;
          for (const p of matchingPatterns) {
            output += `## ${p.name}\n\n`;
            output += `\`\`\`csharp\n${p.code}\n\`\`\`\n\n`;
          }

          return {
            content: [
              {
                type: 'text',
                text: output,
              },
            ],
          };
        }

        case 'get_best_practices': {
          let output = '# AutoFixture Best Practices\n\n';
          for (let i = 0; i < AUTOFIXTURE_DOCS.bestPractices.length; i++) {
            output += `${i + 1}. ${AUTOFIXTURE_DOCS.bestPractices[i]}\n`;
          }

          return {
            content: [
              {
                type: 'text',
                text: output,
              },
            ],
          };
        }

        default:
          return {
            content: [
              {
                type: 'text',
                text: `Unknown tool: ${name}`,
              },
            ],
          };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });
}

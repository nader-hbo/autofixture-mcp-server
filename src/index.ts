#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import * as cheerio from "cheerio";

// AutoFixture documentation and API reference data
const AUTOFIXTURE_DOCS = {
  quickStart: {
    title: "Quick Start Guide",
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
      description: "The main class for creating anonymous test data",
      methods: [
        {
          name: "Create<T>()",
          description: "Creates an anonymous variable of type T",
          example: "var result = fixture.Create<int>(); // Returns a random int",
        },
        {
          name: "CreateMany<T>()",
          description: "Creates multiple anonymous variables of type T",
          example: "var results = fixture.CreateMany<string>(5); // Returns 5 strings",
        },
        {
          name: "Build<T>()",
          description: "Returns a builder for customizing object creation",
          example: "var customer = fixture.Build<Customer>().With(x => x.Name, 'John').Create();",
        },
        {
          name: "Freeze<T>()",
          description: "Creates and caches an instance for consistent reuse",
          example: "var frozen = fixture.Freeze<Customer>(); // Same instance returned",
        },
        {
          name: "Inject<T>(value)",
          description: "Injects a specific value to be used for type T",
          example: "fixture.Inject<int>(42); // All Create<int>() calls return 42",
        },
        {
          name: "Customize(customization)",
          description: "Applies a customization to the fixture",
          example: "fixture.Customize(new AutoMoqCustomization());",
        },
      ],
    },
    IFixture: {
      description: "Interface implemented by Fixture for dependency injection",
      usage: "Use IFixture in constructor parameters for better testability",
    },
  },
  packages: {
    core: [
      {
        name: "AutoFixture",
        description: "Core library for generating anonymous test data",
        install: "Install-Package AutoFixture",
      },
      {
        name: "AutoFixture.SeedExtensions",
        description: "Extensions for seeding data generation",
        install: "Install-Package AutoFixture.SeedExtensions",
      },
      {
        name: "AutoFixture.Idioms",
        description: "Assertions for testing code idioms",
        install: "Install-Package AutoFixture.Idioms",
      },
    ],
    mocking: [
      {
        name: "AutoFixture.AutoMoq",
        description: "Integration with Moq mocking library",
        install: "Install-Package AutoFixture.AutoMoq",
        usage: "fixture.Customize(new AutoMoqCustomization());",
      },
      {
        name: "AutoFixture.AutoNSubstitute",
        description: "Integration with NSubstitute mocking library",
        install: "Install-Package AutoFixture.AutoNSubstitute",
        usage: "fixture.Customize(new AutoNSubstituteCustomization());",
      },
      {
        name: "AutoFixture.AutoFakeItEasy",
        description: "Integration with FakeItEasy mocking library",
        install: "Install-Package AutoFixture.AutoFakeItEasy",
        usage: "fixture.Customize(new AutoFakeItEasyCustomization());",
      },
    ],
    testing: [
      {
        name: "AutoFixture.Xunit2",
        description: "Integration with xUnit.net v2",
        install: "Install-Package AutoFixture.Xunit2",
        usage: "[Theory, AutoData] public void Test(int value) { }",
      },
      {
        name: "AutoFixture.NUnit3",
        description: "Integration with NUnit v3",
        install: "Install-Package AutoFixture.NUnit3",
        usage: "[Test, AutoData] public void Test(int value) { }",
      },
    ],
  },
  commonPatterns: [
    {
      name: "Basic Object Creation",
      code: `var fixture = new Fixture();
var customer = fixture.Create<Customer>();`,
    },
    {
      name: "Customizing Properties",
      code: `var customer = fixture.Build<Customer>()
    .With(x => x.Name, "John Doe")
    .Without(x => x.Address)
    .Create();`,
    },
    {
      name: "Creating Lists",
      code: `var customers = fixture.CreateMany<Customer>(10).ToList();`,
    },
    {
      name: "Using AutoMoq",
      code: `var fixture = new Fixture()
    .Customize(new AutoMoqCustomization());
var service = fixture.Create<MyService>(); // Dependencies auto-mocked`,
    },
    {
      name: "Using with xUnit",
      code: `[Theory, AutoData]
public void Test_WithAutoData(int number, string text, Customer customer)
{
    // Parameters are automatically generated by AutoFixture
}`,
    },
    {
      name: "Freezing Instances",
      code: `var fixture = new Fixture();
var customer = fixture.Freeze<Customer>();
var order = fixture.Create<Order>(); // Order.Customer is same instance`,
    },
    {
      name: "Injecting Specific Values",
      code: `fixture.Inject<ILogger>(new ConsoleLogger());
var service = fixture.Create<MyService>(); // Uses ConsoleLogger`,
    },
  ],
  bestPractices: [
    "Use AutoFixture to reduce test maintenance by avoiding hard-coded test data",
    "Freeze dependencies when you need to verify interactions on the same instance",
    "Use Build<T>() for fine-grained control over object creation",
    "Combine AutoFixture with mocking libraries for comprehensive test setup",
    "Use [AutoData] attributes to simplify test method signatures",
    "Create custom ICustomization implementations for domain-specific test data",
  ],
};

class AutoFixtureServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "autofixture-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_quick_start",
            description: "Get AutoFixture quick start guide and basic usage examples",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "search_methods",
            description: "Search for AutoFixture methods and their usage",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query for method names (e.g., 'Create', 'Build', 'Freeze')",
                },
              },
              required: ["query"],
            },
          },
          {
            name: "get_class_info",
            description: "Get detailed information about a specific AutoFixture class",
            inputSchema: {
              type: "object",
              properties: {
                className: {
                  type: "string",
                  description: "Name of the class (e.g., 'Fixture', 'IFixture')",
                },
              },
              required: ["className"],
            },
          },
          {
            name: "get_packages",
            description: "Get list of AutoFixture NuGet packages and their purposes",
            inputSchema: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  description: "Package category: 'core', 'mocking', 'testing', or 'all'",
                  enum: ["core", "mocking", "testing", "all"],
                },
              },
            },
          },
          {
            name: "get_usage_pattern",
            description: "Get common usage patterns and code examples",
            inputSchema: {
              type: "object",
              properties: {
                pattern: {
                  type: "string",
                  description: "Pattern name or keyword (e.g., 'customizing', 'lists', 'automaq', 'xunit')",
                },
              },
            },
          },
          {
            name: "get_best_practices",
            description: "Get AutoFixture best practices and recommendations",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "fetch_github_docs",
            description: "Fetch latest documentation from AutoFixture GitHub repository",
            inputSchema: {
              type: "object",
              properties: {
                topic: {
                  type: "string",
                  description: "Documentation topic to fetch (e.g., 'README', 'cheatsheet', 'faq')",
                },
              },
            },
          },
        ] as Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case "get_quick_start":
            return this.getQuickStart();

          case "search_methods":
            return this.searchMethods(args?.query as string);

          case "get_class_info":
            return this.getClassInfo(args?.className as string);

          case "get_packages":
            return this.getPackages(args?.category as string);

          case "get_usage_pattern":
            return this.getUsagePattern(args?.pattern as string);

          case "get_best_practices":
            return this.getBestPractices();

          case "fetch_github_docs":
            return await this.fetchGitHubDocs(args?.topic as string);

          default:
            return {
              content: [
                {
                  type: "text",
                  text: `Unknown tool: ${name}`,
                },
              ],
            };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getQuickStart() {
    const qs = AUTOFIXTURE_DOCS.quickStart;
    return {
      content: [
        {
          type: "text",
          text: `# ${qs.title}\n\n${qs.content}`,
        },
      ],
    };
  }

  private searchMethods(query: string) {
    if (!query) {
      return {
        content: [
          {
            type: "text",
            text: "Please provide a search query for method names.",
          },
        ],
      };
    }

    const results: any[] = [];
    const lowerQuery = query.toLowerCase();

    // Search through Fixture methods
    const fixture = AUTOFIXTURE_DOCS.coreClasses.Fixture;
    const matchingMethods = fixture.methods.filter(
      (m) =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery)
    );

    if (matchingMethods.length > 0) {
      results.push({
        class: "Fixture",
        methods: matchingMethods,
      });
    }

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text",
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
          type: "text",
          text: output,
        },
      ],
    };
  }

  private getClassInfo(className: string) {
    if (!className) {
      const availableClasses = Object.keys(AUTOFIXTURE_DOCS.coreClasses);
      return {
        content: [
          {
            type: "text",
            text: `Please specify a class name. Available classes: ${availableClasses.join(", ")}`,
          },
        ],
      };
    }

    const classData = AUTOFIXTURE_DOCS.coreClasses[className as keyof typeof AUTOFIXTURE_DOCS.coreClasses];
    if (!classData) {
      return {
        content: [
          {
            type: "text",
            text: `Class "${className}" not found. Available classes: ${Object.keys(
              AUTOFIXTURE_DOCS.coreClasses
            ).join(", ")}`,
          },
        ],
      };
    }

    let output = `# ${className}\n\n${classData.description}\n\n`;

    if ("methods" in classData) {
      output += "## Methods\n\n";
      for (const method of classData.methods) {
        output += `### ${method.name}\n`;
        output += `${method.description}\n\n`;
        output += `**Example:**\n\`\`\`csharp\n${method.example}\n\`\`\`\n\n`;
      }
    }

    if ("usage" in classData) {
      output += `## Usage\n${classData.usage}\n\n`;
    }

    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
    };
  }

  private getPackages(category?: string) {
    const cat = category || "all";
    let output = "# AutoFixture Packages\n\n";

    const categories = cat === "all" ? ["core", "mocking", "testing"] : [cat];

    for (const c of categories) {
      const packages = AUTOFIXTURE_DOCS.packages[c as keyof typeof AUTOFIXTURE_DOCS.packages];
      if (!packages) continue;

      output += `## ${c.charAt(0).toUpperCase() + c.slice(1)} Packages\n\n`;

      for (const pkg of packages) {
        output += `### ${pkg.name}\n`;
        output += `${pkg.description}\n\n`;
        output += `**Installation:**\n\`\`\`\n${pkg.install}\n\`\`\`\n\n`;
        if ("usage" in pkg) {
          output += `**Usage:**\n\`\`\`csharp\n${pkg.usage}\n\`\`\`\n\n`;
        }
      }
    }

    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
    };
  }

  private getUsagePattern(pattern?: string) {
    if (!pattern) {
      const patternNames = AUTOFIXTURE_DOCS.commonPatterns.map((p) => p.name);
      return {
        content: [
          {
            type: "text",
            text: `# Common Usage Patterns\n\nAvailable patterns:\n${patternNames.map((n) => `- ${n}`).join("\n")}`,
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
            type: "text",
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
          type: "text",
          text: output,
        },
      ],
    };
  }

  private getBestPractices() {
    let output = "# AutoFixture Best Practices\n\n";
    for (let i = 0; i < AUTOFIXTURE_DOCS.bestPractices.length; i++) {
      output += `${i + 1}. ${AUTOFIXTURE_DOCS.bestPractices[i]}\n`;
    }

    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
    };
  }

  private async fetchGitHubDocs(topic?: string) {
    try {
      const topicLower = topic?.toLowerCase() || "readme";
      let url = "https://raw.githubusercontent.com/AutoFixture/AutoFixture/master/";

      if (topicLower.includes("readme")) {
        url += "README.md";
      } else if (topicLower.includes("cheat")) {
        url += "CHEATSHEET.md";
      } else if (topicLower.includes("faq")) {
        url += "FAQ.md";
      } else {
        url += "README.md";
      }

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          "User-Agent": "AutoFixture-MCP-Server/1.0",
        },
      });

      return {
        content: [
          {
            type: "text",
            text: `# GitHub Documentation: ${topic || "README"}\n\n${response.data}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch GitHub documentation: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      };
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("AutoFixture MCP Server running on stdio");
  }
}

const server = new AutoFixtureServer();
server.run().catch(console.error);

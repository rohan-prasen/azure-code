# Azure Code CLI

[![Built with Bun](https://img.shields.io/badge/Built_with-Bun-000000?style=flat&logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Ink](https://img.shields.io/badge/Ink-React_for_CLI-61DAFB?style=flat&logo=react)](https://github.com/vadimdemedes/ink)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

**Next-Generation AI Coding Assistant CLI**

A sophisticated, responsive terminal user interface (TUI) that seamlessly integrates with 9 advanced AI models hosted on Azure AI Foundry. Designed for developers who demand precision, speed, and elegance in their coding workflows.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Supported AI Models](#supported-ai-models)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Commands](#commands)
- [Architecture](#architecture)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

Azure Code CLI is a professional terminal-based AI coding assistant that provides an elegant, responsive interface for interacting with multiple AI models. Built with modern technologies including Bun runtime, TypeScript, and React-based terminal UI (Ink), it offers seamless integration with Azure AI Foundry's enterprise-grade AI infrastructure.

The application features:
- **9 AI Models** from 5 leading providers (Anthropic, OpenAI, xAI, Mistral, MoonShot)
- **Real-time Streaming** responses with token counting
- **Responsive Design** that adapts to any terminal size (60-200+ columns)
- **Professional UI** with ANSI shadow ASCII art and Azure blue theme
- **Intelligent Context Management** with sliding window optimization
- **Privacy-First** approach with no persistent data storage
- **Command System** with keyboard-navigable dropdown menus

## Key Features

### Advanced User Interface
- **Responsive Layout**: Automatically adapts to terminal dimensions without artifacts
- **Professional Aesthetics**: Custom ANSI shadow ASCII art banner with gradient colors
- **Seamless Resizing**: Handles terminal resize events with zero UI corruption
- **Azure Blue Theme**: Clean, minimalist design with consistent typography
- **Loading Animation**: Engaging 3-stage Pacman animation during startup

### Comprehensive AI Integration
- **Multi-Provider Support**: Anthropic, OpenAI, xAI, Mistral, and MoonShot AI
- **9 Configured Models**: Strategic selection across performance tiers
- **Azure AI Foundry**: Enterprise-grade deployment with regional availability
- **Streaming Responses**: Real-time content display with live token tracking
- **Context Intelligence**: 128k-200k token windows with smart sliding window management

### Intelligent Features
- **Command System**: Intuitive slash commands (`/model`, `/clear`, `/clearall`, `/exit`)
- **Model Selection**: Two-column interface with detailed model information
- **Real-time Token Counting**: Monitor API usage and costs
- **Error Resilience**: Comprehensive exception handling with retry logic
- **Privacy Protection**: Ephemeral sessions with no conversation persistence

### Developer Experience
- **TypeScript First**: Full type safety with strict compilation
- **Hot Reloading**: Development mode with live updates
- **Comprehensive Testing**: Automated test suite with terminal compatibility validation
- **Production Builds**: Optimized standalone executables
- **Cross-Platform**: Windows, macOS, and Linux support

## Supported AI Models

Azure Code integrates with 9 AI models across 5 providers, all deployed through Azure AI Foundry:

| Model | Provider | Speed | Context Window | Best For |
|-------|----------|-------|----------------|----------|
| **Claude Opus 4.5** | Anthropic | Slow | 200k tokens | Complex reasoning, architecture design |
| **Claude Sonnet 4.5** | Anthropic | Medium | 128k tokens | General coding (default model) |
| **Claude Haiku 4.5** | Anthropic | Fast | 128k tokens | Quick iterations, prototyping |
| **GPT-5.2 Chat** | OpenAI | Medium | 128k tokens | Advanced features, innovation |
| **GPT-5.1 Chat** | OpenAI | Medium | 128k tokens | Production code, testing |
| **GPT-4o Mini** | OpenAI | Fast | 128k tokens | Simple tasks, documentation |
| **Kimi K2 Thinking** | MoonShot | Slow | 128k tokens | Deep analysis, algorithms |
| **Mistral Large 3** | Mistral | Medium | 128k tokens | Multilingual development |
| **Grok 4 Fast** | xAI | Fast | 128k tokens | Practical solutions |

**Default Model**: Claude Sonnet 4.5 provides optimal balance for most coding tasks.

## Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 12+, or Linux
- **Runtime**: Bun 1.0+ or Node.js 18+
- **Terminal**: TTY-supporting terminal with ANSI escape sequences

### Terminal Compatibility
**Supported:**
- Windows Terminal (recommended for Windows)
- PowerShell Core/Desktop
- Git Bash
- WSL (Ubuntu, Debian, etc.)
- iTerm2 (macOS)
- GNOME Terminal, Alacritty

**Not Supported:**
- Command Prompt (cmd.exe) - lacks TTY support

### Azure AI Foundry
- Active Azure subscription
- Deployed AI models in Azure AI Foundry
- API keys and endpoints for desired providers

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/rohan-prasen/azure-code.git
cd azure-code
```

### 2. Install Dependencies
```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

### 3. Verify Installation
```bash
# Check TypeScript compilation
bun run type-check

# Quick test run (requires .env configuration)
bun run dev
```

## Configuration

### Environment Variables
Create a `.env` file in the project root with your Azure AI Foundry credentials:

```env
# Anthropic Models (Required)
ANTHROPIC_API_KEY="your_anthropic_api_key_here"
ANTHROPIC_ENDPOINT="your_anthropic_endpoint_here"
ANTHROPIC_API_VERSION="your_anthropic_api_version_here"
ANTHROPIC_OPUS_DEPLOYMENT="your_anthropic_opus_deployment_here"
ANTHROPIC_SONNET_DEPLOYMENT="your_anthropic_sonnet_deployment_here"
ANTHROPIC_HAIKU_DEPLOYMENT="your_anthropic_haiku_deployment_here"

# OpenAI Models (Optional)
OPENAI_API_KEY="your_openai_api_key_here"
OPENAI_ENDPOINT="your_openai_endpoint_here"
OPENAI_GPT52_DEPLOYMENT="your_openai_gpt52_deployment_here"
OPENAI_GPT51_DEPLOYMENT="your_openai_gpt51_deployment_here"
OPENAI_GPT4O_MINI_DEPLOYMENT="your_openai_gpt4o_mini_deployment_here"

# xAI Grok Models (Optional)
GROK_API_KEY="your_grok_api_key_here"
GROK_ENDPOINT="your_grok_endpoint_here"
GROK_DEPLOYMENT="your_grok_deployment_here"

# Mistral Models (Optional)
MISTRAL_API_KEY="your_mistral_api_key_here"
MISTRAL_ENDPOINT="your_mistral_endpoint_here"
MISTRAL_DEPLOYMENT="your_mistral_deployment_here"

# MoonShot AI Models (Optional)
MOONSHOT_API_KEY="your_moonshot_api_key_here"
MOONSHOT_ENDPOINT="your_moonshot_endpoint_here"
MOONSHOT_DEPLOYMENT="your_moonshot_deployment_here"
```

### Configuration Steps
1. **Copy Template**: `cp .env.example .env`
2. **Edit File**: Add your actual API keys and endpoints
3. **Verify Access**: Ensure Azure AI Foundry deployments are active
4. **Test Connection**: Run the app to validate configuration

**Note**: Only Anthropic is required. Other providers are optional and will be available if configured.

## Usage

### Starting the Application
```bash
# Development mode with hot reloading
bun run dev

# Production mode
bun run build
node dist/index.js

# Or using the built executable
./azure-code
```

### Initial Startup
- **Loading Animation**: 3-second Pacman animation during initialization
- **Environment Validation**: Automatic check of required configuration
- **Model Selection**: Starts with Claude Sonnet 4.5 by default

### Interface Overview
- **Banner**: Professional ASCII art header
- **Header**: Current model and status information
- **Chat Area**: Message history with user/AI distinction
- **Input Box**: Command and message input with border
- **Status Bar**: Token counts and connection status

## Commands

Azure Code supports slash commands for enhanced functionality:

| Command | Description | Usage |
|---------|-------------|-------|
| `/model` | Switch AI models | Opens interactive model selector |
| `/clear` | Clear conversation | Resets current chat history |
| `/clearall` | Complete reset | Clears all conversations |
| `/exit` | Quit application | Exits the CLI (aliases: `/quit`, `/q`) |

### Navigation
- **Arrow Keys**: Navigate command options
- **Tab**: Advance to next command
- **Enter**: Execute selected command
- **Esc**: Cancel command menu
- **Ctrl+C**: Force quit

### Model Selection Interface
- **Responsive Layout**: Two-column on wide terminals, single-column on narrow
- **Model Details**: Performance metrics, context windows, capabilities
- **Visual Indicators**: Current model (✓), selected model (▶)
- **Keyboard Navigation**: Full keyboard accessibility

## Architecture

### Core Components

```
azure-code/
├── src/
│   ├── components/          # React-based UI components
│   │   ├── App.tsx          # Main application orchestrator
│   │   ├── ChatInterface.tsx # Message display and input
│   │   ├── ModelSelector.tsx # Model selection interface
│   │   ├── Banner.tsx       # ASCII art header
│   │   ├── Header.tsx       # Status and model info
│   │   ├── LoadingAnimation.tsx # Startup animation
│   │   └── ...              # Additional UI components
│   ├── lib/
│   │   ├── ai-clients/      # AI provider integrations
│   │   │   ├── manager.ts   # Client orchestration
│   │   │   ├── base.ts      # Common interface
│   │   │   ├── anthropic.ts # Anthropic Claude client
│   │   │   └── openai.ts    # OpenAI/Grok/Mistral/MoonShot
│   │   ├── models/          # Model configuration
│   │   │   ├── config.ts    # Model registry
│   │   │   ├── system-prompts.ts # AI behavior prompts
│   │   │   └── context-manager.ts # Token management
│   │   ├── commands/        # Command system
│   │   │   └── parser.ts    # Command parsing
│   │   ├── file-operations/ # File system utilities
│   │   └── storage/         # State persistence
│   ├── hooks/               # React hooks
│   │   └── useTerminalSize.ts # Terminal responsiveness
│   ├── types/               # TypeScript definitions
│   └── utils/               # Helper functions
├── .env                     # Environment configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This documentation
```

### Key Technologies

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Runtime** | Bun 1.0+ | Fast JavaScript runtime with native TypeScript |
| **Language** | TypeScript 5.7 | Type-safe development with strict checking |
| **UI Framework** | Ink | React for terminal interfaces |
| **AI Integration** | Azure AI Foundry SDK | Enterprise AI model orchestration |
| **Styling** | Chalk | Terminal colors and formatting |
| **Markdown** | Marked + marked-terminal | Rich text rendering |
| **State Management** | React Hooks | Component state and effects |
| **Build Tool** | Bun Build | Optimized compilation and bundling |

### Design Patterns

- **Singleton Pattern**: AI client manager for resource efficiency
- **Strategy Pattern**: Provider-specific AI client implementations
- **Observer Pattern**: Terminal resize event handling
- **Factory Pattern**: Context manager creation
- **Command Pattern**: Slash command system

## Development

### Development Setup
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Type checking
bun run type-check

# Build for production
bun run build
```

### Project Scripts
- `bun run dev`: Development mode with hot reloading
- `bun run build`: Production build with compilation
- `bun run start`: Run built application
- `bun run type-check`: TypeScript validation

### Code Quality
- **TypeScript Strict Mode**: Full type checking enabled
- **ESLint**: Code linting (if configured)
- **Prettier**: Code formatting (if configured)
- **Testing**: Comprehensive test suite

### Adding New Models
1. Update `src/lib/models/config.ts` with model configuration
2. Implement client in appropriate provider file
3. Add environment variables to `.env.example`
4. Update system prompts if needed
5. Test integration thoroughly

## Testing

### Test Categories
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: AI client and API interaction testing
- **UI Tests**: Terminal interface and responsiveness testing
- **End-to-End Tests**: Full application workflow testing

### Running Tests
```bash
# Run all tests
bun test

# Run specific test file
bun test src/components/App.test.tsx

# Run with coverage
bun test --coverage
```

### Terminal Compatibility Testing
- **Resize Testing**: Validate UI integrity across terminal sizes
- **TTY Validation**: Ensure proper terminal support detection
- **ANSI Support**: Verify color and formatting rendering

### Performance Benchmarks
- **Startup Time**: < 500ms cold start
- **Memory Usage**: < 80MB during operation
- **Response Latency**: Model-dependent (fast models < 2s)
- **Resize Response**: < 100ms UI adaptation

## Deployment

### Build Process
```bash
# Clean build
rm -rf dist/
bun install
bun run type-check
bun run build
```

### Distribution Options

#### NPM Package
```bash
# Publish to NPM
npm publish

# Install globally
npm install -g azure-code-cli
```

#### Standalone Executable
```bash
# Create binary
bun build src/index.tsx --compile --outfile azure-code

# Distribute binary
./azure-code
```

#### Docker Container
```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build
CMD ["./azure-code"]
```

### Production Checklist
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] Environment variables documented
- [ ] Terminal compatibility verified
- [ ] Performance benchmarks met
- [ ] Security review completed

## Troubleshooting

### Common Issues

#### TTY Terminal Required
**Error**: "This application requires an interactive terminal (TTY)"
**Solution**: Use a supported terminal:
- Windows Terminal (recommended)
- PowerShell
- Git Bash
- WSL

#### Configuration Errors
**Error**: "Missing required environment variables"
**Solution**:
1. Verify `.env` file exists in project root
2. Check API keys are valid
3. Confirm Azure endpoints are correct
4. Test model deployments in Azure portal

#### UI Artifacts on Resize
**Error**: Visual corruption when resizing terminal
**Solution**: 
- Upgrade to latest version (includes resize fixes)
- Restart application if issues persist

#### API Connection Failures
**Error**: Model validation failed or API errors
**Solution**:
1. Verify API key permissions
2. Check endpoint URLs
3. Confirm model deployment names
4. Test with different models

#### Memory Issues
**Error**: Application consumes excessive memory
**Solution**:
- Close other applications
- Restart the terminal
- Check for memory leaks in development

### Debug Mode
Enable debug logging for troubleshooting:
```typescript
// Add to src/components/App.tsx
console.error('Debug: Messages sent to API', messages);
```

### Performance Issues
- **Slow Startup**: Clear Bun cache: `bun install --force`
- **High Latency**: Check internet connection and Azure region
- **UI Lag**: Ensure terminal supports ANSI escape sequences

## Contributing

We welcome contributions from experienced developers!

### Development Process
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Implement** changes with comprehensive testing
4. **Ensure** TypeScript compilation passes
5. **Update** documentation as needed
6. **Submit** a detailed pull request

### Code Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **React**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **Documentation**: JSDoc comments for all public APIs
- **Testing**: Unit tests for new functionality

### Pull Request Guidelines
- **Title**: Clear, descriptive title
- **Description**: Detailed explanation of changes
- **Testing**: Include test results and manual verification
- **Breaking Changes**: Clearly marked and documented
- **Screenshots**: UI changes include before/after screenshots

### Areas for Contribution
- **New AI Models**: Integration with additional providers
- **UI Improvements**: Enhanced terminal interface features
- **Performance**: Optimization and benchmarking
- **Documentation**: Guides, tutorials, and examples
- **Testing**: Additional test coverage and automation

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for complete terms.

**Permissions**:
- ✓ Commercial use
- ✓ Modification
- ✓ Distribution
- ✓ Private use

**Limitations**:
- ✗ Liability
- ✗ Warranty

**Conditions**:
- [Document] License and copyright notice

## Acknowledgments

### Core Technologies
- **Bun**: Lightning-fast JavaScript runtime
- **TypeScript**: Type-safe JavaScript superset
- **Ink**: React for terminal interfaces
- **Azure AI Foundry**: Enterprise AI infrastructure
- **Chalk**: Terminal styling library

### AI Providers
- **Anthropic**: Claude models for advanced reasoning
- **OpenAI**: GPT models for cutting-edge AI
- **xAI**: Grok for practical AI solutions
- **Mistral**: Multilingual AI capabilities
- **MoonShot AI**: Deep analytical AI

### Development Tools
- **React**: UI component framework
- **Marked**: Markdown parsing and rendering
- **Zod**: Runtime type validation
- **Commander**: CLI argument parsing

### Community
- **Vadim Demedes**: Creator of Ink framework
- **Azure Engineering Team**: AI Foundry platform
- **Open Source Contributors**: Libraries and tools used

---

**Azure Code CLI** - Elevating terminal-based development with AI-powered assistance.

*Built with love using Bun, TypeScript, and Ink*

[GitHub Repository](https://github.com/rohan-prasen/azure-code) • [Issues](https://github.com/rohan-prasen/azure-code/issues) • [Discussions](https://github.com/rohan-prasen/azure-code/discussions)

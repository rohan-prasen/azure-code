/**
 * Core Type Definitions for Azure Code CLI
 * 
 * Provides comprehensive type safety across the application with strict TypeScript enforcement.
 * These types ensure consistency across AI providers, message handling, and file operations.
 * 
 * @module types
 * @author Azure Code Team
 * @version 1.0.0
 */

/**
 * Supported AI model providers integrated via Azure AI Foundry
 */
export type ModelProvider = 'anthropic' | 'openai' | 'grok' | 'mistral' | 'moonshot';

/**
 * Processing speed classification for model performance characteristics
 */
export type ModelSpeed = 'fast' | 'medium' | 'slow';

/**
 * Message role types following OpenAI/Anthropic conventions
 * - user: Messages from the human user
 * - assistant: AI-generated responses
 * - system: System-level instructions and context
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Configuration metadata for each AI model
 * 
 * Contains deployment details, performance characteristics, and capability flags
 * used for intelligent model selection and context management.
 */
export interface ModelConfig {
  /** Unique identifier matching Azure AI Foundry deployment name */
  id: string;
  
  /** Human-readable display name for UI presentation */
  name: string;
  
  /** Provider type for routing to correct API client */
  provider: ModelProvider;
  
  /** Azure deployment name (environment variable reference) */
  deployment: string;
  
  /** Brief description of model strengths and use cases */
  description: string;
  
  /** Maximum context window size in tokens */
  contextWindow: number;
  
  /** Whether model supports streaming responses */
  supportsStreaming: boolean;
  
  /** Performance classification for user expectations */
  speed: ModelSpeed;
  
  /** List of model capabilities for feature enablement */
  capabilities: string[];
}

/**
 * Chat message structure with metadata
 * 
 * Represents a single message in the conversation history with all necessary
 * metadata for rendering, persistence, and context management.
 */
export interface Message {
  /** Unique message identifier for tracking and updates */
  id: string;
  
  /** Message role determining rendering and API formatting */
  role: MessageRole;
  
  /** Message content (supports markdown and code blocks) */
  content: string;
  
  /** Unix timestamp for chronological ordering */
  timestamp: number;
  
  /** Model that generated this message (for assistant messages) */
  modelId?: string;
  
  /** Estimated token count for context management */
  tokenCount?: number;
  
  /** Optional metadata for file operations or special handling */
  metadata?: Record<string, unknown>;
}

/**
 * File operation result
 * 
 * Standardized response format for all file system operations including
 * success/failure status and operation-specific data.
 */
export interface FileOperation {
  /** Type of operation performed */
  type: 'read' | 'write' | 'list' | 'search';
  
  /** Target file or directory path */
  path: string;
  
  /** Whether operation succeeded */
  success: boolean;
  
  /** Operation-specific result data */
  data?: unknown;
  
  /** Error message if operation failed */
  error?: string;
  
  /** Unix timestamp of operation */
  timestamp: number;
}

/**
 * File content representation
 * 
 * Structured file data for AI context inclusion with metadata for
 * intelligent truncation and relevance scoring.
 */
export interface FileContent {
  /** Absolute or relative file path */
  path: string;
  
  /** File contents (potentially truncated for large files) */
  content: string;
  
  /** Detected or specified programming language */
  language?: string;
  
  /** File size in bytes */
  size: number;
  
  /** Whether content was truncated */
  truncated: boolean;
}

/**
 * Conversation history persistence structure
 * 
 * Per-model conversation storage with metadata for efficient loading,
 * context management, and usage analytics.
 */
export interface ConversationHistory {
  /** Chronological message array */
  messages: Message[];
  
  /** Last modification timestamp for staleness detection */
  lastModified: number;
  
  /** Cumulative token usage for this conversation */
  totalTokens: number;
  
  /** Message count for quick statistics */
  messageCount: number;
  
  /** File operations performed in this conversation */
  fileOperations: FileOperation[];
}

/**
 * Complete application state persistence
 * 
 * Saved to local JSON file for conversation continuity across sessions.
 * Implements per-model conversation isolation for clean context switching.
 */
export interface AppState {
  /** Map of model ID to conversation history */
  conversations: Record<string, ConversationHistory>;
  
  /** Currently active model ID */
  activeModel: string;
  
  /** Workspace configuration */
  workspace: {
    /** Root directory for file operations */
    root: string;
    
    /** Recently accessed files for quick reference */
    recentFiles: string[];
  };
  
  /** User preferences */
  preferences: {
    /** Whether to show token counts */
    showTokens: boolean;
    
    /** Whether to confirm destructive file operations */
    confirmWrites: boolean;
  };
  
  /** Schema version for migration support */
  version: string;
}

/**
 * Slash command definition
 * 
 * Structured command metadata for parsing, validation, and execution
 * of user-initiated commands in the chat interface.
 */
export interface SlashCommand {
  /** Command name (without slash prefix) */
  name: string;
  
  /** Brief command description for help text */
  description: string;
  
  /** Detailed usage examples */
  usage: string;
  
  /** Command aliases for convenience */
  aliases?: string[];
  
  /** Whether command requires additional arguments */
  requiresArgs: boolean;
}

/**
 * Streaming response chunk
 * 
 * Represents incremental updates from AI model streaming APIs for
 * real-time UI updates and progressive rendering.
 */
export interface StreamChunk {
  /** Incremental text delta */
  delta: string;
  
  /** Whether this is the final chunk */
  done: boolean;
  
  /** Cumulative token count (if available) */
  tokenCount?: number;
  
  /** Stop reason (if done) */
  finishReason?: string;
}

/**
 * AI client interface
 * 
 * Standardized contract for all AI provider clients ensuring consistent
 * behavior across different APIs and simplifying model switching logic.
 */
export interface AIClient {
  /** Provider identifier */
  provider: ModelProvider;
  
  /**
   * Generate streaming completion
   * 
   * @param messages - Conversation history
   * @param modelId - Specific model to use
   * @returns Async iterator of response chunks
   */
  streamCompletion(
    messages: Message[],
    modelId: string
  ): AsyncIterableIterator<StreamChunk>;
  
  /**
   * Validate client configuration
   * 
   * @returns Promise resolving to validation success
   */
  validateConfig(): Promise<boolean>;
}

/**
 * Context window management configuration
 * 
 * Defines token budgets and prioritization strategies for fitting
 * conversations within model context limits.
 */
export interface ContextConfig {
  /** Maximum total tokens allowed */
  maxTokens: number;
  
  /** Recent message priority window size */
  slidingWindowSize: number;
  
  /** Reserved tokens for system prompt */
  systemPromptTokens: number;
  
  /** Reserved tokens for file contents */
  fileContentTokens: number;
}

/**
 * Environment configuration
 * 
 * Typed environment variables with validation for secure credential management.
 */
export interface EnvConfig {
  // Anthropic
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_ENDPOINT: string;
  ANTHROPIC_API_VERSION: string;
  ANTHROPIC_OPUS_DEPLOYMENT: string;
  ANTHROPIC_SONNET_DEPLOYMENT: string;
  ANTHROPIC_HAIKU_DEPLOYMENT: string;
  
  // OpenAI
  OPENAI_API_KEY: string;
  OPENAI_ENDPOINT: string;
  OPENAI_GPT4O_MINI_DEPLOYMENT: string;
  OPENAI_GPT51_DEPLOYMENT: string;
  OPENAI_GPT52_DEPLOYMENT: string;
  
  // Grok
  GROK_API_KEY: string;
  GROK_ENDPOINT: string;
  GROK_DEPLOYMENT: string;
  
  // Mistral
  MISTRAL_API_KEY: string;
  MISTRAL_ENDPOINT: string;
  MISTRAL_DEPLOYMENT: string;
  
  // MoonShot
  MOONSHOT_API_KEY: string;
  MOONSHOT_ENDPOINT: string;
  MOONSHOT_DEPLOYMENT: string;
  
  // Application
  WORKSPACE_ROOT?: string;
}

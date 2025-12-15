/**
 * Model Configuration and Registry
 * 
 * Central configuration for all AI models available in Azure Code.
 * Defines model metadata, capabilities, and routing information for
 * the 9 models across 5 providers deployed in Azure AI Foundry.
 * 
 * @module models/config
 * @author Azure Code Team
 * @version 1.0.0
 */

import 'dotenv/config';
import type { ModelConfig, ModelProvider } from '../../types/index.js';

/**
 * Default model used on application startup
 * Claude Sonnet 4.5 provides optimal balance of speed and capability
 */
export const DEFAULT_MODEL = 'claude-sonnet-4.5';

/**
 * Model registry containing all 9 available models
 * 
 * Models are organized by provider with complete metadata for
 * intelligent routing, UI display, and context management.
 */
export const MODELS: Record<string, ModelConfig> = {
  // ==================== Anthropic Models ====================
  
  /**
   * Claude Opus 4.5
   * 
   * Anthropic's most capable model optimized for complex reasoning,
   * in-depth analysis, and sophisticated code generation tasks.
   * Use for: Architecture design, complex debugging, detailed code reviews
   */
  'claude-opus-4.5': {
    id: 'claude-opus-4.5',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    deployment: process.env.ANTHROPIC_OPUS_DEPLOYMENT || 'claude-opus-4.5',
    description: 'Most capable, ideal for complex reasoning',
    contextWindow: 200000, // 200k tokens
    supportsStreaming: true,
    speed: 'slow',
    capabilities: ['reasoning', 'code', 'analysis', 'long-context', 'architecture'],
  },
  
  /**
   * Claude Sonnet 4.5 (DEFAULT)
   * 
   * Balanced performance and capability, optimal for most coding tasks.
   * Provides excellent code quality with reasonable response times.
   * Use for: General coding, refactoring, debugging, documentation
   */
  'claude-sonnet-4.5': {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    deployment: process.env.ANTHROPIC_SONNET_DEPLOYMENT || 'claude-sonnet-4.5',
    description: 'Balanced performance and capability',
    contextWindow: 128000, // 128k tokens
    supportsStreaming: true,
    speed: 'medium',
    capabilities: ['reasoning', 'code', 'analysis', 'refactoring'],
  },
  
  /**
   * Claude Haiku 4.5
   * 
   * Fastest Anthropic model optimized for rapid iteration and quick tasks.
   * Excellent for simple code generation and quick questions.
   * Use for: Quick fixes, simple functions, rapid prototyping
   */
  'claude-haiku-4.5': {
    id: 'claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    deployment: process.env.ANTHROPIC_HAIKU_DEPLOYMENT || 'claude-haiku-4.5',
    description: 'Fastest, most cost-effective',
    contextWindow: 128000, // 128k tokens
    supportsStreaming: true,
    speed: 'fast',
    capabilities: ['code', 'quick-tasks', 'prototyping'],
  },
  
  // ==================== OpenAI Models ====================
  
  /**
   * GPT-5.2 Chat
   * 
   * OpenAI's latest and most advanced model with cutting-edge capabilities.
   * Excels at creative problem-solving and advanced reasoning.
   * Use for: Novel solutions, creative coding, complex system design
   */
  'gpt-5.2-chat': {
    id: 'gpt-5.2-chat',
    name: 'GPT-5.2 Chat',
    provider: 'openai',
    deployment: process.env.OPENAI_GPT52_DEPLOYMENT || 'gpt-5.2-chat',
    description: 'Latest OpenAI model, most advanced',
    contextWindow: 128000, // 128k tokens
    supportsStreaming: true,
    speed: 'medium',
    capabilities: ['reasoning', 'code', 'creative', 'analysis', 'innovation'],
  },
  
  /**
   * GPT-5.1 Chat
   * 
   * Advanced OpenAI model with strong reasoning and coding capabilities.
   * Reliable for production-grade code generation and analysis.
   * Use for: Production code, testing, comprehensive documentation
   */
  'gpt-5.1-chat': {
    id: 'gpt-5.1-chat',
    name: 'GPT-5.1 Chat',
    provider: 'openai',
    deployment: process.env.OPENAI_GPT51_DEPLOYMENT || 'gpt-5.1-chat',
    description: 'Advanced reasoning and coding',
    contextWindow: 128000, // 128k tokens
    supportsStreaming: true,
    speed: 'medium',
    capabilities: ['reasoning', 'code', 'analysis', 'testing'],
  },
  
  /**
   * GPT-4o Mini
   * 
   * Lightweight, fast OpenAI model for quick tasks and rapid iteration.
   * Cost-effective option for simple coding operations.
   * Use for: Quick answers, simple scripts, code snippets
   */
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    deployment: process.env.OPENAI_GPT4O_MINI_DEPLOYMENT || 'gpt-4o-mini',
    description: 'Fast and lightweight',
    contextWindow: 128000, // 128k tokens
    supportsStreaming: true,
    speed: 'fast',
    capabilities: ['code', 'quick-tasks', 'snippets'],
  },
  
  // ==================== MoonShot AI Models ====================
  
  /**
   * Kimi K2 Thinking
   * 
   * MoonShot AI's reasoning-focused model with deep analytical capabilities.
   * Excels at complex problem decomposition and thorough analysis.
   * Use for: Algorithm design, optimization, deep code analysis
   */
  'Kimi-K2-Thinking': {
    id: 'Kimi-K2-Thinking',
    name: 'Kimi K2 Thinking',
    provider: 'moonshot',
    deployment: process.env.MOONSHOT_DEPLOYMENT || 'Kimi-K2-Thinking',
    description: 'Deep reasoning specialist',
    contextWindow: 128000, // 128k tokens
    supportsStreaming: true,
    speed: 'slow',
    capabilities: ['reasoning', 'thinking', 'analysis', 'code', 'algorithms'],
  },
  
  // ==================== Mistral Models ====================
  
  /**
   * Mistral Large 3
   * 
   * Mistral AI's flagship model with strong multilingual capabilities.
   * Excellent for European language support and robust code generation.
   * Use for: Multilingual projects, European markets, efficient coding
   */
  'Mistral-Large-3': {
    id: 'Mistral-Large-3',
    name: 'Mistral Large 3',
    provider: 'mistral',
    deployment: process.env.MISTRAL_DEPLOYMENT || 'Mistral-Large-3',
    description: 'Powerful multilingual model',
    contextWindow: 128000, // 128k tokens
    supportsStreaming: true,
    speed: 'medium',
    capabilities: ['code', 'multilingual', 'reasoning', 'european'],
  },
  
  // ==================== Grok Models ====================
  
  /**
   * Grok 4 Fast (Non-Reasoning)
   * 
   * xAI's fast model optimized for quick, practical solutions.
   * Direct and efficient for straightforward coding tasks.
   * Use for: Quick implementations, practical solutions, rapid answers
   */
  'grok-4-fast-non-reasoning': {
    id: 'grok-4-fast-non-reasoning',
    name: 'Grok 4 Fast',
    provider: 'grok',
    deployment: process.env.GROK_DEPLOYMENT || 'grok-4-fast-non-reasoning',
    description: 'xAI fast model for quick tasks',
    contextWindow: 128000, // 128k tokens
    supportsStreaming: true,
    speed: 'fast',
    capabilities: ['code', 'quick-tasks', 'practical', 'efficient'],
  },
};

/**
 * Models organized by provider for grouped UI display
 * Maintains insertion order for consistent presentation
 */
export const MODELS_BY_PROVIDER: Record<ModelProvider, string[]> = {
  anthropic: ['claude-sonnet-4.5', 'claude-opus-4.5', 'claude-haiku-4.5'],
  openai: ['gpt-5.2-chat', 'gpt-5.1-chat', 'gpt-4o-mini'],
  moonshot: ['Kimi-K2-Thinking'],
  mistral: ['Mistral-Large-3'],
  grok: ['grok-4-fast-non-reasoning'],
};

/**
 * Get available providers based on configured API keys
 * Only returns providers that have API keys configured
 */
export function getAvailableProviders(): ModelProvider[] {
  const providers: ModelProvider[] = [];
  
  // Check Anthropic
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_ENDPOINT) {
    providers.push('anthropic');
  }
  
  // Check OpenAI
  if (process.env.OPENAI_API_KEY) {
    providers.push('openai');
  }
  
  // Check MoonShot
  if (process.env.MOONSHOT_API_KEY) {
    providers.push('moonshot');
  }
  
  // Check Mistral
  if (process.env.MISTRAL_API_KEY) {
    providers.push('mistral');
  }
  
  // Check Grok
  if (process.env.GROK_API_KEY) {
    providers.push('grok');
  }
  
  return providers;
}

/**
 * Get models by provider, filtered by available API keys
 * Only returns models for providers with configured credentials
 */
export function getAvailableModelsByProvider(): Record<string, string[]> {
  const availableProviders = getAvailableProviders();
  const result: Record<string, string[]> = {};
  
  for (const provider of availableProviders) {
    result[provider] = MODELS_BY_PROVIDER[provider];
  }
  
  return result;
}

/**
 * Provider display names for UI presentation
 */
export const PROVIDER_NAMES: Record<ModelProvider, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  moonshot: 'MoonShot AI',
  mistral: 'Mistral',
  grok: 'Grok (xAI)',
};

/**
 * Get model configuration by ID
 * 
 * @param modelId - Model identifier
 * @returns Model configuration or undefined if not found
 */
export function getModel(modelId: string): ModelConfig | undefined {
  return MODELS[modelId];
}

/**
 * Get all models for a specific provider
 * 
 * @param provider - Provider identifier
 * @returns Array of model configurations
 */
export function getModelsByProvider(provider: ModelProvider): ModelConfig[] {
  return MODELS_BY_PROVIDER[provider]
    .map(id => MODELS[id])
    .filter((model): model is ModelConfig => model !== undefined);
}

/**
 * Validate model ID exists in registry
 * 
 * @param modelId - Model identifier to validate
 * @returns True if model exists
 */
export function isValidModel(modelId: string): boolean {
  return modelId in MODELS;
}

/**
 * Get all available model IDs
 * 
 * @returns Array of all model identifiers
 */
export function getAllModelIds(): string[] {
  return Object.keys(MODELS);
}

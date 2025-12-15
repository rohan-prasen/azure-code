/**
 * AI Client Manager
 * 
 * Central routing and management for all AI provider clients.
 * Handles client instantiation, request routing based on model selection,
 * and provides unified interface for the application.
 * 
 * @module ai-clients/manager
 * @author Azure Code Team
 * @version 1.0.0
 */

import { AnthropicClient } from './anthropic.js';
import {
  createOpenAIClient,
  createGrokClient,
  createMistralClient,
  createMoonShotClient,
} from './openai.js';
import { BaseAIClient } from './base.js';
import type { Message, StreamChunk, ModelProvider } from '../../types/index.js';
import { MODELS } from '../models/config.js';

/**
 * AI Client Manager
 * 
 * Singleton manager that initializes and routes requests to appropriate
 * provider clients based on model selection.
 */
export class AIClientManager {
  private clients: Map<ModelProvider, BaseAIClient>;
  private static instance: AIClientManager;
  
  private constructor() {
    this.clients = new Map();
    this.initializeClients();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): AIClientManager {
    if (!AIClientManager.instance) {
      AIClientManager.instance = new AIClientManager();
    }
    return AIClientManager.instance;
  }
  
  /**
   * Initialize all provider clients
   * 
   * Creates client instances for each provider with proper configuration.
   * Clients are lazily initialized and cached for performance.
   */
  private initializeClients(): void {
    // Anthropic client for Claude models
    this.clients.set('anthropic', new AnthropicClient());
    
    // OpenAI client for GPT models
    this.clients.set('openai', createOpenAIClient());
    
    // Grok client for xAI models
    this.clients.set('grok', createGrokClient());
    
    // Mistral client
    this.clients.set('mistral', createMistralClient());
    
    // MoonShot AI client for Kimi models
    this.clients.set('moonshot', createMoonShotClient());
  }
  
  /**
   * Get client for specific provider
   * 
   * @param provider - Provider identifier
   * @returns Provider client instance
   * @throws Error if provider not found
   */
  private getClient(provider: ModelProvider): BaseAIClient {
    const client = this.clients.get(provider);
    if (!client) {
      throw new Error(`No client configured for provider: ${provider}`);
    }
    return client;
  }
  
  /**
   * Stream completion from appropriate provider
   * 
   * Routes the request to the correct provider client based on model ID,
   * providing a unified interface for the application regardless of provider.
   * 
   * @param messages - Conversation history
   * @param modelId - Model identifier
   * @returns Async iterator of response chunks
   * @throws Error if model not found or client fails
   */
  async *streamCompletion(
    messages: Message[],
    modelId: string
  ): AsyncIterableIterator<StreamChunk> {
    // Validate model exists
    const model = MODELS[modelId];
    if (!model) {
      throw new Error(`Unknown model: ${modelId}`);
    }
    
    // Get appropriate client
    const client = this.getClient(model.provider);
    
    // Stream from provider
    yield* client.streamCompletion(messages, modelId);
  }
  
  /**
   * Validate all client configurations
   * 
   * Checks environment variables and API accessibility for all providers.
   * Used on application startup to provide early feedback on configuration issues.
   * 
   * @returns Map of provider to validation status
   */
  async validateAllClients(): Promise<Map<ModelProvider, boolean>> {
    const results = new Map<ModelProvider, boolean>();
    
    for (const [provider, client] of this.clients.entries()) {
      try {
        const isValid = await client.validateConfig();
        results.set(provider, isValid);
      } catch (error) {
        results.set(provider, false);
      }
    }
    
    return results;
  }
  
  /**
   * Validate specific provider configuration
   * 
   * @param provider - Provider to validate
   * @returns Promise resolving to validation success
   */
  async validateProvider(provider: ModelProvider): Promise<boolean> {
    const client = this.clients.get(provider);
    if (!client) {
      return false;
    }
    
    try {
      return await client.validateConfig();
    } catch {
      return false;
    }
  }
  
  /**
   * Get list of available providers with valid configuration
   * 
   * @returns Array of provider identifiers with valid configs
   */
  async getAvailableProviders(): Promise<ModelProvider[]> {
    const validations = await this.validateAllClients();
    return Array.from(validations.entries())
      .filter(([_, isValid]) => isValid)
      .map(([provider, _]) => provider);
  }
}

/**
 * Export singleton instance for convenience
 */
export const aiClientManager = AIClientManager.getInstance();

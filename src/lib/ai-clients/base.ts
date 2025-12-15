/**
 * Base AI Client Interface
 * 
 * Provides a standardized contract for all AI provider clients,
 * enabling seamless model switching and consistent streaming behavior.
 * 
 * @module ai-clients/base
 * @author Azure Code Team
 * @version 1.0.0
 */

import type { Message, StreamChunk, ModelProvider } from '../../types/index.js';

/**
 * Abstract base class for AI provider clients
 * 
 * Implements common functionality and enforces interface contract
 * for all provider-specific implementations.
 */
export abstract class BaseAIClient {
  protected provider: ModelProvider;
  
  constructor(provider: ModelProvider) {
    this.provider = provider;
  }
  
  /**
   * Generate streaming completion from AI model
   * 
   * Implementations must handle provider-specific API formats and
   * normalize responses into standardized StreamChunk format.
   * 
   * @param messages - Conversation history
   * @param modelId - Specific model deployment to use
   * @returns Async iterator yielding response chunks
   */
  abstract streamCompletion(
    messages: Message[],
    modelId: string
  ): AsyncIterableIterator<StreamChunk>;
  
  /**
   * Validate client configuration
   * 
   * Checks environment variables, endpoint accessibility, and
   * API key validity before attempting requests.
   * 
   * @returns Promise resolving to validation success
   */
  abstract validateConfig(): Promise<boolean>;
  
  /**
   * Format messages for provider API
   * 
   * Converts internal message format to provider-specific structure.
   * Default implementation provides OpenAI-compatible format.
   * 
   * @param messages - Internal message array
   * @returns Provider-formatted messages
   */
  protected formatMessages(messages: Message[]): unknown[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }
  
  /**
   * Estimate token count for text
   * 
   * Rough estimation using character-to-token ratio.
   * Provider-specific implementations can override with tokenizers.
   * 
   * @param text - Text to estimate
   * @returns Estimated token count
   */
  protected estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
  
  /**
   * Handle API errors with standardized error messages
   * 
   * @param error - Error object from API call
   * @returns User-friendly error message
   */
  protected handleError(error: unknown): string {
    if (error instanceof Error) {
      return `${this.provider} API error: ${error.message}`;
    }
    return `Unknown ${this.provider} API error occurred`;
  }
}

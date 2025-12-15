/**
 * Anthropic AI Client
 * 
 * Handles communication with Claude models (Opus, Sonnet, Haiku 4.5) deployed
 * in Azure AI Foundry via the Anthropic API endpoint.
 * 
 * Implements streaming message generation with proper Azure authentication
 * and endpoint configuration.
 * 
 * @module ai-clients/anthropic
 * @author Azure Code Team
 * @version 1.0.0
 */

import 'dotenv/config';
import AnthropicFoundry from '@anthropic-ai/foundry-sdk';
import { BaseAIClient } from './base.js';
import type { Message, StreamChunk } from '../../types/index.js';
import { MODELS } from '../models/config.js';

/**
 * Anthropic client for Claude models
 * 
 * Configured for Azure AI Foundry endpoints with proper
 * API version and authentication handling.
 */
export class AnthropicClient extends BaseAIClient {
  private client: AnthropicFoundry;
  private endpoint: string;
  private apiKey: string;
  
  constructor() {
    super('anthropic');
    
    // Load configuration from environment
    this.endpoint = process.env.ANTHROPIC_ENDPOINT || '';
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    
    // Initialize Anthropic Foundry SDK with Azure AI Foundry configuration
    this.client = new AnthropicFoundry({
      apiKey: this.apiKey,
      baseURL: this.endpoint,
    });
  }
  
  /**
   * Stream completion from Claude models
   * 
   * Handles the Anthropic Messages API format and streams response
   * chunks in real-time for progressive rendering.
   * 
   * @param messages - Conversation history (system message separated)
   * @param modelId - Claude model identifier
   * @yields StreamChunk objects with delta text
   */
  async *streamCompletion(
    messages: Message[],
    modelId: string
  ): AsyncIterableIterator<StreamChunk> {
    try {
      const model = MODELS[modelId];
      if (!model || model.provider !== 'anthropic') {
        throw new Error(`Invalid Anthropic model: ${modelId}`);
      }
      
      // Separate system message from conversation
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');
      
      // Anthropic requires at least one message
      if (conversationMessages.length === 0) {
        throw new Error('At least one user or assistant message is required');
      }
      
      // Format messages for Anthropic API
      const formattedMessages = conversationMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
      
      // Create streaming request
      const stream = await this.client.messages.create({
        model: model.deployment,
        max_tokens: 4096, // Maximum response tokens
        system: systemMessage?.content || undefined,
        messages: formattedMessages,
        stream: true,
      });
      
      // Process stream chunks
      let tokenCount = 0;
      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            tokenCount += this.estimateTokens(event.delta.text);
            
            yield {
              delta: event.delta.text,
              done: false,
              tokenCount,
            };
          }
        } else if (event.type === 'message_stop') {
          yield {
            delta: '',
            done: true,
            tokenCount,
            finishReason: 'stop',
          };
        }
      }
    } catch (error) {
      // Convert error to user-friendly message
      throw new Error(this.handleError(error));
    }
  }
  
  /**
   * Validate Anthropic client configuration
   * 
   * Checks for required environment variables and validates
   * API key and endpoint accessibility.
   * 
   * @returns Promise resolving to validation success
   */
  async validateConfig(): Promise<boolean> {
    if (!this.apiKey) {
      console.error('Missing ANTHROPIC_API_KEY environment variable');
      return false;
    }
    
    if (!this.endpoint) {
      console.error('Missing ANTHROPIC_ENDPOINT environment variable');
      return false;
    }
    
    // Verify endpoint URL format
    try {
      new URL(this.endpoint);
    } catch {
      console.error('Invalid ANTHROPIC_ENDPOINT URL format');
      return false;
    }
    
    // Test API connection with a minimal request
    try {
      await this.client.messages.create({
        model: process.env.ANTHROPIC_SONNET_DEPLOYMENT || 'claude-sonnet-4.5',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      });
      return true;
    } catch (error) {
      console.error('Anthropic API validation failed:', this.handleError(error));
      return false;
    }
  }
}

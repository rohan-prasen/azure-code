/**
 * OpenAI-Compatible Client
 * 
 * Two client types:
 * 1. AzureOpenAI - For Azure-hosted GPT models (requires apiVersion and deployment)
 * 2. OpenAI - For OpenAI-compatible APIs (Grok, Mistral, MoonShot via Azure AI Foundry)
 * 
 * @module ai-clients/openai
 * @author Azure Code Team
 * @version 2.0.0
 */

import OpenAI, { AzureOpenAI } from 'openai';
import { BaseAIClient } from './base.js';
import type { Message, StreamChunk, ModelProvider } from '../../types/index.js';
import { MODELS } from '../models/config.js';

/**
 * OpenAI-compatible client configuration
 */
interface OpenAIClientConfig {
  provider: ModelProvider;
  endpoint: string;
  apiKey: string;
  apiVersion?: string;
  useAzureOpenAI?: boolean;
}

/**
 * Azure OpenAI Client for GPT models
 * 
 * Uses AzureOpenAI class with apiVersion and deployment configuration
 * as per Azure OpenAI Service requirements.
 */
export class AzureOpenAIClient extends BaseAIClient {
  private client: AzureOpenAI;
  private endpoint: string;
  private apiKey: string;
  private apiVersion: string;
  
  constructor(config: OpenAIClientConfig) {
    super(config.provider);
    
    this.endpoint = config.endpoint;
    this.apiKey = config.apiKey;
    this.apiVersion = config.apiVersion || '2024-04-01-preview';
    
    // Initialize Azure OpenAI SDK
    this.client = new AzureOpenAI({
      endpoint: this.endpoint,
      apiKey: this.apiKey,
      apiVersion: this.apiVersion,
    });
  }
  
  /**
   * Stream completion from Azure OpenAI GPT models
   * 
   * Uses deployment parameter and max_completion_tokens as per
   * Azure OpenAI API specification.
   * 
   * @param messages - Conversation history
   * @param modelId - Model identifier
   * @yields StreamChunk objects with delta text
   */
  async *streamCompletion(
    messages: Message[],
    modelId: string
  ): AsyncIterableIterator<StreamChunk> {
    try {
      const model = MODELS[modelId];
      if (!model || model.provider !== this.provider) {
        throw new Error(`Invalid ${this.provider} model: ${modelId}`);
      }
      
      // Format messages for OpenAI Chat Completions API
      const formattedMessages = messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      }));
      
      // Create streaming request with Azure OpenAI parameters
      const stream = await this.client.chat.completions.create({
        model: model.deployment, // This is the deployment name in Azure
        messages: formattedMessages,
        max_completion_tokens: 16384, // Azure OpenAI uses max_completion_tokens
        stream: true,
      });
      
      // Process stream chunks
      let tokenCount = 0;
      let fullContent = '';
      
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        const finishReason = chunk.choices[0]?.finish_reason;
        
        if (delta) {
          fullContent += delta;
          tokenCount = this.estimateTokens(fullContent);
          
          yield {
            delta,
            done: false,
            tokenCount,
          };
        }
        
        if (finishReason) {
          yield {
            delta: '',
            done: true,
            tokenCount,
            finishReason,
          };
        }
      }
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }
  
  /**
   * Validate Azure OpenAI client configuration
   */
  async validateConfig(): Promise<boolean> {
    if (!this.apiKey) {
      console.error(`Missing ${this.provider.toUpperCase()}_API_KEY environment variable`);
      return false;
    }
    
    if (!this.endpoint) {
      console.error(`Missing ${this.provider.toUpperCase()}_ENDPOINT environment variable`);
      return false;
    }
    
    return true;
  }
}

/**
 * Generic OpenAI-compatible client for non-Azure providers
 * 
 * Handles streaming chat completions for OpenAI-compatible APIs
 * (Grok, Mistral, MoonShot) via Azure AI Foundry.
 */
export class OpenAICompatibleClient extends BaseAIClient {
  private client: OpenAI;
  private endpoint: string;
  private apiKey: string;
  
  constructor(config: OpenAIClientConfig) {
    super(config.provider);
    
    this.endpoint = config.endpoint;
    this.apiKey = config.apiKey;
    
    // Initialize generic OpenAI SDK with baseURL
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.endpoint,
    });
  }
  
  /**
   * Stream completion from OpenAI-compatible models
   * 
   * Handles the Chat Completions API format and streams response
   * chunks in real-time for progressive rendering.
   * 
   * @param messages - Conversation history
   * @param modelId - Model identifier
   * @yields StreamChunk objects with delta text
   */
  async *streamCompletion(
    messages: Message[],
    modelId: string
  ): AsyncIterableIterator<StreamChunk> {
    try {
      const model = MODELS[modelId];
      if (!model || model.provider !== this.provider) {
        throw new Error(`Invalid ${this.provider} model: ${modelId}`);
      }
      
      // Format messages for OpenAI Chat Completions API
      const formattedMessages = messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      }));
      
      // Create streaming request
      const stream = await this.client.chat.completions.create({
        model: model.deployment,
        messages: formattedMessages,
        max_tokens: 4096,
        stream: true,
        temperature: 0.7,
      });
      
      // Process stream chunks
      let tokenCount = 0;
      let fullContent = '';
      
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        const finishReason = chunk.choices[0]?.finish_reason;
        
        if (delta) {
          fullContent += delta;
          tokenCount = this.estimateTokens(fullContent);
          
          yield {
            delta,
            done: false,
            tokenCount,
          };
        }
        
        if (finishReason) {
          yield {
            delta: '',
            done: true,
            tokenCount,
            finishReason,
          };
        }
      }
    } catch (error) {
      throw new Error(this.handleError(error));
    }
  }
  
  /**
   * Validate client configuration
   * 
   * Checks for required credentials and endpoint accessibility.
   * 
   * @returns Promise resolving to validation success
   */
  async validateConfig(): Promise<boolean> {
    if (!this.apiKey) {
      console.error(`Missing ${this.provider.toUpperCase()}_API_KEY environment variable`);
      return false;
    }
    
    if (!this.endpoint) {
      console.error(`Missing ${this.provider.toUpperCase()}_ENDPOINT environment variable`);
      return false;
    }
    
    // Verify endpoint URL format
    try {
      new URL(this.endpoint);
    } catch {
      console.error(`Invalid ${this.provider.toUpperCase()}_ENDPOINT URL format`);
      return false;
    }
    
    return true;
  }
}

/**
 * Factory function to create provider-specific clients
 */

/**
 * Create Azure OpenAI client for GPT models
 * 
 * Uses AzureOpenAI class with proper apiVersion and deployment handling
 */
export function createOpenAIClient(): AzureOpenAIClient {
  return new AzureOpenAIClient({
    provider: 'openai',
    endpoint: process.env.OPENAI_ENDPOINT || '',
    apiKey: process.env.OPENAI_API_KEY || '',
    apiVersion: '2024-04-01-preview',
    useAzureOpenAI: true,
  });
}

/**
 * Create Grok client for xAI models
 */
export function createGrokClient(): OpenAICompatibleClient {
  return new OpenAICompatibleClient({
    provider: 'grok',
    endpoint: process.env.GROK_ENDPOINT || '',
    apiKey: process.env.GROK_API_KEY || '',
  });
}

/**
 * Create Mistral client
 */
export function createMistralClient(): OpenAICompatibleClient {
  return new OpenAICompatibleClient({
    provider: 'mistral',
    endpoint: process.env.MISTRAL_ENDPOINT || '',
    apiKey: process.env.MISTRAL_API_KEY || '',
  });
}

/**
 * Create MoonShot AI client for Kimi models
 */
export function createMoonShotClient(): OpenAICompatibleClient {
  return new OpenAICompatibleClient({
    provider: 'moonshot',
    endpoint: process.env.MOONSHOT_ENDPOINT || '',
    apiKey: process.env.MOONSHOT_API_KEY || '',
  });
}

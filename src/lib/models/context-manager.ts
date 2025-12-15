/**
 * Context Window Manager
 * 
 * Manages conversation history to fit within model token limits using
 * intelligent prioritization and sliding window strategy.
 * 
 * Ensures critical context (system prompts, recent messages, file contents)
 * is preserved while older messages are summarized or truncated as needed.
 * 
 * @module models/context-manager
 * @author Azure Code Team
 * @version 1.0.0
 */

import type { Message, ContextConfig, FileContent } from '../../types/index.js';
import { MODELS } from './config.js';

/**
 * Default context configuration
 * 
 * Conservative token allocation ensuring reliability across all models
 */
const DEFAULT_CONTEXT_CONFIG: ContextConfig = {
  maxTokens: 128000,        // 128k default context window
  slidingWindowSize: 4000,   // Last 4k tokens prioritized
  systemPromptTokens: 1000,  // Reserved for system instructions
  fileContentTokens: 10000,  // Reserved for file contents
};

/**
 * Context Window Manager
 * 
 * Implements sliding window algorithm with priority-based message retention
 * to optimize context usage within model limits.
 */
export class ContextManager {
  private config: ContextConfig;
  private modelId: string;
  
  constructor(modelId: string, customConfig?: Partial<ContextConfig>) {
    this.modelId = modelId;
    
    // Use model-specific context window if available
    const model = MODELS[modelId];
    const maxTokens = model?.contextWindow || DEFAULT_CONTEXT_CONFIG.maxTokens;
    
    this.config = {
      ...DEFAULT_CONTEXT_CONFIG,
      maxTokens,
      ...customConfig,
    };
  }
  
  /**
   * Prepare messages for API request
   * 
   * Implements priority-based context management:
   * 1. System prompt (always included)
   * 2. Recent messages within sliding window
   * 3. Important context (file contents, pinned messages)
   * 4. Older messages (included if space permits)
   * 
   * @param systemPrompt - System instructions
   * @param messages - Full conversation history
   * @param fileContents - Optional file contents for context
   * @returns Optimized message array within token limits
   */
  prepareContext(
    systemPrompt: string,
    messages: Message[],
    fileContents?: FileContent[]
  ): Message[] {
    const result: Message[] = [];
    let totalTokens = 0;
    
    // 1. Add system prompt (highest priority)
    const systemMessage: Message = {
      id: 'system',
      role: 'system',
      content: systemPrompt,
      timestamp: Date.now(),
      tokenCount: this.estimateTokens(systemPrompt),
    };
    result.push(systemMessage);
    totalTokens += systemMessage.tokenCount || 0;
    
    // 2. Calculate available budget
    const availableBudget = 
      this.config.maxTokens - 
      this.config.systemPromptTokens - 
      (fileContents ? this.config.fileContentTokens : 0) - 
      1000; // Reserve 1k for response
    
    // 3. Add file contents if provided (high priority)
    if (fileContents && fileContents.length > 0) {
      const fileContextMessage = this.createFileContextMessage(fileContents);
      result.push(fileContextMessage);
      totalTokens += fileContextMessage.tokenCount || 0;
    }
    
    // 4. Process messages in reverse (most recent first)
    const reversedMessages = [...messages].reverse();
    const includedMessages: Message[] = [];
    let slidingWindowTokens = 0;
    
    // Phase 1: Include recent messages within sliding window
    for (const msg of reversedMessages) {
      if (msg.role === 'system') continue; // Skip duplicate system messages
      
      const msgTokens = msg.tokenCount || this.estimateTokens(msg.content);
      
      if (slidingWindowTokens + msgTokens <= this.config.slidingWindowSize) {
        includedMessages.unshift(msg);
        slidingWindowTokens += msgTokens;
        totalTokens += msgTokens;
      } else {
        break; // Sliding window filled
      }
    }
    
    // Always add the recent messages (sliding window) first
    result.push(...includedMessages);
    
    // Phase 2: Include older messages if budget permits
    const remainingBudget = availableBudget - totalTokens;
    if (remainingBudget > 0) {
      const olderMessages = reversedMessages.slice(includedMessages.length);
      
      for (const msg of olderMessages.reverse()) {
        if (msg.role === 'system') continue;
        
        const msgTokens = msg.tokenCount || this.estimateTokens(msg.content);
        
        if (totalTokens + msgTokens <= availableBudget) {
          // Insert at beginning of conversation messages (after system, before recent)
          const insertIndex = result.findIndex(m => m.role !== 'system');
          if (insertIndex !== -1) {
            result.splice(insertIndex, 0, msg);
          } else {
            result.push(msg);
          }
          totalTokens += msgTokens;
        } else {
          break; // Budget exhausted
        }
      }
    }
    
    return result;
  }
  
  /**
   * Create file context message
   * 
   * Combines multiple file contents into a single context message
   * with proper formatting for AI consumption.
   * 
   * @param fileContents - Array of file contents
   * @returns Formatted message with file context
   */
  private createFileContextMessage(fileContents: FileContent[]): Message {
    const content = fileContents.map(file => {
      const languageTag = file.language ? `\`\`\`${file.language}` : '```';
      const truncatedIndicator = file.truncated ? '\n... (truncated)' : '';
      
      return `File: ${file.path}\n${languageTag}\n${file.content}${truncatedIndicator}\n\`\`\``;
    }).join('\n\n');
    
    return {
      id: `file-context-${Date.now()}`,
      role: 'user',
      content: `Here are the relevant files:\n\n${content}`,
      timestamp: Date.now(),
      tokenCount: this.estimateTokens(content),
      metadata: { type: 'file-context' },
    };
  }
  
  /**
   * Estimate token count for text
   * 
   * Uses rough character-to-token ratio estimation.
   * For production, consider using tiktoken or provider-specific tokenizers.
   * 
   * @param text - Text to estimate
   * @returns Estimated token count
   */
  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    // This is conservative and works reasonably across all models
    return Math.ceil(text.length / 4);
  }
  
  /**
   * Calculate total tokens in message array
   * 
   * @param messages - Messages to count
   * @returns Total estimated tokens
   */
  calculateTotalTokens(messages: Message[]): number {
    return messages.reduce((total, msg) => {
      return total + (msg.tokenCount || this.estimateTokens(msg.content));
    }, 0);
  }
  
  /**
   * Check if messages exceed context window
   * 
   * @param messages - Messages to check
   * @returns True if over limit
   */
  exceedsContextWindow(messages: Message[]): boolean {
    const totalTokens = this.calculateTotalTokens(messages);
    return totalTokens > this.config.maxTokens;
  }
  
  /**
   * Get current context configuration
   * 
   * @returns Current context config
   */
  getConfig(): ContextConfig {
    return { ...this.config };
  }
  
  /**
   * Update context configuration
   * 
   * @param updates - Partial config updates
   */
  updateConfig(updates: Partial<ContextConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };
  }
}

/**
 * Create context manager for specific model
 * 
 * Factory function for convenient manager instantiation
 * 
 * @param modelId - Model identifier
 * @param customConfig - Optional custom configuration
 * @returns Context manager instance
 */
export function createContextManager(
  modelId: string,
  customConfig?: Partial<ContextConfig>
): ContextManager {
  return new ContextManager(modelId, customConfig);
}

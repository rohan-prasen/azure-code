/**
 * Storage Manager
 * 
 * Handles persistent storage of conversation history, application state,
 * and user preferences using JSON file storage.
 * 
 * Provides localStorage-like API for CLI environment with automatic
 * file system persistence and crash recovery.
 * 
 * @module storage/manager
 * @author Azure Code Team
 * @version 1.0.0
 */

import { promises as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import type {
  AppState,
  ConversationHistory,
  Message,
  FileOperation,
} from '../../types/index.js';
import { DEFAULT_MODEL } from '../models/config.js';

/**
 * Storage file paths
 */
const STORAGE_DIR = join(homedir(), '.azure-code');
const STATE_FILE = join(STORAGE_DIR, 'state.json');
const BACKUP_FILE = join(STORAGE_DIR, 'state.backup.json');

/**
 * Current application state schema version
 * Used for migration support when schema changes
 */
const CURRENT_VERSION = '1.0.0';

/**
 * Default application state
 */
const DEFAULT_STATE: AppState = {
  conversations: {},
  activeModel: DEFAULT_MODEL,
  workspace: {
    root: process.cwd(),
    recentFiles: [],
  },
  preferences: {
    showTokens: false,
    confirmWrites: true,
  },
  version: CURRENT_VERSION,
};

/**
 * Storage Manager
 * 
 * Singleton class managing all persistent storage operations
 * with atomic writes and automatic backups.
 */
export class StorageManager {
  private static instance: StorageManager;
  private state: AppState;
  private initialized: boolean = false;
  
  private constructor() {
    this.state = { ...DEFAULT_STATE };
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }
  
  /**
   * Initialize storage system
   * 
   * Creates storage directory if needed and loads existing state.
   * Call this before any storage operations.
   * 
   * @returns Promise resolving when initialization complete
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Ensure storage directory exists
      await fs.mkdir(STORAGE_DIR, { recursive: true });
      
      // Load existing state if available
      await this.loadState();
      
      this.initialized = true;
    } catch (error) {
      console.error('Storage initialization failed:', error);
      // Use default state if loading fails
      this.state = { ...DEFAULT_STATE };
      this.initialized = true;
    }
  }
  
  /**
   * Load state from disk
   * 
   * Attempts to load from primary file, falls back to backup if needed.
   * 
   * @private
   */
  private async loadState(): Promise<void> {
    try {
      const data = await fs.readFile(STATE_FILE, 'utf-8');
      this.state = JSON.parse(data);
      
      // Validate and migrate if needed
      this.state = this.validateAndMigrate(this.state);
    } catch (error) {
      // Try backup file
      try {
        const backupData = await fs.readFile(BACKUP_FILE, 'utf-8');
        this.state = JSON.parse(backupData);
        this.state = this.validateAndMigrate(this.state);
        
        // Restore from backup
        await this.saveState();
      } catch {
        // No existing state, use defaults
        this.state = { ...DEFAULT_STATE };
      }
    }
  }
  
  /**
   * Save state to disk
   * 
   * Implements atomic write with backup to prevent corruption.
   * 
   * @private
   */
  private async saveState(): Promise<void> {
    try {
      const data = JSON.stringify(this.state, null, 2);
      
      // Create backup of current state
      try {
        await fs.copyFile(STATE_FILE, BACKUP_FILE);
      } catch {
        // No existing file to backup
      }
      
      // Write new state atomically
      const tempFile = `${STATE_FILE}.tmp`;
      await fs.writeFile(tempFile, data, 'utf-8');
      await fs.rename(tempFile, STATE_FILE);
    } catch (error) {
      console.error('Failed to save state:', error);
      throw new Error('Storage save failed');
    }
  }
  
  /**
   * Validate and migrate state schema
   * 
   * Ensures loaded state matches current schema version.
   * Implements migrations for backward compatibility.
   * 
   * @param state - Loaded state to validate
   * @returns Validated and migrated state
   * @private
   */
  private validateAndMigrate(state: unknown): AppState {
    // Basic validation
    if (typeof state !== 'object' || state === null) {
      return { ...DEFAULT_STATE };
    }
    
    const s = state as Partial<AppState>;
    
    // Check version and migrate if needed
    if (s.version !== CURRENT_VERSION) {
      // Future: Implement migration logic here
      console.log(`Migrating state from ${s.version || 'unknown'} to ${CURRENT_VERSION}`);
    }
    
    // Merge with defaults to handle missing fields
    return {
      conversations: s.conversations || {},
      activeModel: s.activeModel || DEFAULT_MODEL,
      workspace: {
        root: s.workspace?.root || process.cwd(),
        recentFiles: s.workspace?.recentFiles || [],
      },
      preferences: {
        showTokens: s.preferences?.showTokens ?? false,
        confirmWrites: s.preferences?.confirmWrites ?? true,
      },
      version: CURRENT_VERSION,
    };
  }
  
  /**
   * Get conversation history for specific model
   * 
   * @param modelId - Model identifier
   * @returns Conversation history or empty history if none exists
   */
  getConversation(modelId: string): ConversationHistory {
    if (!this.initialized) {
      throw new Error('Storage not initialized');
    }
    
    return this.state.conversations[modelId] || {
      messages: [],
      lastModified: Date.now(),
      totalTokens: 0,
      messageCount: 0,
      fileOperations: [],
    };
  }
  
  /**
   * Save conversation history for specific model
   * 
   * @param modelId - Model identifier
   * @param conversation - Conversation history to save
   */
  async saveConversation(
    modelId: string,
    conversation: ConversationHistory
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('Storage not initialized');
    }
    
    this.state.conversations[modelId] = {
      ...conversation,
      lastModified: Date.now(),
    };
    
    await this.saveState();
  }
  
  /**
   * Add message to conversation
   * 
   * Convenience method to append a message to model's conversation.
   * 
   * @param modelId - Model identifier
   * @param message - Message to add
   */
  async addMessage(modelId: string, message: Message): Promise<void> {
    const conversation = this.getConversation(modelId);
    
    conversation.messages.push(message);
    conversation.messageCount = conversation.messages.length;
    conversation.totalTokens += message.tokenCount || 0;
    
    await this.saveConversation(modelId, conversation);
  }
  
  /**
   * Clear conversation for specific model
   * 
   * @param modelId - Model identifier
   */
  async clearConversation(modelId: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Storage not initialized');
    }
    
    delete this.state.conversations[modelId];
    await this.saveState();
  }
  
  /**
   * Clear all conversations
   */
  async clearAllConversations(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Storage not initialized');
    }
    
    this.state.conversations = {};
    await this.saveState();
  }
  
  /**
   * Get active model ID
   */
  getActiveModel(): string {
    return this.state.activeModel;
  }
  
  /**
   * Set active model
   * 
   * @param modelId - Model identifier
   */
  async setActiveModel(modelId: string): Promise<void> {
    this.state.activeModel = modelId;
    await this.saveState();
  }
  
  /**
   * Get workspace configuration
   */
  getWorkspace(): AppState['workspace'] {
    return { ...this.state.workspace };
  }
  
  /**
   * Set workspace root directory
   * 
   * @param root - Absolute path to workspace root
   */
  async setWorkspaceRoot(root: string): Promise<void> {
    this.state.workspace.root = root;
    await this.saveState();
  }
  
  /**
   * Add file to recent files list
   * 
   * @param filePath - File path to add
   */
  async addRecentFile(filePath: string): Promise<void> {
    const recentFiles = this.state.workspace.recentFiles;
    
    // Remove if already exists (move to top)
    const index = recentFiles.indexOf(filePath);
    if (index !== -1) {
      recentFiles.splice(index, 1);
    }
    
    // Add to beginning
    recentFiles.unshift(filePath);
    
    // Limit to 20 recent files
    if (recentFiles.length > 20) {
      recentFiles.pop();
    }
    
    await this.saveState();
  }
  
  /**
   * Get user preferences
   */
  getPreferences(): AppState['preferences'] {
    return { ...this.state.preferences };
  }
  
  /**
   * Update user preferences
   * 
   * @param preferences - Partial preferences to update
   */
  async updatePreferences(
    preferences: Partial<AppState['preferences']>
  ): Promise<void> {
    this.state.preferences = {
      ...this.state.preferences,
      ...preferences,
    };
    await this.saveState();
  }
  
  /**
   * Add file operation to conversation history
   * 
   * @param modelId - Model identifier
   * @param operation - File operation to record
   */
  async addFileOperation(
    modelId: string,
    operation: FileOperation
  ): Promise<void> {
    const conversation = this.getConversation(modelId);
    conversation.fileOperations.push(operation);
    await this.saveConversation(modelId, conversation);
  }
  
  /**
   * Get complete application state
   * 
   * @returns Current application state
   */
  getState(): AppState {
    return JSON.parse(JSON.stringify(this.state));
  }
  
  /**
   * Export state to file
   * 
   * Creates a timestamped export for backup purposes.
   * 
   * @param exportPath - Optional custom export path
   * @returns Path to exported file
   */
  async exportState(exportPath?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultPath = join(STORAGE_DIR, `export-${timestamp}.json`);
    const path = exportPath || defaultPath;
    
    const data = JSON.stringify(this.state, null, 2);
    await fs.writeFile(path, data, 'utf-8');
    
    return path;
  }
}

/**
 * Export singleton instance for convenience
 */
export const storage = StorageManager.getInstance();

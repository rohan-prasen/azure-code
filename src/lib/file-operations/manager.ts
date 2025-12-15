/**
 * File Operations Manager
 * 
 * Provides safe, comprehensive file system operations for AI coding assistance.
 * Includes read, write, list, search capabilities with proper error handling
 * and security boundaries.
 * 
 * @module file-operations
 * @author Azure Code Team
 * @version 1.0.0
 */

import { promises as fs } from 'node:fs';
import { join, relative, resolve, extname } from 'node:path';
import { glob } from 'fast-glob';
import type { FileContent, FileOperation } from '../../types/index.js';

/**
 * Maximum file size to read (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Maximum files to return in search
 */
const MAX_SEARCH_RESULTS = 50;

/**
 * Language detection by file extension
 */
const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.rs': 'rust',
  '.go': 'go',
  '.java': 'java',
  '.cpp': 'cpp',
  '.c': 'c',
  '.h': 'c',
  '.cs': 'csharp',
  '.rb': 'ruby',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.scala': 'scala',
  '.sh': 'bash',
  '.zsh': 'bash',
  '.fish': 'fish',
  '.ps1': 'powershell',
  '.sql': 'sql',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.xml': 'xml',
  '.md': 'markdown',
  '.graphql': 'graphql',
  '.vue': 'vue',
  '.svelte': 'svelte',
};

/**
 * File Operations Manager
 * 
 * Centralized manager for all file system operations with
 * workspace boundaries and safety checks.
 */
export class FileOperationsManager {
  private workspaceRoot: string;
  
  constructor(workspaceRoot: string) {
    this.workspaceRoot = resolve(workspaceRoot);
  }
  
  /**
   * Set workspace root directory
   * 
   * @param root - New workspace root path
   */
  setWorkspaceRoot(root: string): void {
    this.workspaceRoot = resolve(root);
  }
  
  /**
   * Get current workspace root
   */
  getWorkspaceRoot(): string {
    return this.workspaceRoot;
  }
  
  /**
   * Validate path is within workspace
   * 
   * Security check to prevent access outside workspace boundaries.
   * 
   * @param filePath - Path to validate
   * @returns True if path is within workspace
   * @private
   */
  private isWithinWorkspace(filePath: string): boolean {
    const resolvedPath = resolve(this.workspaceRoot, filePath);
    return resolvedPath.startsWith(this.workspaceRoot);
  }
  
  /**
   * Resolve path relative to workspace
   * 
   * @param filePath - Relative or absolute path
   * @returns Absolute path within workspace
   * @throws Error if path is outside workspace
   * @private
   */
  private resolvePath(filePath: string): string {
    const resolved = resolve(this.workspaceRoot, filePath);
    
    if (!this.isWithinWorkspace(filePath)) {
      throw new Error(`Path outside workspace: ${filePath}`);
    }
    
    return resolved;
  }
  
  /**
   * Detect language from file extension
   * 
   * @param filePath - File path
   * @returns Language identifier or undefined
   * @private
   */
  private detectLanguage(filePath: string): string | undefined {
    const ext = extname(filePath).toLowerCase();
    return LANGUAGE_MAP[ext];
  }
  
  /**
   * Read file contents
   * 
   * Safely reads file with size limits and encoding detection.
   * Large files are automatically truncated with indicator.
   * 
   * @param filePath - Path to file (relative to workspace)
   * @returns File content with metadata
   */
  async readFile(filePath: string): Promise<FileContent> {
    const operation: FileOperation = {
      type: 'read',
      path: filePath,
      success: false,
      timestamp: Date.now(),
    };
    
    try {
      const absolutePath = this.resolvePath(filePath);
      
      // Check file exists and get stats
      const stats = await fs.stat(absolutePath);
      
      if (!stats.isFile()) {
        throw new Error('Path is not a file');
      }
      
      // Check file size
      const truncated = stats.size > MAX_FILE_SIZE;
      let content: string;
      
      if (truncated) {
        // Read first MAX_FILE_SIZE bytes
        const buffer = Buffer.alloc(MAX_FILE_SIZE);
        const fd = await fs.open(absolutePath, 'r');
        await fd.read(buffer, 0, MAX_FILE_SIZE, 0);
        await fd.close();
        content = buffer.toString('utf-8');
      } else {
        content = await fs.readFile(absolutePath, 'utf-8');
      }
      
      operation.success = true;
      
      return {
        path: filePath,
        content,
        language: this.detectLanguage(filePath),
        size: stats.size,
        truncated,
      };
    } catch (error) {
      operation.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }
  
  /**
   * Write file contents
   * 
   * Safely writes file with directory creation if needed.
   * 
   * @param filePath - Path to file (relative to workspace)
   * @param content - Content to write
   * @param createDirs - Whether to create parent directories (default: true)
   */
  async writeFile(
    filePath: string,
    content: string,
    createDirs: boolean = true
  ): Promise<void> {
    const operation: FileOperation = {
      type: 'write',
      path: filePath,
      success: false,
      timestamp: Date.now(),
    };
    
    try {
      const absolutePath = this.resolvePath(filePath);
      
      // Create parent directories if needed
      if (createDirs) {
        const dir = join(absolutePath, '..');
        await fs.mkdir(dir, { recursive: true });
      }
      
      await fs.writeFile(absolutePath, content, 'utf-8');
      operation.success = true;
    } catch (error) {
      operation.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }
  
  /**
   * List directory contents
   * 
   * Returns files and directories with metadata.
   * 
   * @param dirPath - Directory path (relative to workspace)
   * @param recursive - Whether to list recursively (default: false)
   * @returns Array of file/directory paths
   */
  async listDirectory(
    dirPath: string = '.',
    recursive: boolean = false
  ): Promise<string[]> {
    const operation: FileOperation = {
      type: 'list',
      path: dirPath,
      success: false,
      timestamp: Date.now(),
    };
    
    try {
      const absolutePath = this.resolvePath(dirPath);
      
      const pattern = recursive ? '**/*' : '*';
      const files = await glob(pattern, {
        cwd: absolutePath,
        dot: false, // Exclude hidden files
        onlyFiles: false,
        markDirectories: true,
      });
      
      operation.success = true;
      operation.data = { count: files.length };
      
      return files;
    } catch (error) {
      operation.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }
  
  /**
   * Search files by pattern
   * 
   * Searches for files matching glob pattern.
   * 
   * @param pattern - Glob pattern
   * @param baseDir - Base directory for search (default: workspace root)
   * @returns Array of matching file paths
   */
  async searchFiles(
    pattern: string,
    baseDir: string = '.'
  ): Promise<string[]> {
    const operation: FileOperation = {
      type: 'search',
      path: baseDir,
      success: false,
      timestamp: Date.now(),
    };
    
    try {
      const absolutePath = this.resolvePath(baseDir);
      
      const files = await glob(pattern, {
        cwd: absolutePath,
        dot: false,
        onlyFiles: true,
        absolute: false,
      });
      
      // Limit results
      const limitedFiles = files.slice(0, MAX_SEARCH_RESULTS);
      
      operation.success = true;
      operation.data = {
        count: limitedFiles.length,
        totalMatches: files.length,
        truncated: files.length > MAX_SEARCH_RESULTS,
      };
      
      return limitedFiles;
    } catch (error) {
      operation.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }
  
  /**
   * Search file contents by text pattern
   * 
   * Searches for files containing specific text (simple string match).
   * For regex search, use external tools like ripgrep.
   * 
   * @param searchText - Text to search for
   * @param filePattern - File pattern to search within (default: all files)
   * @param baseDir - Base directory for search
   * @returns Array of files containing the text
   */
  async searchFileContents(
    searchText: string,
    filePattern: string = '**/*',
    baseDir: string = '.'
  ): Promise<Array<{ path: string; matches: number }>> {
    try {
      const absolutePath = this.resolvePath(baseDir);
      
      // Get all matching files
      const files = await glob(filePattern, {
        cwd: absolutePath,
        dot: false,
        onlyFiles: true,
        absolute: false,
      });
      
      const results: Array<{ path: string; matches: number }> = [];
      
      // Search each file
      for (const file of files) {
        try {
          const fullPath = join(absolutePath, file);
          const stats = await fs.stat(fullPath);
          
          // Skip large files
          if (stats.size > MAX_FILE_SIZE) continue;
          
          const content = await fs.readFile(fullPath, 'utf-8');
          const matches = (content.match(new RegExp(searchText, 'gi')) || []).length;
          
          if (matches > 0) {
            results.push({ path: file, matches });
          }
          
          // Limit results
          if (results.length >= MAX_SEARCH_RESULTS) break;
        } catch {
          // Skip files that can't be read
          continue;
        }
      }
      
      // Sort by match count
      return results.sort((a, b) => b.matches - a.matches);
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Check if path exists
   * 
   * @param filePath - Path to check
   * @returns True if exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      const absolutePath = this.resolvePath(filePath);
      await fs.access(absolutePath);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get file/directory stats
   * 
   * @param filePath - Path to get stats for
   * @returns File stats
   */
  async getStats(filePath: string) {
    const absolutePath = this.resolvePath(filePath);
    return await fs.stat(absolutePath);
  }
  
  /**
   * Read multiple files
   * 
   * Convenience method for reading multiple files efficiently.
   * 
   * @param filePaths - Array of file paths
   * @returns Array of file contents
   */
  async readMultipleFiles(filePaths: string[]): Promise<FileContent[]> {
    const results = await Promise.allSettled(
      filePaths.map(path => this.readFile(path))
    );
    
    return results
      .filter((r): r is PromiseFulfilledResult<FileContent> => r.status === 'fulfilled')
      .map(r => r.value);
  }
}

/**
 * Create file operations manager instance
 * 
 * @param workspaceRoot - Workspace root directory
 * @returns File operations manager
 */
export function createFileOperationsManager(workspaceRoot: string): FileOperationsManager {
  return new FileOperationsManager(workspaceRoot);
}

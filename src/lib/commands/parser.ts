/**
 * Slash Commands System
 * 
 * Implements command parsing and handling for user-initiated slash commands.
 * Provides a clean interface for special operations like model switching,
 * file operations, and conversation management.
 * 
 * @module commands
 * @author Azure Code Team
 * @version 1.0.0
 */

import type { SlashCommand } from '../../types/index.js';

/**
 * Available slash commands registry
 * 
 * Each command is fully documented with usage examples for help display.
 */
export const SLASH_COMMANDS: SlashCommand[] = [
  {
    name: 'model',
    description: 'Switch to a different AI model',
    usage: '/model - Opens model selector',
    requiresArgs: false,
  },
  {
    name: 'clear',
    description: 'Clear current conversation history',
    usage: '/clear - Clears all messages for active model',
    requiresArgs: false,
  },
  {
    name: 'clearall',
    description: 'Clear all conversations for all models',
    usage: '/clearall - Clears conversation history for all models',
    requiresArgs: false,
  },
  {
    name: 'workspace',
    description: 'Set workspace directory',
    usage: '/workspace [path] - Sets or displays workspace root',
    requiresArgs: false,
  },
  {
    name: 'file',
    description: 'Read and discuss a file',
    usage: '/file <path> - Reads file and adds to context',
    requiresArgs: true,
  },
  {
    name: 'files',
    description: 'Read multiple files',
    usage: '/files <path1> <path2> ... - Reads multiple files',
    requiresArgs: true,
  },
  {
    name: 'search',
    description: 'Search for files by name pattern',
    usage: '/search <pattern> - Searches files matching glob pattern',
    requiresArgs: true,
  },
  {
    name: 'find',
    description: 'Search file contents',
    usage: '/find <text> [pattern] - Searches for text in files',
    requiresArgs: true,
  },
  {
    name: 'ls',
    description: 'List directory contents',
    usage: '/ls [path] - Lists files in directory',
    aliases: ['list', 'dir'],
    requiresArgs: false,
  },
  {
    name: 'help',
    description: 'Show available commands',
    usage: '/help - Displays this help message',
    aliases: ['?', 'commands'],
    requiresArgs: false,
  },
  {
    name: 'tokens',
    description: 'Toggle token count display',
    usage: '/tokens - Toggles token counter in messages',
    requiresArgs: false,
  },
  {
    name: 'export',
    description: 'Export conversation history',
    usage: '/export [path] - Exports conversation to JSON file',
    requiresArgs: false,
  },
  {
    name: 'exit',
    description: 'Exit Azure Code',
    usage: '/exit - Quits the application',
    aliases: ['quit', 'q'],
    requiresArgs: false,
  },
];

/**
 * Parsed command structure
 */
export interface ParsedCommand {
  /** Command name (without slash) */
  command: string;
  
  /** Command arguments array */
  args: string[];
  
  /** Original input text */
  rawInput: string;
  
  /** Whether command is valid */
  isValid: boolean;
  
  /** Matched command definition */
  definition?: SlashCommand;
}

/**
 * Command Parser
 * 
 * Parses user input and validates against registered commands.
 */
export class CommandParser {
  private commands: Map<string, SlashCommand>;
  
  constructor() {
    this.commands = new Map();
    this.registerCommands();
  }
  
  /**
   * Register all slash commands
   * 
   * Builds command registry including aliases for fast lookup.
   * 
   * @private
   */
  private registerCommands(): void {
    for (const cmd of SLASH_COMMANDS) {
      // Register primary command name
      this.commands.set(cmd.name, cmd);
      
      // Register aliases
      if (cmd.aliases) {
        for (const alias of cmd.aliases) {
          this.commands.set(alias, cmd);
        }
      }
    }
  }
  
  /**
   * Check if input starts with slash command
   * 
   * @param input - User input
   * @returns True if input is a command
   */
  isCommand(input: string): boolean {
    return input.trim().startsWith('/');
  }
  
  /**
   * Parse command from user input
   * 
   * Extracts command name and arguments, validates against registry.
   * 
   * @param input - User input starting with slash
   * @returns Parsed command structure
   */
  parse(input: string): ParsedCommand {
    const trimmed = input.trim();
    
    if (!this.isCommand(trimmed)) {
      return {
        command: '',
        args: [],
        rawInput: input,
        isValid: false,
      };
    }
    
    // Remove leading slash and split into parts
    const parts = trimmed.slice(1).split(/\s+/);
    const commandName = parts[0]?.toLowerCase() || '';
    const args = parts.slice(1);
    
    // Look up command definition
    const definition = this.commands.get(commandName);
    
    // Validate
    const isValid = definition !== undefined;
    const hasRequiredArgs = !definition?.requiresArgs || args.length > 0;
    
    return {
      command: commandName,
      args,
      rawInput: input,
      isValid: isValid && hasRequiredArgs,
      definition,
    };
  }
  
  /**
   * Get command suggestions for partial input
   * 
   * Used for autocomplete functionality.
   * 
   * @param partial - Partial command input
   * @returns Array of matching command names
   */
  getSuggestions(partial: string): string[] {
    const searchTerm = partial.toLowerCase().replace(/^\//, '');
    
    if (!searchTerm) {
      return SLASH_COMMANDS.map(cmd => `/${cmd.name}`);
    }
    
    const matches: string[] = [];
    
    for (const cmd of SLASH_COMMANDS) {
      if (cmd.name.startsWith(searchTerm)) {
        matches.push(`/${cmd.name}`);
      }
    }
    
    return matches;
  }
  
  /**
   * Get all available commands
   * 
   * @returns Array of command definitions
   */
  getAllCommands(): SlashCommand[] {
    return [...SLASH_COMMANDS];
  }
  
  /**
   * Get help text for specific command
   * 
   * @param commandName - Command name (without slash)
   * @returns Help text or undefined if not found
   */
  getHelp(commandName: string): string | undefined {
    const cmd = this.commands.get(commandName);
    if (!cmd) return undefined;
    
    let help = `${cmd.name}: ${cmd.description}\n`;
    help += `Usage: ${cmd.usage}`;
    
    if (cmd.aliases && cmd.aliases.length > 0) {
      help += `\nAliases: ${cmd.aliases.join(', ')}`;
    }
    
    return help;
  }
  
  /**
   * Generate full help text
   * 
   * @returns Formatted help text for all commands
   */
  generateHelpText(): string {
    let help = 'Available Commands:\n\n';
    
    for (const cmd of SLASH_COMMANDS) {
      help += `  /${cmd.name}\n`;
      help += `    ${cmd.description}\n`;
      help += `    ${cmd.usage}\n`;
      
      if (cmd.aliases && cmd.aliases.length > 0) {
        help += `    Aliases: ${cmd.aliases.map(a => `/${a}`).join(', ')}\n`;
      }
      
      help += '\n';
    }
    
    return help;
  }
}

/**
 * Command Result
 * 
 * Standard return type for command handlers
 */
export interface CommandResult {
  /** Whether command executed successfully */
  success: boolean;
  
  /** Result message to display */
  message?: string;
  
  /** Result data (command-specific) */
  data?: unknown;
  
  /** Error message if failed */
  error?: string;
  
  /** Whether to trigger special UI action */
  action?: 'model-select' | 'exit' | 'refresh' | 'clear-ui';
}

/**
 * Export singleton parser instance
 */
export const commandParser = new CommandParser();

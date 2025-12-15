#!/usr/bin/env bun
/**
 * Azure Code - AI Coding Assistant CLI
 * 
 * Main entry point for the Azure Code application.
 * Initializes all systems, validates configuration, and launches
 * the interactive terminal interface.
 * 
 * @author Azure Code Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { render } from 'ink';
import 'dotenv/config';
import { config } from 'dotenv';
import { App } from './components/App.js';
import { LoadingAnimation } from './components/LoadingAnimation.js';
import chalk from 'chalk';

/**
 * Azure Blue color scheme
 */
const AZURE_BLUE = '#0078D4';

/**
 * Initialize environment and configuration
 * 
 * Loads environment variables from .env file
 */
function initializeEnvironment(): boolean {
  // Load .env from current directory
  config();
  
  // Validate required environment variables
  const requiredVars = [
    'ANTHROPIC_API_KEY',
    'ANTHROPIC_ENDPOINT',
  ];
  
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    console.error(chalk.red('\nMissing required environment variables:'));
    for (const varName of missing) {
      console.error(chalk.red(`  - ${varName}`));
    }
    console.error(chalk.yellow('\nPlease configure these in your .env file.\n'));
    return false;
  }
  
  return true;
}

/**
 * Main app wrapper with loading animation
 */
function MainApp() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initialization (API validation happens in background)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Show loading for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingAnimation onComplete={() => setIsLoading(false)} />;
  }

  return <App />;
}

/**
 * Main application entry point
 * 
 * Orchestrates initialization sequence and launches CLI interface.
 */
async function main(): Promise<void> {
  try {
    // Check if stdin supports raw mode (required for Ink)
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
      console.error(chalk.red('\nError: This application requires an interactive terminal (TTY).'));
      console.error(chalk.yellow('Please run this application in:'));
      console.error(chalk.yellow('  - Windows Terminal'));
      console.error(chalk.yellow('  - PowerShell'));
      console.error(chalk.yellow('  - Git Bash'));
      console.error(chalk.yellow('  - WSL'));
      console.error(chalk.red('\nCommand Prompt (cmd.exe) is not supported.\n'));
      process.exit(1);
    }
    
    // Initialize environment
    const envValid = initializeEnvironment();
    if (!envValid) {
      process.exit(1);
    }
    
    // Launch interactive interface with loading animation
    // Clear screen initially to start fresh
    console.clear();
    
    const instance = render(<MainApp />, {
      exitOnCtrlC: false,
      patchConsole: false,
    });
    
  } catch (error) {
    console.error(chalk.red('\nFatal error during initialization:'));
    console.error(error);
    process.exit(1);
  }
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\nUncaught exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('\nUnhandled rejection:'), reason);
  process.exit(1);
});

// Run application
main();

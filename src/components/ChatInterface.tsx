/**
 * Chat Interface - Minimal Clean Design
 * 
 * Ultra-clean interface with:
 * - User queries: Bold with > prefix
 * - AI output: Dimmed white with markdown formatting
 * - Pacman loading animation
 * - Bordered input box
 * 
 * @module components/ChatInterface
 * @author Azure Code Team
 * @version 12.0.0
 */

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import type { Message } from '../types/index.js';
import { MarkdownRenderer } from './MarkdownRenderer.js';
import { Banner } from './Banner.js';
import { Header } from './Header.js';
import { CommandDropdown } from './CommandDropdown.js';
import { PacmanLoader } from './PacmanLoader.js';
import { SLASH_COMMANDS } from '../lib/commands/parser.js';
import { useTerminalSize, getResponsivePadding, getMaxMessageCount } from '../hooks/useTerminalSize.js';

interface ChatInterfaceProps {
  model: string;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
}

const AZURE_CYAN = '#50E6FF';

/**
 * Single Message Item Component - Memoized to prevent re-renders
 */
const MessageItem = React.memo(({ msg, terminalWidth }: { msg: Message, terminalWidth: number }) => {
  const isUser = msg.role === 'user';
  
  return (
    <Box flexDirection="column" marginTop={1}>
      {isUser ? (
        /* User message: Bold with > prefix */
        <Box>
          <Text color={AZURE_CYAN} bold>{'> '}</Text>
          <Text bold>{msg.content}</Text>
        </Box>
      ) : (
        /* AI message: Dimmed markdown below query */
        <Box flexDirection="column" marginTop={0} marginLeft={2}>
          <MarkdownRenderer content={msg.content || ' '} terminalWidth={terminalWidth} />
        </Box>
      )}
    </Box>
  );
});

/**
 * Message List Component - Memoized wrapper for the list
 */
const MessageList = React.memo(({ 
  messages, 
  isLoading, 
  error, 
  responsivePadding,
  hasTruncatedHistory,
  terminalWidth
}: { 
  messages: Message[]; 
  isLoading: boolean; 
  error: string | null;
  responsivePadding: number;
  hasTruncatedHistory: boolean;
  terminalWidth: number;
}) => {
  return (
    <Box flexDirection="column" flexGrow={1} paddingX={responsivePadding}>
      {/* Show truncated history indicator */}
      {hasTruncatedHistory && (
        <Box justifyContent="center" marginTop={1} marginBottom={1}>
          <Text color="gray" dimColor>... previous messages ...</Text>
        </Box>
      )}

      {/* Show banner when no messages */}
      {messages.length === 0 && !isLoading && !hasTruncatedHistory && (
        <Banner />
      )}
      
      {/* Render messages */}
      {messages.map((msg) => (
        <MessageItem key={msg.id} msg={msg} terminalWidth={terminalWidth} />
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        <Box marginTop={1} marginLeft={2}>
          <PacmanLoader />
        </Box>
      )}
      
      {/* Error display */}
      {error && (
        <Box flexDirection="column" marginTop={1}>
          <Box>
            <Text color="red" bold>{'✕ '}</Text>
            <Text color="red">{error}</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
});

/**
 * Chat Input Component - Isolated state to prevent global re-renders
 */
const ChatInput = React.memo(({ 
  onSendMessage, 
  responsivePadding,
  terminalWidth
}: { 
  onSendMessage: (message: string) => void;
  responsivePadding: number;
  terminalWidth: number;
}) => {
  const [input, setInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownIndex, setDropdownIndex] = useState(0);
  // Remove useTerminalSize hook from here to reduce overhead
  const handlingSpecialKey = useRef(false);

  // Use refs to access latest state in callbacks without re-creating them
  const stateRef = useRef({ input, showDropdown, dropdownIndex });
  
  // Sync refs with state
  useEffect(() => {
    stateRef.current = { input, showDropdown, dropdownIndex };
  }, [input, showDropdown, dropdownIndex]);

  /**
   * Get filtered commands for dropdown - Memoized with dependency stability
   */
  const getFilteredCommands = useCallback((currentInput: string) => {
    const searchTerm = currentInput.toLowerCase().replace(/^\//, '');
    
    if (!searchTerm) {
      return SLASH_COMMANDS;
    }
    
    return SLASH_COMMANDS.filter(cmd => {
      return (
        cmd.name.toLowerCase().includes(searchTerm) ||
        cmd.description.toLowerCase().includes(searchTerm) ||
        (cmd.aliases && cmd.aliases.some(a => a.toLowerCase().includes(searchTerm)))
      );
    });
  }, []);

  /**
   * Handle input changes
   */
  const handleInputChange = useCallback((value: string) => {
    if (handlingSpecialKey.current) return;
    
    setInput(value);
    
    if (value.startsWith('/') && value.length > 0) {
      setShowDropdown(true);
      setDropdownIndex(0);
    } else {
      setShowDropdown(false);
    }
  }, []);

  /**
   * Handle message submission
   */
  const handleSubmit = useCallback((value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;
    
    const { showDropdown: currentShowDropdown, dropdownIndex: currentDropdownIndex } = stateRef.current;
    
    if (currentShowDropdown) {
      const filteredCommands = getFilteredCommands(value);
      
      if (filteredCommands.length > 0) {
        const selected = filteredCommands[currentDropdownIndex];
        if (selected) {
          if (!selected.requiresArgs) {
            onSendMessage(`/${selected.name}`);
          } else {
            const inputParts = trimmedValue.split(' ');
            if (inputParts.length > 1) {
              onSendMessage(trimmedValue);
            } else {
              setInput(`/${selected.name} `);
              setShowDropdown(false);
              return;
            }
          }
          setInput('');
          setShowDropdown(false);
          return;
        }
      }
    }
    
    onSendMessage(trimmedValue);
    setInput('');
    setShowDropdown(false);
  }, [onSendMessage, getFilteredCommands]);

  /**
   * Handle keyboard input for dropdown navigation
   */
  useInput((inputChar, key) => {
    if (!stateRef.current.showDropdown) return;
    
    const { input: currentInput, dropdownIndex: currentIndex } = stateRef.current;
    const filteredCommands = getFilteredCommands(currentInput);
    
    if (key.upArrow) {
      handlingSpecialKey.current = true;
      setDropdownIndex(Math.max(0, currentIndex - 1));
      setTimeout(() => { handlingSpecialKey.current = false; }, 0);
      return;
    }
    
    if (key.downArrow) {
      handlingSpecialKey.current = true;
      setDropdownIndex(Math.min(filteredCommands.length - 1, currentIndex + 1));
      setTimeout(() => { handlingSpecialKey.current = false; }, 0);
      return;
    }
    
    if (key.tab) {
      handlingSpecialKey.current = true;
      const selected = filteredCommands[currentIndex];
      if (selected) {
        setInput(`/${selected.name} `);
        setShowDropdown(false);
      }
      setTimeout(() => { handlingSpecialKey.current = false; }, 0);
      return;
    }
    
    if (key.escape) {
      handlingSpecialKey.current = true;
      setShowDropdown(false);
      setTimeout(() => { handlingSpecialKey.current = false; }, 0);
      return;
    }
  }, { isActive: showDropdown });

  return (
    <Box flexDirection="column">
      {/* Command dropdown */}
      {showDropdown && (
        <Box paddingX={responsivePadding} paddingBottom={1}>
          <CommandDropdown filter={input} selectedIndex={dropdownIndex} />
        </Box>
      )}
      
      {/* Input area */}
      <Box paddingX={responsivePadding} paddingY={1}>
        <Box flexDirection="column" width="100%">
          <Box marginBottom={0}>
            <Text color={AZURE_CYAN} dimColor>◆ Message</Text>
          </Box>
          <Box flexDirection="column">
            <Box>
              <Text color={AZURE_CYAN}>
                {'╭' + '─'.repeat(Math.min(terminalWidth - responsivePadding * 2 - 2, 100)) + '╮'}
              </Text>
            </Box>
            <Box>
              <Text color={AZURE_CYAN}>│ </Text>
              <Text color={AZURE_CYAN} bold>▸ </Text>
              <Box flexGrow={1}>
                <TextInput
                  value={input}
                  onChange={handleInputChange}
                  onSubmit={handleSubmit}
                  placeholder="Type a message or press / for commands..."
                />
              </Box>
              <Text color={AZURE_CYAN}> │</Text>
            </Box>
            <Box>
              <Text color={AZURE_CYAN}>
                {'╰' + '─'.repeat(Math.min(terminalWidth - responsivePadding * 2 - 2, 100)) + '╯'}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

/**
 * Main chat interface component
 */
export const ChatInterface = React.memo(({
  model,
  messages,
  isLoading,
  error,
  onSendMessage,
}: ChatInterfaceProps) => {
  const terminalSize = useTerminalSize();
  const responsivePadding = getResponsivePadding(terminalSize.width);
  
  // Calculate max messages to display based on terminal height to prevent scrolling flicker
  // Reduce buffer to EXACTLY screen height to prevent rendering off-screen elements which Ink might struggle with
  const maxDisplayMessages = Math.max(5, getMaxMessageCount(terminalSize.height));
  
  // Slice messages to only show the most recent ones
  const displayedMessages = useMemo(() => {
    if (messages.length <= maxDisplayMessages) return messages;
    return messages.slice(messages.length - maxDisplayMessages);
  }, [messages, maxDisplayMessages]);

  const hasTruncatedHistory = messages.length > displayedMessages.length;
  
  // Calculate total token count from ALL messages (not just displayed ones)
  const totalTokens = useMemo(() => messages.reduce((sum, msg) => {
    return sum + (msg.tokenCount || 0);
  }, 0), [messages]);

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Header model={model} isLoading={isLoading} tokenCount={totalTokens} />
      
      {/* Messages area - use Static for better performance on large lists */}
      <Box flexDirection="column" flexGrow={1} overflowY="hidden">
        <MessageList 
          messages={displayedMessages} 
          isLoading={isLoading} 
          error={error} 
          responsivePadding={responsivePadding}
          hasTruncatedHistory={hasTruncatedHistory}
          terminalWidth={terminalSize.width}
        />
      </Box>
      
      {/* Isolated Input Area */}
      <ChatInput 
        onSendMessage={onSendMessage} 
        responsivePadding={responsivePadding} 
        terminalWidth={terminalSize.width}
      />
    </Box>
  );
});

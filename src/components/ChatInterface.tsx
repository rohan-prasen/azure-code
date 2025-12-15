/**
 * Chat Interface - Azure Code Edition
 * 
 * Implements "Fullscreen App" mode with Virtualization (Slicing).
 * - Layout: Fixed Height (100%). Header Top. Input Bottom.
 * - Performance: Only renders the last 25 messages to prevent React/Ink crash.
 * 
 * @module components/ChatInterface
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Message } from '../types/index.js';
import { MarkdownRenderer } from './MarkdownRenderer.js';
import { LandingView } from './LandingView.js';
import { StartupAnimation } from './StartupAnimation.js';
import { Header } from './Header.js';
import { ChatInputBox } from './ChatInputBox.js';
import { PacmanLoader } from './PacmanLoader.js';
import { useTerminalSize, getResponsivePadding } from '../hooks/useTerminalSize.js';
import { THEME } from '../lib/theme.js';

interface ChatInterfaceProps {
  model: string;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  skipLanding?: boolean;
  onLandingComplete?: () => void;
}

const MAX_VISIBLE_MESSAGES = 25;

const MessageItem = React.memo(({ msg, terminalWidth }: { msg: Message, terminalWidth: number }) => {
  const isUser = msg.role === 'user';
  return (
    <Box flexDirection="column" marginTop={1} marginBottom={1}>
      {isUser ? (
        <Box>
          <Text color={THEME.colors.secondary} bold>{'> '}</Text>
          <Text bold color={THEME.colors.text.main}>{msg.content}</Text>
        </Box>
      ) : (
        <Box flexDirection="column" marginTop={0} marginLeft={2}>
          <MarkdownRenderer content={msg.content || ' '} terminalWidth={terminalWidth} />
        </Box>
      )}
    </Box>
  );
});

export const ChatInterface = React.memo(({
  model,
  messages,
  isLoading,
  error,
  onSendMessage,
  skipLanding = false,
  onLandingComplete
}: ChatInterfaceProps) => {
  const terminalSize = useTerminalSize();
  const responsivePadding = getResponsivePadding(terminalSize.width);
  const [uiState, setUiState] = useState<'landing' | 'startup' | 'active'>('landing');

  useEffect(() => {
    if (skipLanding || messages.length > 0) {
      setUiState('active');
    }
  }, [skipLanding, messages.length]);

  useEffect(() => {
    if (messages.length > 0 && uiState !== 'active') {
      setUiState('active');
    }
  }, [messages.length, uiState]);

  useInput((input, key) => {
    if (uiState === 'landing' && key.return) {
      setUiState('startup');
    }
  });

  const handleStartupComplete = useCallback(() => {
    setUiState('active');
    onLandingComplete?.();
  }, [onLandingComplete]);

  const tokenCount = messages.reduce((acc, msg) => acc + (msg.tokenCount || 0), 0);

  // Virtualization / Slicing
  // We only render the last N messages to prevent the UI from choking/crashing.
  // This keeps the React Tree size constant O(1).
  const visibleMessages = useMemo(() => {
    const start = Math.max(0, messages.length - MAX_VISIBLE_MESSAGES);
    return messages.slice(start);
  }, [messages]);

  if (uiState === 'landing' && messages.length === 0) {
    return <LandingView />;
  }

  // Fullscreen App Layout
  return (
    <Box flexDirection="column" height="100%">

      {/* 1. Header (Fixed at Top) */}
      <Header model={model} isLoading={isLoading} tokenCount={tokenCount} />

      {uiState === 'startup' && (
        <Box flexGrow={1} flexDirection="column" justifyContent="center" alignItems="center">
          <StartupAnimation onComplete={handleStartupComplete} />
          <Box marginTop={1}>
            <Text color={THEME.colors.text.dim}>* Simmering...</Text>
          </Box>
        </Box>
      )}

      {uiState === 'active' && (
        <>
          {/* 2. Scrollable Message Area (Flexible) */}
          <Box flexDirection="column" flexGrow={1} paddingX={responsivePadding}>
            {visibleMessages.map((msg, index) => (
              <MessageItem
                // Use actual ID if available, else fallback to slice index + offset
                key={msg.id || (messages.length - visibleMessages.length + index)}
                msg={msg}
                terminalWidth={terminalSize.width}
              />
            ))}

            {isLoading && (
              <Box marginTop={1} marginLeft={2}>
                <PacmanLoader />
              </Box>
            )}

            {error && (
              <Box flexDirection="column" marginTop={1}>
                <Box>
                  <Text color={THEME.colors.text.error} bold>{'✕ '}</Text>
                  <Text color={THEME.colors.text.error}>{error}</Text>
                </Box>
              </Box>
            )}
          </Box>

          {/* 3. Input Area (Fixed at Bottom) */}
          <ChatInputBox
            onSendMessage={onSendMessage}
            responsivePadding={responsivePadding}
            terminalWidth={terminalSize.width}
          />
        </>
      )}
    </Box>
  );
});

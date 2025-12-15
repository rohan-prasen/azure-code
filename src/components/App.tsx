/**
 * Main Application - Gemini CLI Style
 * 
 * Clean, futuristic, minimal design.
 * 
 * @module components/App
 * @author Azure Code Team
 * @version 5.0.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useInput, useApp, Box } from 'ink';
import { ChatInterface } from './ChatInterface.js';
import { ModelSelector } from './ModelSelector.js';
import { storage } from '../lib/storage/manager.js';
import { aiClientManager } from '../lib/ai-clients/manager.js';
import { createContextManager } from '../lib/models/context-manager.js';
import { commandParser } from '../lib/commands/parser.js';
import { getSystemPrompt } from '../lib/models/system-prompts.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import type { Message } from '../types/index.js';

interface AppState {
  currentModel: string;
  messages: Message[];
  isLoading: boolean;
  showModelSelector: boolean;
  error: string | null;
  hasSeenLanding: boolean;
}

export function App() {
  const { exit } = useApp();
  const terminalSize = useTerminalSize();
  const [renderKey, setRenderKey] = useState(0);

  const [state, setState] = useState<AppState>({
    currentModel: storage.getActiveModel(),
    messages: [],
    isLoading: false,
    showModelSelector: false,
    error: null,
    hasSeenLanding: false,
  });

  // Refs for state stability and buffering
  const stateRef = React.useRef(state);
  // Keep ref synced with state on every render
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const handleModelSelect = useCallback(async (modelId: string) => {
    // Clear screen to prevent UI duplication
    console.clear();

    // Update state first
    setState(prev => ({
      ...prev,
      showModelSelector: false,
      currentModel: modelId,
      messages: [],
    }));

    // Increment render key to force remount
    setRenderKey(prev => prev + 1);

    await storage.setActiveModel(modelId);
  }, []);

  const handleModelCancel = useCallback(() => {
    // Clear screen to prevent UI duplication
    console.clear();

    setState(prev => ({ ...prev, showModelSelector: false }));
    setRenderKey(prev => prev + 1);
  }, []);

  const handleLandingComplete = useCallback(() => {
    setState(prev => ({ ...prev, hasSeenLanding: true }));
  }, []);

  const handleSendMessage = useCallback(async (content: string) => {
    // Access current state via ref to keep function stable
    const currentState = stateRef.current;

    // Handle commands
    if (commandParser.isCommand(content)) {
      const parsed = commandParser.parse(content);

      if (!parsed.isValid) {
        setState(prev => ({ ...prev, error: `Unknown command: ${parsed.command}` }));
        return;
      }

      switch (parsed.command) {
        case 'model':
          setState(prev => ({ ...prev, showModelSelector: true }));
          setRenderKey(prev => prev + 1);
          return;
        case 'clear':
          setState(prev => ({ ...prev, messages: [] }));
          return;
        case 'clearall':
          setState(prev => ({ ...prev, messages: [] }));
          return;
        case 'exit':
        case 'quit':
        case 'q':
          exit();
          return;
      }
    }

    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelId: currentState.currentModel,
    };

    // Update state with user message and empty assistant message
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage, assistantMessage],
      isLoading: true,
      error: null,
      hasSeenLanding: true, // Ensure we skip landing if user sends msg
    }));

    try {
      // Prepare context using the snapshot from the ref
      const contextManager = createContextManager(currentState.currentModel);
      const systemPrompt = getSystemPrompt(currentState.currentModel);
      const allMessages = [...currentState.messages, userMessage];
      const contextMessages = contextManager.prepareContext(systemPrompt, allMessages);

      // Streaming State
      let accumulatedContent = '';
      let finalTokenCount = 0;
      let isComplete = false;

      // RENDER LOOP: Decouple network stream from UI updates
      // Update UI at ~30 FPS (33ms) to prevent render flooding
      const renderInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, content: accumulatedContent, tokenCount: finalTokenCount }
              : msg
          ),
        }));

        if (isComplete) {
          clearInterval(renderInterval);
        }
      }, 33);

      // DATA LOOP: Consume stream as fast as possible
      for await (const chunk of aiClientManager.streamCompletion(contextMessages, currentState.currentModel)) {
        if (!chunk.done) {
          accumulatedContent += chunk.delta;
          finalTokenCount = chunk.tokenCount || 0;
        }
      }

      isComplete = true;

      // Final update to ensure state is consistent
      setState(prev => ({
        ...prev,
        isLoading: false,
        messages: prev.messages.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, content: accumulatedContent, tokenCount: finalTokenCount }
            : msg
        ),
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error occurred',
      }));
    }
  }, [exit]);

  useInput((input, key) => {
    if (key.ctrl && input === 'c') exit();
  });

  if (state.showModelSelector) {
    return (
      <Box
        key={`ms-${renderKey}`}
        flexDirection="column"
        minHeight={terminalSize.height}
        width="100%"
      >
        <ModelSelector
          currentModel={state.currentModel}
          onSelect={handleModelSelect}
          onCancel={handleModelCancel}
        />
      </Box>
    );
  }

  return (
    <Box
      key={`ci-${renderKey}`}
      flexDirection="column"
      minHeight={terminalSize.height}
      width="100%"
    >
      <ChatInterface
        model={state.currentModel}
        messages={state.messages}
        isLoading={state.isLoading}
        error={state.error}
        onSendMessage={handleSendMessage}
        skipLanding={state.hasSeenLanding}
        onLandingComplete={handleLandingComplete}
      />
    </Box>
  );
}

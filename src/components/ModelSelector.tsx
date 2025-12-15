/**
 * Model Selector - Responsive Premium Design
 * 
 * Beautiful model selection interface with detailed information
 * Adapts to terminal size dynamically
 * 
 * @module components/ModelSelector
 * @author Azure Code Team
 * @version 7.0.0
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { MODELS_BY_PROVIDER, PROVIDER_NAMES, MODELS, getAvailableModelsByProvider } from '../lib/models/config.js';
import type { ModelProvider } from '../types/index.js';
import { useTerminalSize, getResponsiveBorderWidth } from '../hooks/useTerminalSize.js';

interface ModelSelectorProps {
  currentModel: string;
  onSelect: (modelId: string) => void;
  onCancel: () => void;
}

const AZURE_BLUE = '#0078D4';
const AZURE_CYAN = '#50E6FF';

export function ModelSelector({ currentModel, onSelect, onCancel }: ModelSelectorProps) {
  const terminalSize = useTerminalSize();
  
  // Only show models with configured API keys
  const availableModelsByProvider = getAvailableModelsByProvider();
  const allModels = Object.entries(availableModelsByProvider).flatMap(([provider, models]) =>
    models.map(modelId => ({ provider: provider as ModelProvider, modelId }))
  );
  
  const currentIndex = allModels.findIndex(m => m.modelId === currentModel);
  const [selectedIndex, setSelectedIndex] = useState(currentIndex >= 0 ? currentIndex : 0);
  
  useInput((input, key) => {
    if (key.upArrow) setSelectedIndex(prev => Math.max(0, prev - 1));
    else if (key.downArrow) setSelectedIndex(prev => Math.min(allModels.length - 1, prev + 1));
    else if (key.return) onSelect(allModels[selectedIndex]!.modelId);
    else if (key.escape) onCancel();
  });
  
  // Get selected model details
  const selectedModel = MODELS[allModels[selectedIndex]!.modelId];
  const borderWidth = Math.min(getResponsiveBorderWidth(terminalSize.width), terminalSize.width - 4);
  const showTwoColumns = terminalSize.width >= 100;
  
  return (
    <Box flexDirection="column" paddingX={2} paddingY={1} height="100%">
      {/* Header - responsive border */}
      <Box marginBottom={1}>
        <Text color={AZURE_BLUE} bold>
          {'╔' + '═'.repeat(Math.max(borderWidth - 2, 10)) + '╗'}
        </Text>
      </Box>
      <Box justifyContent="center" marginBottom={1}>
        <Text color={AZURE_BLUE} bold>
          {'  '}Select AI Model
        </Text>
      </Box>
      <Box marginBottom={2}>
        <Text color={AZURE_BLUE} bold>
          {'╚' + '═'.repeat(Math.max(borderWidth - 2, 10)) + '╝'}
        </Text>
      </Box>
      
      {/* Responsive layout - two columns on large screens, single column on small */}
      <Box flexDirection={showTwoColumns ? 'row' : 'column'}>
        {/* Model list */}
        <Box flexDirection="column" width={showTwoColumns ? '50%' : '100%'} paddingRight={showTwoColumns ? 2 : 0}>
          {Object.entries(availableModelsByProvider).map(([provider, modelIds]) => (
            <Box key={provider} flexDirection="column" marginBottom={1}>
              <Text color={AZURE_CYAN} bold>{PROVIDER_NAMES[provider as ModelProvider]}</Text>
              {modelIds.map((modelId) => {
                const model = MODELS[modelId];
                if (!model) return null;
                
                const globalIndex = allModels.findIndex(m => m.modelId === modelId);
                const isSelected = selectedIndex === globalIndex;
                const isCurrent = modelId === currentModel;
                
                return (
                  <Box key={modelId} paddingLeft={1} paddingY={0}>
                    <Text 
                      color={isSelected ? AZURE_BLUE : undefined} 
                      bold={isSelected}
                      dimColor={!isSelected && !isCurrent}
                    >
                      {isSelected ? '▶ ' : '  '}
                      {model.name}
                      {isCurrent && ' ✓'}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          ))}
          
          {/* Controls hint - responsive */}
          <Box marginTop={1} borderStyle="round" borderColor="gray" paddingX={1}>
            <Text dimColor>
              {terminalSize.isSmall ? '↑↓ Enter Esc' : '↑↓ Navigate • Enter Select • Esc Cancel'}
            </Text>
          </Box>
        </Box>
        
        {/* Model details - show on large screens only */}
        {showTwoColumns && (
          <Box 
            flexDirection="column" 
            width="50%" 
            borderStyle="round" 
            borderColor={AZURE_BLUE}
            paddingX={2}
            paddingY={1}
          >
            <Text color={AZURE_CYAN} bold>{selectedModel?.name}</Text>
            <Text dimColor>{PROVIDER_NAMES[selectedModel?.provider as ModelProvider]}</Text>
            
            <Box marginTop={1} marginBottom={1}>
              <Text>{selectedModel?.description}</Text>
            </Box>
            
            {/* Specs */}
            <Box flexDirection="column" marginTop={1}>
              <Box>
                <Text dimColor>Context: </Text>
                <Text>{(selectedModel?.contextWindow || 0).toLocaleString()} tokens</Text>
              </Box>
              <Box>
                <Text dimColor>Speed: </Text>
                <Text color={
                  selectedModel?.speed === 'fast' ? 'green' : 
                  selectedModel?.speed === 'medium' ? 'yellow' : 
                  'red'
                }>
                  {selectedModel?.speed?.toUpperCase()}
                </Text>
              </Box>
              <Box>
                <Text dimColor>Streaming: </Text>
                <Text color="green">{selectedModel?.supportsStreaming ? 'YES' : 'NO'}</Text>
              </Box>
            </Box>
            
            {/* Capabilities */}
            {selectedModel?.capabilities && selectedModel.capabilities.length > 0 && (
              <Box flexDirection="column" marginTop={1}>
                <Text dimColor>Capabilities:</Text>
                <Box flexWrap="wrap" marginTop={0}>
                  {selectedModel.capabilities.map((cap) => (
                    <Box key={cap} marginRight={1}>
                      <Text color={AZURE_CYAN}>{cap}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

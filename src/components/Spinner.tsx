/**
 * Loading Spinner Component
 * 
 * Beautiful animated spinner for loading states with customizable colors.
 * 
 * @module components/Spinner
 * @author Azure Code Team
 * @version 1.0.0
 */

import React from 'react';
import { Box, Text } from 'ink';
import InkSpinner from 'ink-spinner';

interface SpinnerProps {
  text?: string;
  color?: string;
}

/**
 * Animated loading spinner with optional text
 */
export function Spinner({ text = 'Loading', color = '#0078D4' }: SpinnerProps) {
  return (
    <Box>
      <Text color={color}>
        <InkSpinner type="dots" />
      </Text>
      <Text> </Text>
      <Text color={color}>{text}...</Text>
    </Box>
  );
}

/**
 * Model loading animation
 */
export function ModelLoader({ modelName }: { modelName: string }) {
  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Box>
        <Text color="#0078D4">
          <InkSpinner type="arc" />
        </Text>
        <Text> </Text>
        <Text color="#50E6FF" bold>
          Loading {modelName}
        </Text>
      </Box>
      <Text dimColor>Initializing AI model...</Text>
    </Box>
  );
}

/**
 * Thinking animation for AI response
 */
export function ThinkingAnimation() {
  return (
    <Box>
      <Text color="#0078D4">
        <InkSpinner type="dots12" />
      </Text>
      <Text> </Text>
      <Text color="#0078D4" bold>
        Azure Code is thinking
      </Text>
      <Text color="#0078D4">
        <InkSpinner type="dots12" />
      </Text>
    </Box>
  );
}

/**
 * Processing file animation
 */
export function FileProcessing({ fileName }: { fileName: string }) {
  return (
    <Box>
      <Text color="#50E6FF">
        <InkSpinner type="bounce" />
      </Text>
      <Text> </Text>
      <Text color="#50E6FF">Processing {fileName}</Text>
    </Box>
  );
}

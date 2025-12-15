/**
 * Markdown Renderer Component
 * 
 * Professional markdown rendering.
 * Refactored to use atomic CodeBlock component.
 * 
 * @module components/MarkdownRenderer
 */

import React, { memo } from 'react';
import { Box, Text } from 'ink';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import { THEME } from '../lib/theme.js';
import { CodeBlock } from './CodeBlock.js';

interface MarkdownRendererProps {
  content: string;
  terminalWidth: number;
}

// Colors derived from THEME
const DIMMED_WHITE = THEME.colors.text.dim;
const AZURE_CYAN = THEME.colors.secondary;
const CODE_BG = '#1e1e1e';

/**
 * Centered box for AI-generated bordered content
 */
function CenteredBox({
  lines,
  terminalWidth
}: {
  lines: string[];
  terminalWidth: number;
}) {
  const maxLineWidth = Math.max(...lines.map(l => l.length));
  const padding = Math.max(0, Math.floor((terminalWidth - maxLineWidth) / 2));

  return (
    <Box flexDirection="column" marginY={1}>
      {lines.map((line, idx) => (
        <Box key={idx} marginLeft={padding}>
          <Text color={AZURE_CYAN}>{line}</Text>
        </Box>
      ))}
    </Box>
  );
}

function MarkdownRendererImpl({ content, terminalWidth }: MarkdownRendererProps) {
  const safeContent = content || '';
  const lines = safeContent.split('\n');
  const elements: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeLanguage = '';
  let inBoxBlock = false;
  let boxBlockContent: string[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] || '';

    // Box block detection
    const isBoxTop = line.trim().startsWith('╭') || line.trim().startsWith('╔');
    const isBoxBottom = line.trim().startsWith('╰') || line.trim().startsWith('╚');

    if (isBoxTop && !inCodeBlock) {
      inBoxBlock = true;
      boxBlockContent = [line];
      continue;
    }

    if (inBoxBlock) {
      boxBlockContent.push(line);
      if (isBoxBottom) {
        elements.push(
          <CenteredBox
            key={key++}
            lines={boxBlockContent}
            terminalWidth={terminalWidth}
          />
        );
        boxBlockContent = [];
        inBoxBlock = false;
      }
      continue;
    }

    // Code block detection
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <CodeBlock
            key={key++}
            code={codeBlockContent.join('\n')}
            language={codeLanguage}
            terminalWidth={terminalWidth}
          />
        );
        codeBlockContent = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        codeLanguage = line.slice(3).trim();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      elements.push(
        <Box key={key++} marginTop={1}>
          <Text color={AZURE_CYAN} bold>{line.slice(2)}</Text>
        </Box>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <Box key={key++} marginTop={1}>
          <Text color={AZURE_CYAN} bold>{line.slice(3)}</Text>
        </Box>
      );
      continue;
    }

    // Catch-all for regular text (simplified for brevity of this update)
    if (line.trim() !== '') {
      elements.push(
        <Box key={key++}>
          <Text color={DIMMED_WHITE}>{line}</Text>
        </Box>
      );
    } else {
      elements.push(<Box key={key++} height={1} />);
    }
  }

  // Close open blocks
  if (inCodeBlock && codeBlockContent.length > 0) {
    elements.push(
      <CodeBlock
        key={key++}
        code={codeBlockContent.join('\n')}
        language={codeLanguage}
        terminalWidth={terminalWidth}
      />
    );
  }

  return <Box flexDirection="column">{elements}</Box>;
}

export const MarkdownRenderer = memo(MarkdownRendererImpl);

/**
 * Markdown Renderer Component
 * 
 * Professional markdown rendering with:
 * - ChatGPT-style code blocks with language header
 * - Syntax highlighting using cli-highlight
 * - Properly centered summary/explanation boxes
 * - Clean, readable formatting
 * 
 * @module components/MarkdownRenderer
 * @author Azure Code Team
 * @version 3.0.0
 */

import React, { memo } from 'react';
import { Box, Text } from 'ink';
import { highlight } from 'cli-highlight';
import { useTerminalSize } from '../hooks/useTerminalSize.js';

interface MarkdownRendererProps {
  content: string;
  terminalWidth: number;
}

const DIMMED_WHITE = 'gray';
const AZURE_CYAN = '#50E6FF';
const AZURE_BLUE = '#0078D4';
const CODE_BG = '#1e1e1e';
const CODE_HEADER_BG = '#2d2d2d';

/**
 * Parse and render markdown content
 */
function MarkdownRendererImpl({ content, terminalWidth }: MarkdownRendererProps) {
  // Use aggressive defensive coding
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

    // Detect box/border blocks (╭, ╰, │, ╔, ╚, ║ patterns)
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
        // End of box block - render centered
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
        // End code block
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
        // Start code block
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
          <Text color={AZURE_CYAN} bold>
            {line.slice(2)}
          </Text>
        </Box>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <Box key={key++} marginTop={1}>
          <Text color={AZURE_CYAN} bold>
            {line.slice(3)}
          </Text>
        </Box>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <Box key={key++}>
          <Text color={DIMMED_WHITE} bold>
            {line.slice(4)}
          </Text>
        </Box>
      );
      continue;
    }

    // Lists
    if (line.match(/^[\s]*[-*]\s/)) {
      const indent = line.match(/^(\s*)/)?.[1].length || 0;
      const content = line.replace(/^[\s]*[-*]\s/, '');
      elements.push(
        <Box key={key++} marginLeft={Math.floor(indent / 2)}>
          <Text color={AZURE_CYAN}>• </Text>
          {formatInlineMarkdown(content)}
        </Box>
      );
      continue;
    }

    // Numbered lists
    if (line.match(/^[\s]*\d+\.\s/)) {
      const indent = line.match(/^(\s*)/)?.[1].length || 0;
      const num = line.match(/\d+/)?.[0];
      const content = line.replace(/^[\s]*\d+\.\s/, '');
      elements.push(
        <Box key={key++} marginLeft={Math.floor(indent / 2)}>
          <Text color={AZURE_CYAN}>{num}. </Text>
          {formatInlineMarkdown(content)}
        </Box>
      );
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<Box key={key++} height={1} />);
      continue;
    }

    // Regular paragraphs
    elements.push(
      <Box key={key++}>
        {formatInlineMarkdown(line)}
      </Box>
    );
  }

  // Handle unclosed code block
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

  // Handle unclosed box block
  if (inBoxBlock && boxBlockContent.length > 0) {
    elements.push(
      <CenteredBox
        key={key++}
        lines={boxBlockContent}
        terminalWidth={terminalWidth}
      />
    );
  }

  return <Box flexDirection="column">{elements}</Box>;
}

// Optimized comparison function for memo
const arePropsEqual = (prevProps: MarkdownRendererProps, nextProps: MarkdownRendererProps) => {
  return prevProps.content === nextProps.content && 
         prevProps.terminalWidth === nextProps.terminalWidth;
};

export const MarkdownRenderer = memo(MarkdownRendererImpl, arePropsEqual);

/**
 * Format inline markdown (bold, italic, code)
 * Returns a formatted JSX element with dimmed colors
 */
function formatInlineMarkdown(text: string): JSX.Element {
  // Process inline code first (highest priority)
  const codeRegex = /`([^`]+)`/g;
  let match;
  let lastIndex = 0;
  const segments: Array<{ text: string; type: string }> = [];

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), type: 'text' });
    }
    segments.push({ text: match[1] || '', type: 'code' });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), type: 'text' });
  }

  if (segments.length === 0) {
    segments.push({ text, type: 'text' });
  }

  // Render segments with dimmed colors
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'code') {
          return (
            <Text key={i} backgroundColor={CODE_BG} color={AZURE_CYAN}>
              {` ${seg.text} `}
            </Text>
          );
        }

        // Process bold and italic in text segments
        const boldRegex = /\*\*([^*]+)\*\*/g;
        const parts: JSX.Element[] = [];
        let lastIdx = 0;
        let partKey = 0;

        while ((match = boldRegex.exec(seg.text)) !== null) {
          if (match.index > lastIdx) {
            const plainText = seg.text.slice(lastIdx, match.index);
            parts.push(
              <Text key={`text-${i}-${partKey++}`} color={DIMMED_WHITE}>
                {plainText}
              </Text>
            );
          }
          parts.push(
            <Text key={`bold-${i}-${partKey++}`} bold color="white">
              {match[1]}
            </Text>
          );
          lastIdx = match.index + match[0].length;
        }

        if (lastIdx < seg.text.length) {
          parts.push(
            <Text key={`text-${i}-${partKey++}`} color={DIMMED_WHITE}>
              {seg.text.slice(lastIdx)}
            </Text>
          );
        }

        // If no bold found, just return the dimmed text
        if (parts.length === 0) {
          return (
            <Text key={i} color={DIMMED_WHITE}>
              {seg.text}
            </Text>
          );
        }

        return <React.Fragment key={i}>{parts}</React.Fragment>;
      })}
    </>
  );
}

/**
 * Get display name for programming language
 */
function getLanguageDisplayName(lang: string): string {
  const languageMap: Record<string, string> = {
    'js': 'JavaScript',
    'javascript': 'JavaScript',
    'ts': 'TypeScript',
    'typescript': 'TypeScript',
    'tsx': 'TypeScript React',
    'jsx': 'JavaScript React',
    'py': 'Python',
    'python': 'Python',
    'rb': 'Ruby',
    'ruby': 'Ruby',
    'go': 'Go',
    'golang': 'Go',
    'rs': 'Rust',
    'rust': 'Rust',
    'java': 'Java',
    'cpp': 'C++',
    'c++': 'C++',
    'c': 'C',
    'cs': 'C#',
    'csharp': 'C#',
    'php': 'PHP',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'scala': 'Scala',
    'sh': 'Shell',
    'bash': 'Bash',
    'zsh': 'Zsh',
    'powershell': 'PowerShell',
    'ps1': 'PowerShell',
    'sql': 'SQL',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'SASS',
    'less': 'LESS',
    'json': 'JSON',
    'yaml': 'YAML',
    'yml': 'YAML',
    'xml': 'XML',
    'md': 'Markdown',
    'markdown': 'Markdown',
    'dockerfile': 'Dockerfile',
    'docker': 'Dockerfile',
    'graphql': 'GraphQL',
    'gql': 'GraphQL',
    'vim': 'Vim',
    'lua': 'Lua',
    'perl': 'Perl',
    'r': 'R',
    'matlab': 'MATLAB',
    'plaintext': 'Plain Text',
    'text': 'Plain Text',
    '': 'Code',
  };

  return languageMap[lang.toLowerCase()] || lang.charAt(0).toUpperCase() + lang.slice(1);
}

/**
 * Code block with ChatGPT-style header and syntax highlighting
 */
function CodeBlock({ 
  code, 
  language, 
  terminalWidth 
}: { 
  code: string; 
  language: string;
  terminalWidth: number;
}) {
  let highlighted = code;
  const codeWidth = Math.min(terminalWidth - 8, 100);
  const displayLanguage = getLanguageDisplayName(language);

  try {
    if (code.trim()) {
      highlighted = highlight(code, {
        language: language || 'plaintext',
        ignoreIllegals: true,
      });
    }
  } catch (e) {
    // If highlighting fails, use original code
    highlighted = code;
  }

  // Split highlighted code into lines for proper rendering
  const codeLines = highlighted.split('\n');

  return (
    <Box flexDirection="column" marginY={1}>
      {/* Header bar with language label - ChatGPT style */}
      <Box>
        <Text backgroundColor={CODE_HEADER_BG} color={DIMMED_WHITE}>
          {' ' + displayLanguage + ' '.repeat(Math.max(0, codeWidth - displayLanguage.length - 1))}
        </Text>
      </Box>
      
      {/* Code content with background */}
      <Box flexDirection="column" paddingX={1}>
        {codeLines.map((line, idx) => (
          <Box key={idx}>
            {/* Line number */}
            <Text color="#6e7681" dimColor>
              {String(idx + 1).padStart(3, ' ')} │ 
            </Text>
            {/* Code line */}
            <Text>{line || ' '}</Text>
          </Box>
        ))}
      </Box>
      
      {/* Bottom border */}
      <Box>
        <Text color={AZURE_BLUE} dimColor>
          {'─'.repeat(codeWidth)}
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Centered box for AI-generated bordered content
 * Detects box drawing characters and centers the entire block
 */
function CenteredBox({ 
  lines, 
  terminalWidth 
}: { 
  lines: string[]; 
  terminalWidth: number;
}) {
  // Find the widest line to calculate centering
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

/**
 * Summary/Explanation box - centered with proper borders
 */
export function SummaryBox({ content, terminalWidth }: { content: string; terminalWidth: number }) {
  const boxWidth = Math.min(terminalWidth - 8, 90);
  const padding = Math.floor((terminalWidth - boxWidth - 4) / 2);
  
  // Word wrap content to fit inside the box
  const wrappedLines = wrapText(content, boxWidth - 4);
  
  return (
    <Box flexDirection="column" marginY={1} marginLeft={padding}>
      {/* Top border */}
      <Box>
        <Text color={AZURE_CYAN}>
          {'╭' + '─'.repeat(boxWidth - 2) + '╮'}
        </Text>
      </Box>
      
      {/* Content lines */}
      {wrappedLines.map((line, idx) => (
        <Box key={idx}>
          <Text color={AZURE_CYAN}>│ </Text>
          <Text color={DIMMED_WHITE}>
            {line.padEnd(boxWidth - 4, ' ')}
          </Text>
          <Text color={AZURE_CYAN}> │</Text>
        </Box>
      ))}
      
      {/* Bottom border */}
      <Box>
        <Text color={AZURE_CYAN}>
          {'╰' + '─'.repeat(boxWidth - 2) + '╯'}
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Word wrap text to fit within a given width
 */
function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  
  return lines.length > 0 ? lines : [''];
}

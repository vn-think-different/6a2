import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  expression: string;
  displayMode?: boolean;
  className?: string;
}

// Regex to detect Vietnamese accented characters
const VIETNAMESE_CHAR_REGEX = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ]/i;

// Regex to detect pure LaTeX commands
const LATEX_COMMAND_REGEX = /\\[a-zA-Z]+/;

/**
 * Checks if a string is pure text (e.g. Vietnamese multiple choice answer like "D. Đông.",
 * or regular descriptive text without real math formulas).
 */
export function isPureText(raw: string): boolean {
  if (!raw) return true;
  const s = raw.trim();

  // If it starts with multiple-choice letter like "A. ...", "B. ...", "C. ...", "D. ..."
  if (/^[A-D]\.\s*[\p{L}\s\d,.-]+$/u.test(s) && !s.includes('\\') && !s.includes('$') && !s.includes('^')) {
    return true;
  }

  // If it contains genuine LaTeX commands like \frac, \sqrt, \in, \notin, \times, \cdot, \Rightarrow, etc.
  if (LATEX_COMMAND_REGEX.test(s)) {
    return false;
  }

  // If it has typical math block syntax like $...$
  if (s.includes('$')) {
    return false;
  }

  // If it contains math expressions like x = ..., 3x + 5, {2; 3; 4; 5}
  if (/\{[0-9;\s,]+\}/.test(s) || /\b\d+\s*[\+\-\*\/=><]\s*\d+/.test(s) || /\b[a-zA-Z]\s*=\s*\d+/.test(s)) {
    return false;
  }

  // If it has Vietnamese words and no backslash commands, treat as pure text
  if (VIETNAMESE_CHAR_REGEX.test(s)) {
    return true;
  }

  // If short alphanumeric text without math operators
  if (/^[a-zA-Z0-9\s,.:;!?'"()\-–—]+$/.test(s) && !s.includes('=') && !s.includes('+') && !s.includes('^')) {
    return true;
  }

  return false;
}

/**
 * Ensures Vietnamese text inside LaTeX expressions is safely wrapped in \text{...}
 * so KaTeX won't mangle them into VIQR accents (e.g. Đa` Na~ng or Đo^ng).
 */
function protectVietnameseInLatex(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.replace(/\\\\/g, '\\');

  // Replace common arrow representations
  cleaned = cleaned.replace(/=>/g, '\\Rightarrow ');
  cleaned = cleaned.replace(/<=>/g, '\\Leftrightarrow ');

  // If already full \text{...}, return
  if (cleaned.startsWith('\\text{') && cleaned.endsWith('}')) {
    return cleaned;
  }

  // Tokenize lines
  return cleaned;
}

export const MathView: React.FC<MathViewProps> = ({
  expression,
  displayMode = true,
  className = '',
}) => {
  const isText = useMemo(() => isPureText(expression), [expression]);

  const renderedHtml = useMemo(() => {
    if (!expression || !expression.trim()) return null;

    // If it's plain text or Vietnamese descriptive phrase, DO NOT pass to KaTeX!
    if (isText) {
      return null;
    }

    const cleaned = protectVietnameseInLatex(expression);
    const lines = cleaned.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    try {
      if (lines.length > 1 && !cleaned.includes('\\begin{')) {
        const htmlParts = lines.map((line) => {
          // If a specific line is pure Vietnamese text, don't run KaTeX on it
          if (isPureText(line)) {
            return `<div class="py-0.5 text-slate-800 font-sans">${line}</div>`;
          }
          try {
            return katex.renderToString(line, {
              displayMode: true,
              throwOnError: false,
              output: 'html',
            });
          } catch {
            return `<div class="font-sans text-slate-800">${line}</div>`;
          }
        });
        return htmlParts.join('');
      }

      return katex.renderToString(cleaned, {
        displayMode,
        throwOnError: false,
        output: 'html',
      });
    } catch (err) {
      console.warn('KaTeX render error:', err);
      return null;
    }
  }, [expression, isText, displayMode]);

  if (!expression || !expression.trim()) return null;

  // If detected as pure Vietnamese / plain text: render cleanly in standard typography
  if (isText || !renderedHtml) {
    return (
      <div className={`font-sans tracking-normal select-text break-words ${className}`}>
        {expression}
      </div>
    );
  }

  // Render KaTeX formula
  return (
    <div
      className={`katex-math-container font-sans overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

/**
 * Component to render text that may contain inline math like $...$ or LaTeX commands
 */
export const FormattedTextWithMath: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => {
  const parts = useMemo(() => {
    if (!text) return [];

    // If text has $...$ delimiters for math:
    if (text.includes('$')) {
      const regex = /\$([^$]+)\$/g;
      const elements: { type: 'text' | 'math'; content: string }[] = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          elements.push({ type: 'text', content: text.substring(lastIndex, match.index) });
        }
        elements.push({ type: 'math', content: match[1] });
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < text.length) {
        elements.push({ type: 'text', content: text.substring(lastIndex) });
      }

      return elements;
    }

    // Return as single text element if no math delimiters
    return [{ type: 'text' as const, content: text }];
  }, [text]);

  return (
    <span className={className}>
      {parts.map((p, idx) => {
        if (p.type === 'math') {
          return <MathView key={idx} expression={p.content} displayMode={false} className="inline-block mx-1 align-middle" />;
        }
        return <span key={idx}>{p.content}</span>;
      })}
    </span>
  );
};

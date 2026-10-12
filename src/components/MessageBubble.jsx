import React, { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';

const FormattedContent = ({ content }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (codeText, index) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Simple and safe markdown parser for code blocks, inline code, bold, lists
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-sm">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          let language = 'text';
          let codeText = part.slice(3, -3).trim();

          if (lines[0] && !lines[0].includes(' ') && lines.length > 1) {
            language = lines[0];
            codeText = lines.slice(1).join('\n');
          }

          const isCopied = copiedCode === index;

          return (
            <div
              key={index}
              className="relative my-2 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950 font-mono text-xs shadow-md"
            >
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-slate-400">
                <span className="font-semibold text-[11px] uppercase text-indigo-400">
                  {language}
                </span>
                <button
                  onClick={() => handleCopy(codeText, index)}
                  className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] hover:bg-slate-800 hover:text-white transition"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-3.5 text-slate-200">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }

        // Parse regular paragraphs with inline code, bold, bullet points
        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-1.5 whitespace-pre-wrap">
            {lines.map((line, lIdx) => {
              // Bullet item
              if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-indigo-400">•</span>
                    <span>{renderInline(line.trim().slice(2))}</span>
                  </div>
                );
              }
              // Normal text
              return line.length > 0 ? (
                <p key={lIdx}>{renderInline(line)}</p>
              ) : (
                <div key={lIdx} className="h-1.5" />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Helper for inline bold, italic, code
const renderInline = (text) => {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return tokens.map((tok, i) => {
    if (tok.startsWith('`') && tok.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[13px] text-indigo-300 border border-slate-700/50"
        >
          {tok.slice(1, -1)}
        </code>
      );
    }
    if (tok.startsWith('**') && tok.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-white">
          {tok.slice(2, -2)}
        </strong>
      );
    }
    return tok;
  });
};

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const [copiedMessage, setCopiedMessage] = useState(false);

  const copyFullMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div
      className={`group flex items-start gap-3.5 max-w-3xl ${
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-indigo-600/20'
            : 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-indigo-500/20'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bubble Content */}
      <div className="relative flex flex-col min-w-0">
        <div
          className={`relative rounded-2xl px-4 py-3 shadow-md ${
            isUser
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-600/20'
              : 'border border-slate-800 bg-slate-900/90 text-slate-100 shadow-slate-950/40 backdrop-blur-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          ) : (
            <FormattedContent content={message.content} />
          )}

          {/* Copy Message Button (shows on hover) */}
          <button
            onClick={copyFullMessage}
            title="Copy message"
            className={`absolute bottom-2 right-2 rounded-md p-1 transition opacity-0 group-hover:opacity-100 ${
              isUser
                ? 'bg-indigo-700/80 text-white hover:bg-indigo-800'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {copiedMessage ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>

        {/* Timestamp */}
        {formattedTime && (
          <span
            className={`mt-1 text-[11px] text-slate-500 ${
              isUser ? 'text-right pr-1' : 'text-left pl-1'
            }`}
          >
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

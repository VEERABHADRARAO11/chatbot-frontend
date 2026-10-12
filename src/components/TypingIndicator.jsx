import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-3.5 max-w-2xl">
      {/* Bot Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20">
        <Bot className="h-4 w-4 text-white" />
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 shadow-sm">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          Gemini is thinking
        </span>
        <div className="flex items-center gap-1 pl-1">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-dot-1" />
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-dot-2" />
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-dot-3" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

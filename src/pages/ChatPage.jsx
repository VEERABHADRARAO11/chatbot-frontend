import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import {
  Send,
  Menu,
  Sparkles,
  Bot,
  Plus,
  AlertCircle,
  Loader2,
  RefreshCw,
  Code2,
  Lightbulb,
  Compass,
  FileText
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  {
    icon: Lightbulb,
    title: 'Explain Concepts',
    prompt: 'Explain what JWT authentication is and how tokens are verified on the backend.'
  },
  {
    icon: Code2,
    title: 'Write Code',
    prompt: 'Write an Express middleware to handle and log incoming request response times.'
  },
  {
    icon: Compass,
    title: 'Architecture Design',
    prompt: 'How should I structure a production MERN stack application for high scalability?'
  },
  {
    icon: FileText,
    title: 'Code Review',
    prompt: 'What are the top 5 security best practices for Node.js REST APIs?'
  }
];

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Load all user conversations on initial load
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await api.get('/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  // Load messages whenever active conversation changes
  const handleSelectConversation = async (conversationId) => {
    if (conversationId === activeConversationId) return;

    setActiveConversationId(conversationId);
    setError(null);
    setIsLoadingMessages(true);

    try {
      const res = await api.get(`/conversations/${conversationId}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      setError('Failed to load messages for this conversation.');
      console.error(err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Start a fresh chat
  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Delete a conversation
  const handleDeleteConversation = async (conversationId) => {
    try {
      await api.delete(`/conversations/${conversationId}`);
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));

      if (activeConversationId === conversationId) {
        handleNewChat();
      }
    } catch (err) {
      setError('Failed to delete conversation.');
      console.error(err);
    }
  };

  // Send message to Gemini backend
  const handleSendMessage = async (textToSend = inputMessage) => {
    const message = textToSend.trim();
    if (!message || isGenerating) return;

    setError(null);
    setInputMessage('');

    // Optimistically show user message in UI
    const optimisticUserMsg = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setIsGenerating(true);

    try {
      const res = await api.post('/chat', {
        conversationId: activeConversationId,
        message
      });

      if (res.data.success) {
        const { conversation, userMessage, botMessage } = res.data;

        // Replace optimistic message with saved userMessage & add botMessage
        setMessages((prev) => [
          ...prev.filter((m) => m._id !== optimisticUserMsg._id),
          userMessage,
          botMessage
        ]);

        // If this was a new conversation, set activeConversationId and add to list
        if (!activeConversationId) {
          setActiveConversationId(conversation._id);
          setConversations((prev) => [conversation, ...prev]);
        } else {
          // Update conversation in sidebar list (title or position)
          setConversations((prev) => [
            conversation,
            ...prev.filter((c) => c._id !== conversation._id)
          ]);
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Error getting AI response. Please check server and API key.';
      setError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle keyboard shortcut (Enter to submit, Shift+Enter for newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeConversation = conversations.find((c) => c._id === activeConversationId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col overflow-hidden bg-slate-950">
        {/* Top Navbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">
                {activeConversation ? activeConversation.title : 'New Chat'}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[11px] font-medium text-indigo-400">
                <Sparkles className="h-3 w-3" />
                Gemini 1.5 Flash
              </span>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </header>

        {/* Error Alert Banner */}
        {error && (
          <div className="flex items-center justify-between bg-red-500/15 border-b border-red-500/20 px-4 py-2 text-xs text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-white font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {isLoadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                <p className="text-xs">Loading conversation history...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            /* Empty State */
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-xl shadow-indigo-500/25">
                <Bot className="h-9 w-9 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                How can I help you today?
              </h2>
              <p className="mt-1.5 max-w-md text-sm text-slate-400">
                Powered by Google Gemini AI with multi-turn conversational context and full memory saved in MongoDB.
              </p>

              {/* Suggested Prompts Grid */}
              <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTED_PROMPTS.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="group flex flex-col items-start rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left transition hover:border-indigo-500/40 hover:bg-slate-800/80"
                    >
                      <div className="mb-2 flex items-center gap-2 text-indigo-400 group-hover:text-indigo-300">
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-semibold">{item.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 group-hover:text-slate-200 line-clamp-2">
                        {item.prompt}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Message List */
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message._id || Math.random()} message={message} />
              ))}

              {isGenerating && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur-md">
          <div className="mx-auto max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center rounded-2xl border border-slate-700/70 bg-slate-800/80 shadow-lg shadow-black/20 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Gemini anything... (Press Enter to send, Shift+Enter for newline)"
                disabled={isGenerating}
                className="max-h-36 min-h-[48px] w-full resize-none bg-transparent py-3.5 pl-4 pr-14 text-sm text-white placeholder-slate-400 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isGenerating}
                className="absolute right-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>

            <p className="mt-2 text-center text-[11px] text-slate-500">
              Gemini may display inaccurate info, including about people. Check important facts.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default ChatPage;

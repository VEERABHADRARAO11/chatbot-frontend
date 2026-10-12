import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Plus,
  Trash2,
  LogOut,
  Bot,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isOpen,
  onClose
}) => {
  const { user, logout } = useAuth();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation and its messages?')) {
      setDeletingId(id);
      try {
        await onDeleteConversation(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* App Title & New Chat */}
        <div className="flex flex-col gap-3 p-4 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Gemini Chat</h2>
                <div className="flex items-center gap-1 text-[11px] text-indigo-400">
                  <Sparkles className="h-3 w-3" />
                  <span>AI Assistant</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={() => {
              onNewChat();
              if (onClose) onClose();
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-3.5 py-2.5 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-600/30 hover:border-indigo-500/50 hover:text-white"
          >
            <Plus className="h-4 w-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Recent Chats
          </div>

          {conversations.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-slate-500">
              No conversations yet. Start a new chat to begin!
            </div>
          ) : (
            conversations.map((convo) => {
              const isActive = convo._id === activeConversationId;
              const isDeleting = convo._id === deletingId;

              return (
                <div
                  key={convo._id}
                  onClick={() => {
                    onSelectConversation(convo._id);
                    if (onClose) onClose();
                  }}
                  className={`group relative flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-indigo-400' : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{convo.title}</span>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, convo._id)}
                    disabled={isDeleting}
                    title="Delete conversation"
                    className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-slate-500 transition hover:bg-slate-700 hover:text-red-400 focus:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* User Info & Logout Footer */}
        <div className="border-t border-slate-800 bg-slate-900/90 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-bold text-white uppercase shadow-sm">
                {user?.name ? user.name.slice(0, 2) : 'U'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
                <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

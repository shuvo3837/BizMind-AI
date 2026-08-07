import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from './ChatMessage.jsx';
import { PromptSuggestions } from './PromptSuggestions.jsx';
import { useAI } from '../../hooks/useAI.js';

export const ChatWindow = () => {
  const { sendMessage, loading } = useAI();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello Alex! I am your BizMind AI Business Consultant. I have analyzed your Q2 financial reports and sales metrics. How can I assist your strategy today?'
    }
  ]);

  const handleSend = async (textToSend) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || loading) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text: promptText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const res = await sendMessage(promptText);
      const aiReply = res?.reply || res?.message || 'Analyzed data. Your gross margin is steady at 66%. Consider scaling marketing in high-LTV regions.';
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: aiReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'ai', text: 'I encountered an issue connecting to the Gemini engine. Please verify your GEMINI_API_KEY in secrets.' }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[620px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              BizMind AI Advisor <Sparkles size={14} className="text-amber-500 fill-amber-500" />
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Powered by Google Gemini API</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} sender={msg.sender} text={msg.text} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold p-3 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl w-max">
            <Bot size={16} className="animate-bounce" /> Analyzing metrics with Gemini AI...
          </div>
        )}
      </div>

      {/* Prompt Suggestions */}
      <PromptSuggestions onSelect={handleSend} />

      {/* Input */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about sales growth, expense cuts, inventory forecast..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Settings, 
  Moon, 
  Sun, 
  BookOpen, 
  Heart, 
  MessageSquare, 
  Info,
  ChevronDown,
  Sparkles,
  Calendar,
  User,
  RefreshCw
} from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getGeminiResponse, type ChatMessage, type Madhab } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'আসসালামু আলাইকুম! আমি নূরবাণী — ইসলামিক জ্ঞানভিত্তিক একটি সহকারী। আমি আপনাকে কুরআন, সুন্নাহ, ফিকহ এবং দৈনন্দিন আমল বিষয়ে সহায়তা করতে পারি। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [madhab, setMadhab] = useState<Madhab>('Neutral');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getGeminiResponse([...messages, userMessage], madhab);
      setMessages(prev => [...prev, { role: 'model', text: responseText || 'দুঃখিত, আমি উত্তর দিতে পারছি না।' }]);
    } catch (error) {
      console.error('Error fetching Gemini response:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'দুঃখিত, একটি কারিগরি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'দৈনিক আমল', prompt: 'আজকের জন্য কিছু ছোট আমল, দোয়া ও হাদিস দিন।' },
    { label: 'দোয়া শিখুন', prompt: 'বিপদ থেকে মুক্তির জন্য একটি দোয়া দিন।' },
    { label: 'ইসলামিক কুইজ', prompt: 'ইসলামিক সাধারণ জ্ঞানের ওপর একটি কুইজ শুরু করুন।' },
    { label: 'খুতবা আউটলাইন', prompt: 'জুমার খুতবার জন্য একটি বিষয়ের ওপর আউটলাইন দিন।' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-islamic-cream font-sans text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-islamic-green/10 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-islamic-green rounded-full flex items-center justify-center shadow-lg shadow-islamic-green/20">
            <Moon className="text-white w-6 h-6" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-islamic-green leading-tight">নূরবাণী</h1>
            <p className="text-[10px] uppercase tracking-wider text-islamic-gold font-semibold">Islamic AI Assistant</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 hover:bg-islamic-green/5 rounded-full transition-colors relative"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Settings Modal (Inline) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-islamic-green/10 overflow-hidden"
          >
            <div className="p-4 max-w-2xl mx-auto">
              <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> মাযহাব নির্বাচন করুন
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(['Hanafi', 'Shafi', 'Maliki', 'Hanbali', 'Neutral'] as Madhab[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMadhab(m);
                      setIsSettingsOpen(false);
                    }}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                      madhab === m 
                        ? "bg-islamic-green text-white border-islamic-green shadow-md" 
                        : "bg-white text-gray-600 border-gray-200 hover:border-islamic-green/30"
                    )}
                  >
                    {m === 'Neutral' ? 'নিরপেক্ষ' : m}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-3 italic">
                * আপনার নির্বাচিত মাযহাব অনুযায়ী ফিকহ সংক্রান্ত উত্তরগুলো পরিবর্তিত হতে পারে।
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 max-w-3xl mx-auto w-full scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex w-full",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] rounded-2xl p-4 shadow-sm",
              msg.role === 'user' 
                ? "bg-islamic-green text-white rounded-tr-none" 
                : "bg-white text-gray-800 rounded-tl-none border border-islamic-green/5"
            )}>
              <div className="markdown-body text-sm leading-relaxed">
                <Markdown>{msg.text}</Markdown>
              </div>
              <div className={cn(
                "text-[10px] mt-2 opacity-50 flex items-center gap-1",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}>
                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                {msg.role === 'user' ? 'আপনি' : 'নূরবাণী'}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-islamic-green/5 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-islamic-green animate-spin" />
              <span className="text-xs text-gray-500 font-medium">নূরবাণী চিন্তা করছে...</span>
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(action.prompt);
                  // Optional: auto-send
                }}
                className="p-4 bg-white border border-islamic-green/10 rounded-xl text-left hover:border-islamic-green/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-islamic-green">{action.label}</span>
                  <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-islamic-gold transition-colors rotate-[-90deg]" />
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">{action.prompt}</p>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Footer / Input */}
      <footer className="p-4 bg-white border-t border-islamic-green/10">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="আপনার প্রশ্ন এখানে লিখুন..."
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-islamic-green/20 focus:border-islamic-green transition-all resize-none max-h-32"
                style={{ height: 'auto' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "absolute right-2 bottom-2 p-2 rounded-xl transition-all",
                  input.trim() && !isLoading 
                    ? "bg-islamic-green text-white shadow-lg shadow-islamic-green/20 hover:scale-105" 
                    : "bg-gray-100 text-gray-400"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-gray-400 font-medium">
            <span className="flex items-center gap-1"><Info className="w-3 h-3" /> মাযহাব: {madhab === 'Neutral' ? 'নিরপেক্ষ' : madhab}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col items-center gap-1 text-[9px] text-gray-400 text-center">
            <p>Developed & Designed by <span className="font-semibold text-islamic-gold">Nahid</span></p>
            <p>AI Engine Powered by <span className="font-semibold">Google Gemini API</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}

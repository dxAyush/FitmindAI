import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { callAI, escapeHTML } from '@/lib/api';
import SectionHeader from './SectionHeader';
import { motion } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';

const suggestions = [
  'How do I lose belly fat?',
  'Best protein sources?',
  'How much water daily?',
  'Beginner workout tips',
  'Improve sleep for recovery',
];

function ChatMessage({ role, text }) {
  return (
    <div className={`flex gap-3 ${role === 'user' ? 'flex-row-reverse' : ''}`} style={{ animation: 'msg-in 0.35s ease' }}>
      <div className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-base flex-shrink-0 self-end ${role === 'user' ? 'bg-gradient-to-br from-forest-bright to-sage' : 'bg-forest-light'}`}>
        {role === 'bot' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
      </div>
      <div
        className={`max-w-[72%] px-4.5 py-3.5 text-sm leading-relaxed ${role === 'user'
          ? 'bg-gradient-to-br from-forest-light to-forest-bright text-white rounded-2xl rounded-br-[4px]'
          : 'bg-white/[0.06] border border-white/[0.08] text-cream/80 rounded-2xl rounded-bl-[4px]'
        }`}
        dangerouslySetInnerHTML={{ __html: escapeHTML(text) }}
      />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end" style={{ animation: 'msg-in 0.35s ease' }}>
      <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-base flex-shrink-0 bg-forest-light">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="flex gap-1 px-4.5 py-3.5 bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-[4px]">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-[7px] h-[7px] rounded-full bg-sage"
            style={{ animation: `typing-bounce 1.4s infinite ${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatSection() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('fitmind_chat_messages');
    return saved ? JSON.parse(saved) : [
      { id: 'init', role: 'bot', text: "Hey there! I'm your FitMind AI coach. I can help with workout advice, nutrition tips, goal setting, recovery strategies, and so much more. What's on your mind today?" },
    ];
  });
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef(null);
  const chatHistoryRef = useRef(
    JSON.parse(localStorage.getItem('fitmind_chat_history')) || [
      { role: 'model', parts: [{ text: "Hello! I'm your FitMind AI coach." }] },
    ]
  );

  // Persistence
  useEffect(() => {
    localStorage.setItem('fitmind_chat_messages', JSON.stringify(messages));
    localStorage.setItem('fitmind_chat_history', JSON.stringify(chatHistoryRef.current));
  }, [messages]);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    setMessages(prev => [...prev, { id: `${Date.now()}-user`, role: 'user', text: msg }]);
    setTyping(true);

    try {
      const systemPrompt = `You are FitMind AI, a friendly and supportive fitness coach. Talk in very simple English, like you are helping a friend. Avoid technical jargon or complex fitness terms. Be encouraging and keep answers short and easy to read. Keep responses under 120 words. No markdown formatting.`;
      const history = chatHistoryRef.current.slice(-8).map(m =>
        `${m.role === 'user' ? 'User' : 'Coach'}: ${m.parts[0].text}`
      ).join('\n');
      const fullPrompt = `${systemPrompt}\n\nConversation:\n${history}\nUser: ${msg}\nCoach:`;

      const response = await callAI(fullPrompt);
      setTyping(false);
      setMessages(prev => [...prev, { id: `${Date.now()}-bot`, role: 'bot', text: response }]);
      chatHistoryRef.current.push({ role: 'user', parts: [{ text: msg }] });
      chatHistoryRef.current.push({ role: 'model', parts: [{ text: response }] });
    } catch (err) {
      setTyping(false);
      setMessages(prev => [...prev, { id: `${Date.now()}-err`, role: 'bot', text: `AI Coach currently offline: ${err.message}` }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <section id="chat" className="py-30 relative z-10" style={{ background: 'rgba(13,31,15,0.4)' }}>
      <div className="max-w-[1200px] mx-auto px-10 max-md:px-6">
        <SectionHeader eyebrow="AI Coach" title="Your Fitness Assistant" subtitle="Ask anything about fitness, nutrition, recovery, or motivation. Powered by Groq AI." />

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-[780px] mx-auto">
          <div className="glass-card rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-white/[0.08] bg-gradient-to-br from-forest-light to-forest-mid">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sage to-gold flex items-center justify-center text-xl">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-[var(--font-display)] text-base font-semibold text-cream">FitMind Coach</h3>
                  <p className="text-xs text-sage-light">Your AI-powered fitness expert</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-cream/50">
                <span className="w-[7px] h-[7px] rounded-full bg-green-500" style={{ animation: 'pulse-dot 2s infinite' }} />
                Always online
              </div>
            </div>

            {/* Messages */}
            <div ref={messagesRef} className="h-[420px] overflow-y-auto p-7 flex flex-col gap-4" style={{ background: 'rgba(0,0,0,0.2)' }}>
              {messages.map((msg) => <ChatMessage key={msg.id} role={msg.role} text={msg.text} />)}
              {typing && <TypingIndicator />}
            </div>

            {/* Suggestions */}
            <div className="px-7 py-4 flex flex-wrap gap-2 border-t border-white/5" style={{ background: 'rgba(0,0,0,0.15)' }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3.5 py-1.5 rounded-full text-xs text-sage-light border border-sage/20 bg-sage/[0.08] cursor-pointer transition-all duration-400 hover:bg-sage/18 hover:border-sage/40 hover:-translate-y-0.5 whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-7 py-5 flex gap-3 items-end border-t border-white/5" style={{ background: 'rgba(0,0,0,0.1)' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your fitness coach anything..."
                rows={1}
                className="flex-1 min-h-12 max-h-30 px-4.5 py-3 bg-white/[0.06] border border-white/12 rounded-[14px] text-cream text-sm outline-none resize-none transition-all duration-400 focus:border-sage/40 focus:bg-sage/5 font-sans"
                style={{ overflow: 'auto' }}
              />
              <button
                onClick={() => sendMessage()}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-forest-light to-sage border-0 text-white flex items-center justify-center cursor-pointer transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--glow-green)] flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, BookOpen, User } from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; href: string }[];
}

const suggestions = [
  'How do I report an interruption?',
  'What is the procedure for sealing the month?',
  'Explain the formula engine syntax',
  'Show recent inspection guidance for 330kV bays',
];

const initial: Message[] = [
  {
    id: 'm1',
    role: 'assistant',
    content: 'Hi! I\'m the NISO knowledge assistant. Ask me about procedures, equipment manuals, formulas, SLA targets, or anything in the knowledge base.',
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initial);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setBusy(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: `Here's a summary based on the knowledge base:\n\nThis is a placeholder response demonstrating the chat layout. Once wired to the AI backend, the assistant will answer "${text}" with grounded references.`,
          sources: [
            { title: 'Operations Manual · Section 4.2', href: '/knowledge/articles' },
            { title: 'SLA Procedure · v3', href: '/knowledge/procedures' },
          ],
        },
      ]);
      setBusy(false);
    }, 600);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="AI Knowledge Assistant"
          description="Ask questions grounded in NISO procedures, manuals, and operational knowledge"
        />

        <Card className="p-0 overflow-hidden flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === 'assistant' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {m.role === 'assistant' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`max-w-[75%] ${m.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block text-sm leading-relaxed rounded-2xl px-4 py-2.5 whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.sources.map((s, i) => (
                        <a
                          key={i}
                          href={s.href}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50"
                        >
                          <BookOpen className="w-3 h-3" />
                          {s.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-500">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-6 pb-3">
              <p className="text-xs text-gray-500 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="px-4 py-3 border-t border-gray-100 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the NISO assistant…"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <Button type="submit" size="md" disabled={!input.trim() || busy}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}

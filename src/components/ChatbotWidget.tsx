"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } =
    useChat({
      api: "/api/chat",
      body: { sessionId },
      onResponse: (response: Response) => {
        const sid = response.headers.get("x-chat-session-id");
        if (sid) setSessionId(sid);
      },
    });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const quickPrompts = [
    "What courses are offered in Semester 1?",
    "Who are the department faculty members?",
    "What co-curricular wings are active?",
    "What upcoming events are scheduled?",
  ];

  const handlePromptClick = (promptText: string) => {
    const fakeEvent = {
      preventDefault: () => {},
    } as unknown as React.FormEvent<HTMLFormElement>;

    handleInputChange({
      target: { value: promptText },
    } as React.ChangeEvent<HTMLInputElement>);

    setTimeout(() => {
      handleSubmit(fakeEvent);
    }, 50);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* CHAT CONTAINER WINDOW */}
      {isOpen && (
        <div className="pointer-events-auto mb-4 w-[90vw] sm:w-[380px] h-[520px] bg-white border border-[#EFEAE3] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* HEADER */}
          <div className="bg-[#1C1917] text-white p-4 flex items-center justify-between border-b border-[#231F1C]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FDB27C] text-[#1C1917] flex items-center justify-center font-bold shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading flex items-center gap-1.5">
                  SB AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[11px] text-[#756860] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#FDB27C]" /> Grounded in Department Data
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Assistant"
              className="p-1.5 rounded-xl hover:bg-white/10 text-[#756860] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-[#FBF9F7]">
            {/* WELCOME BANNER */}
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border border-[#EFEAE3] shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
                    <Sparkles className="w-4 h-4 text-[#FDB27C]" />
                    Welcome to Dept of AI & Data Science
                  </div>
                  <p className="text-xs text-[#756860] leading-relaxed">
                    Ask me about our curriculum, subject codes, faculty directory, co-curricular wings, or published events.
                  </p>
                </div>

                {/* QUICK PROMPT SUGGESTIONS */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#756860] uppercase tracking-wider block px-1">
                    Suggested Questions:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePromptClick(prompt)}
                        className="text-left px-3.5 py-2 rounded-xl bg-white border border-[#EFEAE3] hover:border-[#1C1917] text-xs text-[#1C1917] font-medium transition-all hover:shadow-xs hover:-translate-y-0.5"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CHAT MESSAGES */}
            {messages.map((m: { id: string; role: string; content: string }) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role !== "user" && (
                  <div className="w-7 h-7 rounded-lg bg-[#1C1917] text-[#FDB27C] flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                    m.role === "user"
                      ? "bg-[#1C1917] text-white rounded-br-none shadow-xs"
                      : "bg-white text-[#1C1917] border border-[#EFEAE3] rounded-bl-none shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {/* LOADING STATE */}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#756860] p-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#1C1917]" />
                Searching official department records...
              </div>
            )}

            {/* ERROR STATE */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                <p>Unable to process request. {error.message}</p>
                <button
                  onClick={() => reload()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 underline"
                >
                  <RefreshCw className="w-3 h-3" /> Retry Prompt
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-[#EFEAE3] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about courses, faculty, events..."
              disabled={isLoading}
              aria-label="Type your message to AI Assistant"
              className="flex-grow px-3.5 py-2.5 rounded-xl bg-[#FBF9F7] border border-[#EFEAE3] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send Message"
              className="p-2.5 rounded-xl bg-[#1C1917] text-[#FDB27C] hover:bg-[#231F1C] transition-all disabled:opacity-40 disabled:hover:bg-[#1C1917] shrink-0"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Department AI Assistant"
        className="pointer-events-auto p-4 rounded-2xl bg-[#1C1917] text-white shadow-xl hover:bg-[#231F1C] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-[#231F1C] group"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-[#FDB27C] group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#1C1917]"></span>
        </div>
        <span className="text-xs font-bold font-heading hidden sm:inline text-white">
          AI Assistant
        </span>
      </button>
    </div>
  );
}

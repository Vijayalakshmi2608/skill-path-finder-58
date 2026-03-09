import { useState, useRef, useEffect } from "react";
import { Zap, Send, Loader2, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { streamChat, type ChatMessage } from "@/lib/ai";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const quickPrompts = [
  "What skills does Google look for?",
  "How do I prepare for system design?",
  "Review my skill gaps",
  "What should I learn first?",
  "Am I ready to apply?",
];

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMsgs = [...messages, userMsg];

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: allMsgs,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
        onError: (err) => {
          setIsLoading(false);
          toast.error(err.message);
        },
      });
    } catch (e: any) {
      console.error(e);
      setIsLoading(false);
      if (!assistantSoFar) {
        toast.error(e.message || "Chat failed");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-surface-secondary shrink-0">
        <div className="section-container flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2 text-lg font-heading font-bold">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-foreground">Skill</span>
            <span className="text-primary">Scan</span>
            <span className="text-muted-foreground font-normal text-sm ml-2">AI Career Advisor</span>
          </a>
          <div className="flex gap-3">
            <button onClick={() => navigate("/results")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Results
            </button>
            <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-2">SkillScan AI</h2>
                <p className="text-muted-foreground">Your personal career advisor. Ask me anything about tech careers, skills, and interview prep.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="px-4 py-2 text-sm rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center mr-3 mt-1 shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "card-surface"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:text-foreground [&_li]:text-foreground [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_code]:text-primary [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center mr-3 shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="card-surface rounded-2xl px-5 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-surface-secondary shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {messages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {quickPrompts.slice(0, 3).map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-40"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex gap-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about careers, skills, interview prep..."
              disabled={isLoading}
              className="flex-1 px-5 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

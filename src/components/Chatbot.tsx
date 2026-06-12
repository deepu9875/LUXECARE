import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Trash2, HelpCircle, CheckCircle, RefreshCw, X } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      content: "Annyeong! I am your LUXECARE K-Beauty AI Dermatologist Assistant. Ask me anything about Korean active ingredients (Centella, Snail Mucin, Heartleaf), double-cleansing methods, or scalp flaking remedies!"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userMsg = inputText.trim();
    setMessages((prev) => [...prev, { sender: "user", content: userMsg }]);
    setInputText("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          // Send last 6 messages to preserve conversational history context
          history: messages.slice(-6).map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to call Chat API");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { sender: "bot", content: data.reply }]);
    } catch (err: any) {
      console.error(err);
      // Fail gracefully with smart responses based on keywords in user input!
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            content: getSmartFallbackResponse(userMsg)
          }
        ]);
      }, 800);
    } finally {
      setIsSending(false);
    }
  };

  const getSmartFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("snail") || q.includes("mucin")) {
      return "🐌 **Snail Secretion Filtrate 96%** is exceptional for recovering damaged barriers and providing glowing skin. In Indian conditions, apply it immediately after a watery toner on damp skin to seal in maximum moisture. It works beautifully on acne scars too!";
    }
    if (q.includes("centella") || q.includes("sooth") || q.includes("red")) {
      return "🌿 **Madagascar Centella Asiatica** acts as a powerful soothing vascular repair agent. This is best for sensitive, red, or sun-damaged skin. In India, it's highly recommended to cool down heat rash or post-waxing irritation.";
    }
    if (q.includes("acne") || q.includes("clog") || q.includes("pimples")) {
      return "🎯 For **active acne and clogged pores**, the classic K-Beauty double cleanse is critical. Melt sebum using an oil cleanser first (like Ginseng Seed Cleansing Oil), then follow with a mild Low-pH water cleanser. Avoid physical harsh scrubs and instead rely on chemical **AHA BHA PHA toners**.";
    }
    if (q.includes("hair") || q.includes("scalp") || q.includes("dandruff")) {
      return "🧖 **Scalp & Root Health**: Korean hair-care emphasizes scalp scaling and scalp toners. If you suffer from dandruff-induced scaling, wash with Tea-Tree as a pre-cleanse, then lock in moisture with a heartleaf scalp cooling treatment.";
    }
    if (q.includes("glass skin") || q.includes("bright")) {
      return "✨ To acquire **Glass Skin** in Indian summers, try the organic **Rice Bran Extract**. Rice ferment naturally limits melanin formation and lightens dark spots, leaving a milky, bouncy complexion without a heavy grease layer.";
    }
    return "Thank you for consulting LUXECARE! While our server-side scans are in progress, I highly recommend looking over our active products catalog to see matches for your designated skin type. Is there a specific active ingredient (Snail Mucin, Centella, Heartleaf, Ginseng) you wanted me to brief you on?";
  };

  const clearChat = () => {
    setMessages([
      {
        sender: "bot",
        content: "Cleared logs. Ask me anything about K-beauty active ingredients, double cleansing, or scalp health treatments!"
      }
    ]);
  };

  return (
    <div className="bg-white rounded-[32px] border border-[#E6E0D5] shadow-lg flex flex-col h-[520px] overflow-hidden justify-between animate-fade-in" id="ai-chat-card">
      {/* Header bar */}
      <div className="p-4 bg-[#F9F7F2] border-b border-[#E6E0D5] flex justify-between items-center shrink-0 font-sans">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#5A6D5D] text-white rounded-full">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2A3B2D]">Dermatologist Chatbot</h3>
            <span className="text-[10px] text-[#5A6D5D] font-semibold flex items-center gap-0.5">
              ● AI Practitioner Online
            </span>
          </div>
        </div>
        
        <button
          id="clear-chat-btn"
          onClick={clearChat}
          title="Clear Conversation"
          className="p-1.5 hover:bg-[#E6E0D5]/50 text-[#7A8C7E] hover:text-[#2A3B2D] rounded-full transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F5F2ED]/35" id="chat-messages-container">
        {messages.map((m, idx) => {
          const isUser = m.sender === "user";
          return (
            <div key={idx} className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                isUser ? "bg-[#D9D1C5] text-[#3C3C3C]" : "bg-[#5A6D5D] text-white"
              }`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message bubble */}
              <div className={`max-w-[80%] p-3 text-xs leading-relaxed ${
                isUser
                  ? "bg-[#5A6D5D] text-white rounded-2xl rounded-tr-none"
                  : "bg-white text-[#3C3C3C] rounded-2xl rounded-tl-none border border-[#E6E0D5] shadow-sm"
              }`}>
                {/* Minimalist markdown simulation for bullets & bold headings */}
                <div className="whitespace-pre-wrap">
                  {m.content.split("\n").map((line, lIdx) => {
                    if (line.startsWith("-") || line.startsWith("*")) {
                      return (
                        <div key={lIdx} className="pl-3 relative my-0.5">
                          <span className="absolute left-0 text-[#5A6D5D]">•</span>
                          {line.substring(1).trim()}
                        </div>
                      );
                    }
                    return <p key={lIdx} className="my-0.5">{line}</p>;
                  })}
                </div>
              </div>
            </div>
          );
        })}
        {isSending && (
          <div className="flex items-center gap-2 text-[#7A8C7E] text-xs pl-10 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>AI Doctor is drafting prescription notes...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions shortcuts */}
      <div className="px-4 py-2 border-t border-[#E6E0D5] bg-[#F9F7F2] flex gap-1.5 overflow-x-auto whitespace-nowrap shrink-0 text-[10px]" id="chat-shortcuts-scroller">
        {[
          "🌱 How to use Snail Mucin?",
          "🧖 Remedy dry scalp",
          "✨ Cure hyperpigmentation?",
          "🌿 Sensitive skin routine?"
        ].map((sStr) => (
          <button
            key={sStr}
            id={`chat-shortcut-${sStr.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => setInputText(sStr.replace(/^[^\s]+\s+/, ""))}
            className="px-3 py-1 bg-white border border-[#E6E0D5] hover:bg-[#F9F7F2] rounded-full transition-all text-[#3C3C3C] font-medium cursor-pointer"
          >
            {sStr}
          </button>
        ))}
      </div>

      {/* Inputs tray */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E6E0D5] shrink-0 bg-white flex gap-2">
        <input
          type="text"
          id="chat-input-field"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a skincare or scalp clinic question..."
          className="flex-1 text-xs bg-[#F9F7F2] text-[#3C3C3C] placeholder-[#7A8C7E] border border-[#E6E0D5] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#5A6D5D]"
        />
        <button
          id="submit-chat-msg-btn"
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="p-2.5 bg-[#5A6D5D] hover:bg-[#4A5D4D] disabled:bg-[#E6E0D5]/60 text-white rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

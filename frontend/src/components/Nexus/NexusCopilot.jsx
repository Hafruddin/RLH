// admin/src/components/Nexus/NexusCopilot.jsx
import React, { useState } from "react";
import { Bot, Cpu, Send, Sparkles, User } from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function NexusCopilot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hello! I am the **MediCare Nexus AI Operations Copilot**. I monitor real-time constraints across 48 beds, 90 staff, 8 operating theatres, and 12 diagnostic devices.\n\nAsk me anything about current ICU occupancy, emergency cardiac protocols, diagnostic queue balancing, or simulated resource re-routing!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    "What is the current ICU capacity and occupancy rate?",
    "Which doctors are on-duty and ready for cardiac resuscitation?",
    "Are there any diagnostic bottlenecks in radiology?",
    "Explain why ICU-05 was chosen for Patient P-104",
    "How does autonomous re-allocation resolve telemetry failure?"
  ];

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim()) return;

    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await nexusApi.askCopilot(text);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error connecting to the operations engine." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              MediCare Nexus AI Operations Copilot
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </h3>
            <span className="text-[11px] text-slate-300">Live Hospital Telemetry Knowledge Base</span>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                m.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-900 text-emerald-400"
              }`}
            >
              {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs max-w-xl shadow-xs leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-emerald-600 text-white rounded-tr-none"
                  : "bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Bot className="w-4 h-4 animate-spin text-emerald-600" />
            Analyzing hospital telemetry constraints...
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1.5 overflow-x-auto">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about hospital capacity, bed availability, staff stress, or emergency workflows..."
            className="flex-1 px-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

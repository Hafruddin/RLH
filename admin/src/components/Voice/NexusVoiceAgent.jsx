// admin/src/components/Voice/NexusVoiceAgent.jsx
// Multilingual Action-Oriented Voice Agent for MediCare Nexus Command Center
// Supports: English, Tamil, Hindi, Telugu, Kannada, Marathi, Bengali

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, ChevronRight, Activity, Globe, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";

export default function NexusVoiceAgent({ initialContext = {}, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [voiceState, setVoiceState] = useState("IDLE"); // IDLE, LISTENING, THINKING, SPEAKING, EXECUTING, SUCCESS, ERROR
  const [currentAgent, setCurrentAgent] = useState("operations");
  const [agentName, setAgentName] = useState("Nexus Operations Agent");
  const [selectedLanguage, setSelectedLanguage] = useState("auto");
  const [detectedLanguage, setDetectedLanguage] = useState("en");
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "agent",
      text: "Nexus Operations Assistant active. Monitor bed capacities, trigger Code Red emergencies, forecast patient surges, or re-allocate clinical resources entirely through voice.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [actionConfirmation, setActionConfirmation] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [textInput, setTextInput] = useState("");

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const chatScrollRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const LANGUAGES = [
    { code: "auto", label: "Auto Detect (தானியங்கி)" },
    { code: "en", label: "English" },
    { code: "ta", label: "Tamil (தமிழ்)" },
    { code: "hi", label: "Hindi (हिंदी)" },
    { code: "te", label: "Telugu (తెలుగు)" },
    { code: "kn", label: "Kannada (ಕನ್ನಡ)" },
    { code: "mr", label: "Marathi (मराठी)" },
    { code: "bn", label: "Bengali (বাংলা)" }
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage === "auto" ? "en-US" : getLangLocale(selectedLanguage);

        recognition.onstart = () => {
          setVoiceState("LISTENING");
          setActiveStep(1);
        };

        recognition.onresult = (event) => {
          let currentSpeech = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentSpeech += event.results[i][0].transcript;
          }
          setTranscript(currentSpeech);
        };

        recognition.onerror = (event) => {
          console.warn("Speech recognition notice:", event.error);
          if (event.error !== "no-speech") {
            setVoiceState("IDLE");
          }
        };

        recognition.onend = () => {
          setTranscript((finalText) => {
            if (finalText.trim()) {
              handleVoiceSubmission(finalText.trim());
            } else {
              setVoiceState("IDLE");
            }
            return "";
          });
        };

        recognitionRef.current = recognition;
      }

      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis;
      }
    }

    return () => {
      stopVoice();
    };
  }, [selectedLanguage]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, activeStep]);

  function getLangLocale(code) {
    switch (code) {
      case "ta": return "ta-IN";
      case "hi": return "hi-IN";
      case "te": return "te-IN";
      case "kn": return "kn-IN";
      case "mr": return "mr-IN";
      case "bn": return "bn-IN";
      default: return "en-US";
    }
  }

  function toggleListening() {
    if (voiceState === "LISTENING") {
      stopVoice();
    } else {
      stopVoice();
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = selectedLanguage === "auto" ? "en-US" : getLangLocale(selectedLanguage);
          recognitionRef.current.start();
        }
      } catch (err) {
        console.warn("Mic start notice:", err);
      }
    }
  }

  function stopVoice() {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    if (voiceState === "LISTENING" || voiceState === "SPEAKING") {
      setVoiceState("IDLE");
    }
  }

  async function handleVoiceSubmission(userUtterance) {
    if (!userUtterance) return;
    if (synthRef.current) synthRef.current.cancel();

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userUtterance, timestamp: new Date().toLocaleTimeString() }
    ]);

    setVoiceState("THINKING");
    setActiveStep(2);

    try {
      const res = await fetch(`${API_BASE}/api/voice/converse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "admin"
        },
        body: JSON.stringify({
          message: userUtterance,
          context: initialContext,
          currentAgent
        })
      });

      const data = await res.json();

      if (data.success) {
        setCurrentAgent(data.agent);
        setAgentName(data.agentName);
        setDetectedLanguage(data.detectedLanguage);

        if (data.executedAction) {
          setActiveStep(3);
          setVoiceState("EXECUTING");
          setActionConfirmation(data.executedAction);
          setTimeout(() => {
            setActiveStep(4);
            setVoiceState("SUCCESS");
          }, 600);
        } else {
          setActiveStep(3);
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: "agent",
            text: data.responseText,
            action: data.executedAction,
            agentName: data.agentName,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);

        if (!isMuted) {
          speakResponse(data.responseText, data.detectedLanguage);
        } else {
          setVoiceState("IDLE");
        }
      } else {
        setVoiceState("ERROR");
        setMessages((prev) => [
          ...prev,
          {
            sender: "agent",
            text: data.message || "I encountered an issue processing your operations request.",
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }
    } catch (err) {
      console.error("Voice processing error:", err);
      setVoiceState("ERROR");
    }
  }

  function speakResponse(text, langCode) {
    if (!synthRef.current || isMuted) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLangLocale(langCode || detectedLanguage);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setVoiceState("SPEAKING");
    utterance.onend = () => setVoiceState("IDLE");
    utterance.onerror = () => setVoiceState("IDLE");

    synthRef.current.speak(utterance);
  }

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const txt = textInput.trim();
    setTextInput("");
    handleVoiceSubmission(txt);
  };

  const stateBadgeConfig = {
    IDLE: { color: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "Command Ready", dot: "bg-emerald-500" },
    LISTENING: { color: "bg-emerald-500 text-white border-emerald-600 animate-pulse", label: "Listening...", dot: "bg-white animate-ping" },
    THINKING: { color: "bg-blue-100 text-blue-800 border-blue-300", label: "Evaluating Telemetry...", dot: "bg-blue-500" },
    SPEAKING: { color: "bg-purple-100 text-purple-800 border-purple-300", label: "Speaking...", dot: "bg-purple-500 animate-pulse" },
    EXECUTING: { color: "bg-amber-100 text-amber-800 border-amber-300", label: "Orchestrating...", dot: "bg-amber-500" },
    SUCCESS: { color: "bg-emerald-600 text-white border-emerald-700", label: "Synchronized", dot: "bg-white" },
    ERROR: { color: "bg-rose-100 text-rose-800 border-rose-300", label: "Error", dot: "bg-rose-500" }
  };

  return (
    <>
      {/* 1. Global Floating Orb Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) toggleListening();
          }}
          className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 backdrop-blur-md cursor-pointer border ${
            voiceState === "LISTENING"
              ? "bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-200 shadow-emerald-500/50 scale-105"
              : voiceState === "SPEAKING"
              ? "bg-purple-600 text-white border-purple-400 ring-4 ring-purple-200 shadow-purple-500/50 scale-105"
              : voiceState === "EXECUTING"
              ? "bg-amber-500 text-white border-amber-400 ring-4 ring-amber-200 shadow-amber-500/50 scale-105"
              : "bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white border-emerald-400/40 hover:scale-105 hover:shadow-emerald-600/40"
          }`}
          title="Nexus Operations Voice Orchestrator"
        >
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                voiceState === "LISTENING" ? "bg-white" : "bg-emerald-300"
              }`}
            />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>

          <Mic className={`w-5 h-5 ${voiceState === "LISTENING" ? "animate-bounce" : ""}`} />
          <span className="text-sm font-semibold tracking-wide hidden sm:inline">
            Nexus Ops Voice
          </span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {detectedLanguage}
          </span>
        </button>
      </div>

      {/* 2. Slide-Over Interactive Voice Assistant Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white/95 backdrop-blur-xl shadow-2xl border-l border-emerald-100 flex flex-col justify-between transition-all duration-300 animate-slide-left">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-linear-to-r from-emerald-50/90 via-white to-teal-50/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm leading-tight flex items-center gap-1.5">
                  {agentName}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${stateBadgeConfig[voiceState].color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${stateBadgeConfig[voiceState].dot}`} />
                    {stateBadgeConfig[voiceState].label}
                  </span>
                  <span className="text-[11px] text-gray-500 uppercase font-semibold">
                    Lang: {detectedLanguage}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                title={isMuted ? "Unmute Voice" : "Mute Voice"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-gray-600" />}
              </button>
              <button
                onClick={() => {
                  stopVoice();
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Step Indicator */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-[11px] font-medium text-gray-500">
            <span className={activeStep >= 1 ? "text-emerald-700 font-bold" : ""}>1. Audio Telemetry</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className={activeStep >= 2 ? "text-emerald-700 font-bold" : ""}>2. Solver Parsing</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className={activeStep >= 3 ? "text-amber-600 font-bold" : ""}>3. Resource Allocation</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className={activeStep >= 4 ? "text-emerald-700 font-bold" : ""}>4. State Mutated</span>
          </div>

          {/* Action Confirmation Banner */}
          {actionConfirmation && (
            <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 animate-fade-in shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-emerald-900 block uppercase tracking-wide">
                  {actionConfirmation.type.replace(/_/g, " ")}
                </span>
                <p className="text-xs text-emerald-800 mt-0.5 font-medium leading-relaxed">
                  {actionConfirmation.details}
                </p>
                <span className="inline-block text-[10px] text-emerald-700 mt-1 font-semibold">
                  ✓ Database Synchronized • Real-Time Broadcast Dispatched
                </span>
              </div>
            </div>
          )}

          {/* Chat / Transcript Stream */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                    m.sender === "user"
                      ? "bg-emerald-700 text-white rounded-br-xs"
                      : "bg-gray-100 text-gray-800 border border-gray-200/60 rounded-bl-xs"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {m.sender === "agent" ? m.agentName || "Nexus Ops Voice" : "Operations Admin"} • {m.timestamp}
                </span>
              </div>
            ))}

            {transcript && (
              <div className="flex flex-col items-end">
                <div className="max-w-[85%] rounded-2xl p-3 text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 border-dashed animate-pulse">
                  🎙 {transcript}...
                </div>
              </div>
            )}
          </div>

          {/* Interactive Voice Orb & PTT Section */}
          <div className="p-4 bg-gray-50/80 border-t border-gray-100 space-y-3">
            
            {/* Quick Demo Operational Prompts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              <button
                onClick={() => handleVoiceSubmission("P-1005க்கு emergency activate பண்ணுங்கள்")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium transition-colors"
              >
                🚨 Code Red P-1005 (தமிழ்)
              </button>
              <button
                onClick={() => handleVoiceSubmission("ICU occupancy எப்படி இருக்கு?")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
              >
                🛏 ICU Status (தமிழ்)
              </button>
              <button
                onClick={() => handleVoiceSubmission("Why did you select ICU-06?")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
              >
                💡 Why ICU-06?
              </button>
              <button
                onClick={() => handleVoiceSubmission("Reserve ICU-06")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
              >
                🔒 Reserve ICU-06
              </button>
              <button
                onClick={() => handleVoiceSubmission("What is the ER forecast for the next two hours?")}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
              >
                📈 ER Forecast (2h)
              </button>
            </div>

            {/* Central Mic Visualizer & Trigger */}
            <div className="flex items-center justify-between gap-3">
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="text-xs bg-white border border-gray-200 rounded-xl px-2.5 py-2 text-gray-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={toggleListening}
                className={`flex-1 py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-md transition-all cursor-pointer ${
                  voiceState === "LISTENING"
                    ? "bg-rose-500 hover:bg-rose-600 text-white animate-pulse"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white hover:shadow-emerald-700/30"
                }`}
              >
                {voiceState === "LISTENING" ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    <span>Listening (Tap to Stop)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>Command Voice Agent</span>
                  </>
                )}
              </button>
            </div>

            {/* Text Input Fallback */}
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Voice command or operational query..."
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-xl hover:bg-emerald-900 transition-colors"
              >
                Execute
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

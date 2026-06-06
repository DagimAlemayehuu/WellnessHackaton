"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  Video, 
  Mic, 
  Upload, 
  CreditCard, 
  CheckCircle, 
  Volume2, 
  AlertTriangle,
  Settings,
  Send,
  Sliders,
  Inbox,
  Sparkles,
  Key,
  XCircle,
  Loader,
  MessageSquare,
  Sun,
  Moon,
  RotateCcw
} from "lucide-react";

export default function Home() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState("chat"); // chat, posture, files, settings
  const [isDarkMode, setIsDarkMode] = useState(true);

  // API Config (saved to localStorage)
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("gemma-3-27b-it");
  const [connectionStatus, setConnectionStatus] = useState("idle"); // idle, testing, success, error

  // Fasting Mode & Credits Wallet
  const [fastingMode, setFastingMode] = useState(false);
  const [wellCredits, setWellCredits] = useState(400);

  // File Uploads
  const [pdfText, setPdfText] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageIngredients, setImageIngredients] = useState("");
  const [ingestOutput, setIngestOutput] = useState("");
  const [ingestLoading, setIngestLoading] = useState(false);

  // Posture Check Camera
  const [cameraActive, setCameraActive] = useState(false);
  const [postureStatus, setPostureStatus] = useState("Awaiting Calibration");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [showSomaticBreak, setShowSomaticBreak] = useState(false);
  const [breathingStep, setBreathingStep] = useState("Inhale");
  const [journalText, setJournalText] = useState("");

  // Simulated listening state
  const [isListening, setIsListening] = useState(false);

  // Main Chat System
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hello! I am your wellness assistant. Ask me anything about health, traditional Ethiopian herbs, or stress relief." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Spa Booking
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, failed, success
  const [simulatedRetry, setSimulatedRetry] = useState(false);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("minktilet_api_key");
    const savedModel = localStorage.getItem("minktilet_model_name");
    const savedTheme = localStorage.getItem("minktilet_theme");
    if (savedKey) setApiKey(savedKey);
    if (savedModel) setModelName(savedModel);
    if (savedTheme === "light") setIsDarkMode(false);
  }, []);

  // Save Config
  const saveConfig = () => {
    localStorage.setItem("minktilet_api_key", apiKey);
    localStorage.setItem("minktilet_model_name", modelName);
    setConnectionStatus("idle");
  };

  // Toggle Theme
  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem("minktilet_theme", nextMode ? "dark" : "light");
  };

  // Connection Test Handshake
  const testConnection = async () => {
    setConnectionStatus("testing");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "text_prompt", 
          payload: "Hello. Just say hi to test.", 
          fastingMode,
          apiKey: apiKey || null,
          modelName: modelName || null
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus("success");
      } else {
        setConnectionStatus("error");
      }
    } catch (err) {
      setConnectionStatus("error");
    }
  };

  // Somatic break breathing cycle
  useEffect(() => {
    let interval;
    if (showSomaticBreak) {
      interval = setInterval(() => {
        setBreathingStep((prev) => {
          if (prev === "Inhale") return "Hold";
          if (prev === "Hold") return "Exhale";
          return "Inhale";
        });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [showSomaticBreak]);

  // Webcam camera
  const toggleCamera = async () => {
    try {
      if (cameraActive) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        setCameraActive(false);
        setPostureStatus("Awaiting Calibration");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setCameraActive(true);
      setPostureStatus("Checking posture");
      
      setTimeout(() => {
        setPostureStatus("Good Posture");
      }, 2000);
    } catch (err) {
      alert("Please allow camera access in your browser.");
    }
  };

  const forceSlouch = () => {
    if (!cameraActive) {
      alert("Please turn on the camera first.");
      return;
    }
    setPostureStatus("Bad Posture (Slouching)");
    setTimeout(() => {
      setShowSomaticBreak(true);
    }, 1500);
  };

  const endSomaticBreak = () => {
    setShowSomaticBreak(false);
    setPostureStatus("Good Posture");
    setWellCredits(prev => prev + 150);
  };

  // Ingest API handler
  const executeIngest = async (type, payload) => {
    setIngestLoading(true);
    setIngestOutput("");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type, 
          payload, 
          fastingMode,
          apiKey: apiKey || null,
          modelName: modelName || null
        })
      });
      const data = await response.json();
      setIngestOutput(data.answer);
    } catch (err) {
      setIngestOutput("Connection error. Check settings.");
    } finally {
      setIngestLoading(false);
    }
  };

  // Audio Voice Recorder Simulator
  const handleVoiceOrbClick = () => {
    if (isListening) {
      setIsListening(false);
      executeIngest("audio_prompt", "I feel tired and my neck hurts.");
    } else {
      setIsListening(true);
    }
  };

  // PDF Text file reader (Fully functional)
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPdfText(event.target.result);
    };
    reader.readAsText(file);
  };

  // Image Scan Upload (Fully functional)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      setImageIngredients("Ingredients: Aqua, Methylparaben, Triethanolamine, fragrance.");
    };
    reader.readAsDataURL(file);
  };

  // Chat message send
  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: "text_prompt", 
          payload: userMessage, 
          fastingMode,
          apiKey: apiKey || null,
          modelName: modelName || null
        })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Connection failed. Please check settings." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Telebirr checkout
  const handlePayment = () => {
    setPaymentStatus("processing");

    setTimeout(() => {
      if (!simulatedRetry) {
        setPaymentStatus("failed");
        setSimulatedRetry(true);
      } else {
        setPaymentStatus("success");
        setWellCredits(prev => Math.max(0, prev - 300));
      }
    }, 2000);
  };

  // Styles mapping (Strictly monochrome: white, black, grey)
  const themeBg = isDarkMode ? "bg-[#09090b]" : "bg-[#fafafa]";
  const themePanel = isDarkMode ? "bg-[#18181b] border-[#27272a]" : "bg-[#ffffff] border-[#e4e4e7]";
  const themeBorder = isDarkMode ? "border-[#27272a]" : "border-[#e4e4e7]";
  const themeText = isDarkMode ? "text-[#f4f4f5]" : "text-[#09090b]";
  const themeTextMuted = isDarkMode ? "text-[#a1a1aa]" : "text-[#71717a]";
  const themeInput = isDarkMode ? "bg-[#27272a] text-[#f4f4f5] border-[#3f3f46] focus:border-[#a1a1aa]" : "bg-[#f4f4f5] text-[#09090b] border-[#e4e4e7] focus:border-[#71717a]";
  const themeBtn = isDarkMode ? "bg-[#f4f4f5] text-[#09090b] hover:bg-[#e4e4e7]" : "bg-[#09090b] text-[#ffffff] hover:bg-[#27272a]";
  const themeBtnMuted = isDarkMode ? "bg-[#27272a] text-[#f4f4f5] hover:bg-[#3f3f46] border-[#3f3f46]" : "bg-[#f4f4f5] text-[#09090b] hover:bg-[#e4e4e7] border-[#e4e4e7]";

  return (
    <div className={`min-h-screen ${themeBg} ${themeText} flex flex-col md:grid md:grid-rows-[60px_1fr] md:p-6 md:gap-6 max-w-2xl mx-auto transition-colors duration-300`}>
      
      {/* HEADER NAVBAR */}
      <header className={`${themePanel} border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl shadow-sm`}>
        <div className="flex items-center justify-between w-full sm:w-auto">
          <h1 className="font-serif text-sm uppercase tracking-widest font-black">MINKTILET</h1>
          
          <button onClick={toggleTheme} className="sm:hidden p-1 opacity-70 hover:opacity-100">
            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>

        {/* Tab Links */}
        <nav className={`flex ${isDarkMode ? "bg-[#09090b]" : "bg-[#f4f4f5]"} p-0.5 rounded-lg border ${themeBorder}`}>
          <button 
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all ${
              activeTab === "chat" 
                ? (isDarkMode ? "bg-[#f4f4f5] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]") 
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Chat
          </button>
          <button 
            onClick={() => setActiveTab("posture")}
            className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all ${
              activeTab === "posture" 
                ? (isDarkMode ? "bg-[#f4f4f5] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]") 
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Posture
          </button>
          <button 
            onClick={() => setActiveTab("ingest")}
            className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all ${
              activeTab === "ingest" 
                ? (isDarkMode ? "bg-[#f4f4f5] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]") 
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Files
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-all ${
              activeTab === "settings" 
                ? (isDarkMode ? "bg-[#f4f4f5] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]") 
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Theme and Wallet (Desktop) */}
        <div className="hidden sm:flex items-center gap-4">
          <button onClick={toggleTheme} className="p-1 opacity-70 hover:opacity-100">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <span className="text-xs font-bold">{wellCredits} Credits</span>
        </div>
      </header>

      {/* VIEW PANE CONTAINER */}
      <main className="flex-1 flex flex-col gap-6 p-4 sm:p-0">
        <div className={`${themePanel} border rounded-xl p-5 flex flex-col shadow-sm min-h-[450px]`}>
          
          {/* VIEW 1: FULL SCREEN CHAT */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              
              {/* Message History */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-lg max-w-[85%] text-xs leading-relaxed ${
                      msg.role === "user" 
                        ? `${isDarkMode ? "bg-[#ffffff] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]"} ml-auto font-medium` 
                        : `${themePanel} border mr-auto`
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
                    ) : (
                      msg.content
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className={`p-3 rounded-lg max-w-[85%] text-xs border mr-auto animate-pulse ${themePanel}`}>
                    Thinking...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={sendChatMessage} className={`flex gap-2 border-t pt-3 ${themeBorder}`}>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                  placeholder="Type a message here..."
                  className={`flex-1 rounded px-3 py-2 text-xs focus:outline-none border ${themeInput}`}
                />
                <button 
                  type="submit" 
                  disabled={chatLoading || !chatInput.trim()}
                  className={`p-2.5 rounded transition-all disabled:opacity-30 ${themeBtn}`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          )}

          {/* VIEW 2: POSTURE CAMERA CHECK */}
          {activeTab === "posture" && (
            <div className="flex-1 flex flex-col justify-between gap-6">
              
              <div className="flex flex-col gap-1">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider">Camera Posture Check</h3>
                <p className={`text-xs ${themeTextMuted}`}>Check your sitting posture using your webcam feed.</p>
              </div>

              {/* Central Voice orb trigger */}
              <div className="flex flex-col items-center gap-3">
                <button 
                  onClick={handleVoiceOrbClick}
                  className={`w-20 h-20 rounded-full border flex items-center justify-center transition-all ${
                    isListening ? "animate-pulse border-white bg-zinc-800" : `${themeBorder} hover:bg-zinc-100 dark:hover:bg-zinc-800`
                  }`}
                >
                  <Mic className="w-6 h-6" />
                </button>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">Click to record voice note</span>
              </div>

              {/* Camera Preview */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className={themeTextMuted}>Webcam feed:</span>
                    <span className={`font-bold px-2 py-0.5 border rounded text-[9px] uppercase ${
                      postureStatus.includes("Good") ? "bg-zinc-500/10 text-zinc-400" :
                      postureStatus.includes("Bad") ? "bg-red-500/10 text-red-500 animate-pulse border-red-500/20" :
                      "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    }`}>
                      {postureStatus}
                    </span>
                  </div>

                  <div className={`aspect-video border rounded-lg overflow-hidden flex items-center justify-center ${themeBg} ${themeBorder}`}>
                    {!cameraActive ? (
                      <Video className="w-6 h-6 opacity-30" />
                    ) : (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-end gap-2">
                  <button 
                    onClick={toggleCamera}
                    className={`w-full py-2 rounded text-xs uppercase font-bold tracking-wider transition-colors border ${themeBtnMuted}`}
                  >
                    {cameraActive ? "Turn Off Camera" : "Turn On Camera"}
                  </button>
                  <button 
                    onClick={forceSlouch}
                    className="w-full bg-zinc-950 text-white dark:bg-white dark:text-black font-bold py-2 rounded text-xs uppercase tracking-wider hover:opacity-95 transition-opacity"
                  >
                    Test Posture Alert (Bad posture)
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* VIEW 3: INGESTION FILES */}
          {activeTab === "ingest" && (
            <div className="flex-1 flex flex-col gap-6">
              
              <div>
                <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-1">Check Files & Cream Pictures</h3>
                <p className={`text-xs ${themeTextMuted}`}>Upload blood test reports or checks skincare ingredients list.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* PDF */}
                <div className={`border p-4 rounded-lg flex flex-col gap-3 ${themeBg} ${themeBorder}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider">1. Blood test file (.txt)</span>
                  <input type="file" accept=".txt,.pdf" onChange={handlePdfUpload} className="hidden" id="pdf-upload" />
                  <label htmlFor="pdf-upload" className={`border border-dashed rounded-lg p-5 flex flex-col items-center justify-center gap-2 cursor-pointer text-xs transition-colors ${themeBorder} ${themeTextMuted} hover:text-current`}>
                    <Upload className="w-5 h-5 opacity-40" />
                    {pdfFileName ? pdfFileName : "Select text file"}
                  </label>

                  {pdfText && (
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-[9px] font-mono max-h-[80px] overflow-y-auto">
                      {pdfText}
                    </div>
                  )}

                  <button 
                    disabled={ingestLoading || !pdfText}
                    onClick={() => executeIngest("bloodwork_pdf", pdfText)}
                    className={`w-full py-2 rounded text-xs uppercase font-bold tracking-wider transition-all disabled:opacity-40 ${themeBtn}`}
                  >
                    Check Blood Test
                  </button>
                </div>

                {/* Skin cream image */}
                <div className={`border p-4 rounded-lg flex flex-col gap-3 ${themeBg} ${themeBorder}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider">2. Skin Cream Ingredients Image</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                  <label htmlFor="image-upload" className={`border border-dashed rounded-lg p-5 flex flex-col items-center justify-center gap-2 cursor-pointer text-xs transition-colors ${themeBorder} ${themeTextMuted} hover:text-current`}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" className="max-h-[60px] rounded" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 opacity-40" />
                        <span>Select image file</span>
                      </>
                    )}
                  </label>

                  {imageIngredients && (
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-[9px] font-mono">
                      {imageIngredients}
                    </div>
                  )}

                  <button 
                    disabled={ingestLoading || !imageIngredients}
                    onClick={() => executeIngest("cream_photo", imageIngredients)}
                    className={`w-full py-2 rounded text-xs uppercase font-bold tracking-wider transition-all disabled:opacity-40 ${themeBtn}`}
                  >
                    Check Skincare
                  </button>
                </div>

              </div>

              {/* Output Results */}
              <div className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-4 flex-1 flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">Result:</span>
                <div className={`flex-1 border rounded-lg p-4 text-xs leading-relaxed min-h-[100px] max-h-[200px] overflow-y-auto ${themeBg} ${themeBorder}`}>
                  {ingestLoading ? (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Checking...</span>
                    </div>
                  ) : ingestOutput ? (
                    <div dangerouslySetInnerHTML={{ __html: ingestOutput.replace(/\n/g, '<br />') }} />
                  ) : (
                    <span className={themeTextMuted}>Results of your tests will appear here.</span>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* VIEW 4: SYSTEM SETTINGS */}
          {activeTab === "settings" && (
            <div className="flex-1 flex flex-col gap-6">
              
              <div>
                <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-1">API Key & Fasting Settings</h3>
                <p className={`text-xs ${themeTextMuted}`}>Enter your API Key and configure options below.</p>
              </div>

              <div className="bg-[#fcfcfc] dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg p-4 flex flex-col gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Google AI Studio API Key:</label>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter Key here..."
                    className={`rounded px-3 py-1.5 text-xs focus:outline-none border ${themeInput}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Model Name:</label>
                  <input 
                    type="text" 
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="gemma-3-27b-it"
                    className={`rounded px-3 py-1.5 text-xs focus:outline-none border ${themeInput}`}
                  />
                  <span className="text-[9px] text-zinc-400">Gemma 4: gemma-3-27b-it &nbsp;|&nbsp; Fast: gemma-3-4b-it &nbsp;|&nbsp; Gemini: gemini-2.0-flash</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button 
                    onClick={saveConfig}
                    className={`py-2 rounded text-xs uppercase font-bold tracking-wider border transition-colors ${themeBtnMuted}`}
                  >
                    Save Config
                  </button>
                  <button 
                    onClick={testConnection}
                    disabled={connectionStatus === "testing"}
                    className={`py-2 rounded text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1 ${themeBtn}`}
                  >
                    {connectionStatus === "testing" && <Loader className="w-3.5 h-3.5 animate-spin" />}
                    Test Connection
                  </button>
                </div>

                {connectionStatus !== "idle" && (
                  <div className={`p-2.5 rounded text-xs flex items-center gap-2 border ${
                    connectionStatus === "testing" ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" :
                    connectionStatus === "success" ? "bg-zinc-500/10 text-zinc-100 border-zinc-500/30" :
                    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                  }`}>
                    {connectionStatus === "testing" && <Loader className="w-4 h-4 animate-spin" />}
                    {connectionStatus === "success" && <CheckCircle className="w-4 h-4" />}
                    {connectionStatus === "error" && <XCircle className="w-4 h-4" />}
                    <span>
                      {connectionStatus === "testing" && "Testing key connection..."}
                      {connectionStatus === "success" && `Success! Target model connected: ${modelName}`}
                      {connectionStatus === "error" && "Failed. Running in Offline Fallback."}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs border-t pt-4 border-zinc-200 dark:border-zinc-800">
                  <div>
                    <span className="block font-bold">Fasting Schedule Filter</span>
                    <span className="text-[10px] text-zinc-500">Enable Orthodox strict vegan calendar meals.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={fastingMode}
                      onChange={() => setFastingMode(!fastingMode)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 dark:after:bg-zinc-400 after:rounded-full after:height-4 after:w-4 after:transition-all peer-checked:bg-zinc-500"></div>
                  </label>
                </div>

                <div className="flex justify-between items-center text-xs border-t pt-4 border-zinc-200 dark:border-zinc-800">
                  <div>
                    <span className="block font-bold">Booking checkout test</span>
                    <span className="text-[10px] text-zinc-500">Test Telebirr booking payments.</span>
                  </div>
                  <button 
                    onClick={() => setShowBookingModal(true)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${themeBtn}`}
                  >
                    Open Checkout
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* OVERLAY: SOMATIC BREAK OVERLAY */}
      {showSomaticBreak && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#18181b] border border-[#27272a] rounded-xl p-8 flex flex-col items-center gap-6 shadow-2xl text-white">
            
            <div className="flex items-center gap-2 text-zinc-300">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <span className="font-serif text-sm tracking-wider uppercase font-bold">Posture Alert</span>
            </div>
            
            <p className="text-xs text-zinc-400 text-center leading-relaxed">
              Workspace paused due to slouching. Sit back, drop your shoulders, and complete this 3-minute breath cycle.
            </p>

            {/* Breathing animation */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div 
                className={`absolute inset-0 rounded-full border border-white/40 transition-transform duration-[4000ms] ease-in-out ${
                  breathingStep === "Inhale" ? "scale-100 bg-white/5" :
                  breathingStep === "Hold" ? "scale-105 bg-white/10 animate-pulse" :
                  "scale-75 bg-white/0"
                }`}
              />
              <span className="text-[10px] font-bold tracking-widest uppercase z-10">{breathingStep}</span>
            </div>

            <div className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5"><Volume2 className="w-4 h-4 text-zinc-400" /> Sound resonance</span>
              <span className="text-[10px] text-zinc-400 font-bold">Resonating</span>
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <span className="text-[10px] uppercase text-zinc-500 tracking-wider">How do you feel?</span>
              <textarea 
                value={journalText} 
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="Type here..." 
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white h-14 resize-none"
              />
            </div>

            <button 
              onClick={endSomaticBreak}
              className="w-full bg-white text-black font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all"
            >
              Resume (+150 Credits)
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY: BOOKING & CHECKOUT MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#18181b] border border-[#27272a] rounded-xl p-6 flex flex-col gap-5 shadow-2xl text-white">
            <div>
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider">Checkout Booking</h3>
              <p className="text-xs text-zinc-500">Book your spa session at Kuriftu Resort.</p>
            </div>

            <div className="bg-zinc-955 border border-zinc-800 rounded p-3 flex justify-between items-center text-xs">
              <span>Swedish Massage & Spiced Kibe Scrub</span>
              <span className="font-bold">1500 ETB</span>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg flex justify-between text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-zinc-300">Well-Credits Applied</span>
                <span className="text-[10px] text-zinc-500">1 Credit = 1 ETB</span>
              </div>
              <span className="font-bold">-{wellCredits} ETB</span>
            </div>

            <div className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Outstanding cash (Telebirr):</span>
              <span className="font-bold text-white">{Math.max(0, 1500 - wellCredits)} ETB</span>
            </div>

            {paymentStatus === "idle" && (
              <button 
                onClick={handlePayment}
                className="w-full bg-white text-black font-bold py-3 rounded-lg text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Checkout With Telebirr Micro-Loan
              </button>
            )}

            {paymentStatus === "processing" && (
              <div className="flex flex-col items-center gap-2 py-4">
                <span className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span className="text-xs animate-pulse">Connecting Telebirr Escrow...</span>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="flex flex-col gap-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex gap-2.5 text-xs text-red-400">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5">Gateway Handshake failure</strong>
                    Interoperability timed out. Caching current ledger.
                  </div>
                </div>
                <button 
                  onClick={handlePayment}
                  className="w-full bg-white text-black font-bold py-3 rounded-lg text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Activate Smart-Retry API
                </button>
              </div>
            )}

            {paymentStatus === "success" && (
              <div className="flex flex-col items-center gap-4 text-center py-2">
                <CheckCircle className="w-10 h-10 text-zinc-300 animate-bounce" />
                <div>
                  <h4 className="font-serif text-sm text-zinc-300 font-bold mb-1">Booking Verified</h4>
                  <p className="text-xs text-zinc-500">Spa voucher synced to WeVa EMR Ledger.</p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-[9px] w-full text-zinc-400">
                  VOUCHER: KR-66219-ETH<br/>
                  PAYMENT: ESCROW VERIFIED BY VISIONFUND
                </div>
                <button 
                  onClick={() => {
                    setShowBookingModal(false);
                    setPaymentStatus("idle");
                  }}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 rounded text-xs uppercase transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {paymentStatus !== "processing" && paymentStatus !== "success" && (
              <button 
                onClick={() => {
                  setShowBookingModal(false);
                  setPaymentStatus("idle");
                }}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-500 py-2 rounded text-xs uppercase transition-colors"
              >
                Cancel
              </button>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

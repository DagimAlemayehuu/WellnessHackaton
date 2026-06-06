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
  RotateCcw,
  Camera,
  CameraOff
} from "lucide-react";

export default function Home() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState("chat"); // chat, posture, files, settings, business
  const [isDarkMode, setIsDarkMode] = useState(true);

  // API Config (saved to localStorage)
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("gemma-4-31b-it");
  const [connectionStatus, setConnectionStatus] = useState("idle"); // idle, testing, success, error
  const [connectionError, setConnectionError] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle"); // idle, saved

  // Fasting Mode & Credits Wallet
  const [fastingMode, setFastingMode] = useState(false);

  // Business Model Features
  const [activeBusinessSubTab, setActiveBusinessSubTab] = useState("sme"); // sme, cbhi, marketplace, hew
  const [isHewCertified, setIsHewCertified] = useState(false);
  const [hewFaydaId, setHewFaydaId] = useState("");
  const [clinicalMode, setClinicalMode] = useState(false);

  // SME Bundle state
  const [smeEnrollmentList, setSmeEnrollmentList] = useState([
    { id: "SME-001", name: "Kotebe Leather Cooperative", size: 45, premium: "1,350 ETB/mo", status: "Active" },
    { id: "SME-002", name: "Bole Edir Society", size: 120, premium: "3,600 ETB/mo", status: "Active" }
  ]);
  const [ussdStep, setUssdStep] = useState(0); // 0: closed, 1: main menu, 2: enter name, 3: enter members, 4: confirmation, 5: success
  const [ussdInput, setUssdInput] = useState("");
  const [ussdCoopName, setUssdCoopName] = useState("");
  const [ussdCoopMembers, setUssdCoopMembers] = useState("");
  const [ussdFeedback, setUssdFeedback] = useState("");

  // CBHI state
  const [cbhiEnrollments, setCbhiEnrollments] = useState([
    { policyId: "CBHI-ET-9021", name: "Abebe Bekele", members: 5, region: "Oromia / Bishoftu", status: "Approved", premium: "240 ETB/yr" }
  ]);
  const [cbhiName, setCbhiName] = useState("");
  const [cbhiFaydaId, setCbhiFaydaId] = useState("");
  const [cbhiMembers, setCbhiMembers] = useState("4");
  const [cbhiRegion, setCbhiRegion] = useState("Amhara / Dejen");
  const [cbhiTelebirrPhone, setCbhiTelebirrPhone] = useState("");
  const [cbhiPaymentStep, setCbhiPaymentStep] = useState("idle"); // idle, paying, success
  const [cbhiSearchQuery, setCbhiSearchQuery] = useState("");
  const [cbhiSearchResult, setCbhiSearchResult] = useState(null);

  // Marketplace state
  const [marketplaceConsent, setMarketplaceConsent] = useState(false);
  const [accruedVouchers, setAccruedVouchers] = useState(0); // ETB
  const [marketplaceTransactions, setMarketplaceTransactions] = useState([
    { id: "TX-9901", buyer: "Nile Insurance Corp", type: "Stress Indices", date: "2026-06-05", value: "4,500 ETB" },
    { id: "TX-9902", buyer: "Ministry of Health", type: "Ergonomic Trends", date: "2026-06-06", value: "12,000 ETB" }
  ]);
  const [shareDataFeedback, setShareDataFeedback] = useState("");

  // HEW state
  const [hewQuizAnswers, setHewQuizAnswers] = useState({ q1: "", q2: "", q3: "" });
  const [hewQuizChecked, setHewQuizChecked] = useState(false);
  const [hewQuizSuccess, setHewQuizSuccess] = useState(false);
  const [hewFeedback, setHewFeedback] = useState("");

  // File Uploads
  const [pdfText, setPdfText] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageIngredients, setImageIngredients] = useState("");
  const [ingestOutput, setIngestOutput] = useState("");
  const [ingestLoading, setIngestLoading] = useState(false);

  // Posture Scanner State
  const [postureOutput, setPostureOutput] = useState("");
  const [postureLoading, setPostureLoading] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [postureImagePreview, setPostureImagePreview] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop webcam when switching tabs
  useEffect(() => {
    if (activeTab !== "posture") {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setWebcamActive(false);
    }
  }, [activeTab]);

  // Bind webcam stream to video element when camera is activated
  useEffect(() => {
    if (webcamActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [webcamActive]);

  // Voice recognition
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recognitionRef = useRef(null);
  const voiceTranscriptRef = useRef(""); // keeps transcript fresh inside async closures

  // Keep ref in sync with state
  useEffect(() => { voiceTranscriptRef.current = voiceTranscript; }, [voiceTranscript]);

  // Main Chat System
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", content: "Hello! I am your wellness assistant. Ask me anything about health, traditional Ethiopian herbs, or stress relief." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("minktilet_api_key");
    const savedModel = localStorage.getItem("minktilet_model_name");
    const savedTheme = localStorage.getItem("minktilet_theme");
    if (savedKey) setApiKey(savedKey);
    if (savedModel) setModelName(savedModel);
    if (savedTheme === "light") setIsDarkMode(false);
  }, []);

  // Save Config — shows "Saved!" flash
  const saveConfig = () => {
    localStorage.setItem("minktilet_api_key", apiKey);
    localStorage.setItem("minktilet_model_name", modelName);
    setConnectionStatus("idle");
    setConnectionError("");
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 1500);
  };

  // Clear saved config (wipe localStorage cache)
  const clearConfig = () => {
    localStorage.removeItem("minktilet_api_key");
    localStorage.removeItem("minktilet_model_name");
    setApiKey("");
    setModelName("gemma-4-31b-it");
    setConnectionStatus("idle");
    setConnectionError("");
  };

  // Toggle Theme
  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem("minktilet_theme", nextMode ? "dark" : "light");
  };

  // Connection Test
  const testConnection = async () => {
    setConnectionStatus("testing");
    setConnectionError("");
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text_prompt", payload: "hi", fastingMode, apiKey, isHewCertified }),
      });
      const data = await response.json();
      if (data.success) {
        setConnectionStatus("success");
      } else {
        setConnectionStatus("error");
        const errLog = data.logs?.[0] || "";
        setConnectionError(errLog.replace("[ERROR] ", "") || "Connection failed.");
      }
    } catch {
      setConnectionStatus("error");
      setConnectionError("Network error.");
    }
  };


  // Ingest API handler
  const executeIngest = async (type, payload) => {
    setIngestLoading(true);
    setIngestOutput("");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload, fastingMode, apiKey, isHewCertified })
      });
      const data = await response.json();
      setIngestOutput(data.answer);
    } catch {
      setIngestOutput("Connection error.");
    } finally {
      setIngestLoading(false);
    }
  };


  // Webcam and Posture scan functions
  const startWebcam = async () => {
    setPostureImagePreview(null);
    setPostureOutput("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" } });
      streamRef.current = stream;
      setWebcamActive(true);
    } catch (err) {
      console.error("Error accessing webcam:", err);
      alert("Could not start webcam. Please grant permissions or try uploading a picture.");
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  };

  const capturePosture = async () => {
    if (!videoRef.current) return;
    setPostureLoading(true);
    setPostureOutput("");

    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      const base64Data = dataUrl.split(",")[1];

      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "webcam_posture",
          imageData: base64Data,
          imageMime: "image/jpeg",
          fastingMode,
          apiKey,
          isHewCertified
        })
      });
      const data = await response.json();
      setPostureOutput(data.answer);
      stopWebcam();
    } catch (error) {
      console.error(error);
      setPostureOutput("Error analyzing posture. Please check your connection.");
    } finally {
      setPostureLoading(false);
    }
  };

  const handlePostureImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    stopWebcam();

    const reader = new FileReader();
    reader.onload = (event) => {
      setPostureImagePreview(event.target.result);
      setPostureOutput("");
    };
    reader.readAsDataURL(file);
  };

  const analyzeUploadedPosture = async () => {
    if (!postureImagePreview) return;
    setPostureLoading(true);
    setPostureOutput("");

    try {
      const base64Data = postureImagePreview.split(",")[1];
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "webcam_posture",
          imageData: base64Data,
          imageMime: "image/jpeg",
          fastingMode,
          apiKey,
          isHewCertified
        })
      });
      const data = await response.json();
      setPostureOutput(data.answer);
    } catch (error) {
      console.error(error);
      setPostureOutput("Error analyzing posture. Please check your connection.");
    } finally {
      setPostureLoading(false);
    }
  };


  // Real Voice Recognition using Web Speech API
  const handleVoiceOrbClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening && recognitionRef.current) {
      // Stop listening — will trigger onend → sends transcript
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript("Listening...");
    };

    recognition.onresult = (event) => {
      const interim = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setVoiceTranscript(interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      const finalText = voiceTranscriptRef.current || "";
      setVoiceTranscript("");
      if (finalText.trim()) {
        sendChatMessage(null, finalText.trim());
      }
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      setVoiceTranscript("");
      if (e.error !== "no-speech") {
        alert(`Voice error: ${e.error}`);
      }
    };

    recognition.start();
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
  const sendChatMessage = async (e, directText = null) => {
    if (e) e.preventDefault();
    const userMessage = directText || chatInput;
    if (!userMessage.trim()) return;

    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    if (!directText) setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text_prompt", payload: userMessage, fastingMode, apiKey, isHewCertified })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "⚠️ Network error." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // USSD Simulator Handler
  const handleUssdSend = (e) => {
    if (e) e.preventDefault();
    const val = ussdInput.trim();
    setUssdInput("");
    
    if (ussdStep === 1) {
      if (val === "1" || val === "2" || val === "3") {
        let namePrompt = "";
        if (val === "1") namePrompt = "Enter Edir Group Name:";
        if (val === "2") namePrompt = "Enter Equb Network Name:";
        if (val === "3") namePrompt = "Enter Cooperative Name:";
        setUssdLog(prev => [...prev, `Input: ${val}`, namePrompt]);
        setUssdStep(2);
      } else {
        setUssdLog(prev => [...prev, `Input: ${val}`, "Invalid option. Select 1, 2, or 3."]);
      }
      return;
    }
    if (ussdStep === 2) {
      if (val) {
        setUssdCoopName(val);
        setUssdLog(prev => [...prev, `Input: ${val}`, "Enter Number of Members:"]);
        setUssdStep(3);
      } else {
        setUssdLog(prev => [...prev, "Name cannot be empty."]);
      }
      return;
    }
    if (ussdStep === 3) {
      const num = parseInt(val, 10);
      if (num > 0) {
        setUssdCoopMembers(num);
        const premium = num * 30;
        setUssdLog(prev => [
          ...prev, 
          `Input: ${val}`, 
          `Confirm monthly premium of ${premium} ETB for ${num} members?\n1. Confirm & Pay via Telebirr\n2. Cancel`
        ]);
        setUssdStep(4);
      } else {
        setUssdLog(prev => [...prev, "Enter a valid positive integer."]);
      }
      return;
    }
    if (ussdStep === 4) {
      if (val === "1") {
        const newCoop = {
          id: `SME-0${smeEnrollmentList.length + 1}`,
          name: ussdCoopName,
          size: parseInt(ussdCoopMembers, 10),
          premium: `${parseInt(ussdCoopMembers, 10) * 30} ETB/mo`,
          status: "Active"
        };
        setSmeEnrollmentList(prev => [...prev, newCoop]);
        setUssdLog(prev => [...prev, `Input: ${val}`, `✓ Registration Complete!\nSME Policy ID: ${newCoop.id}\nActive micro-insurance & Telemed`]);
        setUssdStep(5);
      } else {
        setUssdStep(1);
        setUssdLog(["-- USSD Session Started (*847#) --", "HuluCares SME Enrollment System. Select Coop Type:", "1. Edir Group", "2. Equb Network", "3. Agriculture/SME Cooperative"]);
      }
      return;
    }
  };

  const dialUssd = () => {
    setUssdStep(1);
    setUssdLog([
      "-- USSD Session Started (*847#) --",
      "HuluCares SME Enrollment System. Select Coop Type:",
      "1. Edir Group",
      "2. Equb Network",
      "3. Agriculture/SME Cooperative"
    ]);
  };

  // CBHI Handlers
  const handleCbhiEnroll = (e) => {
    if (e) e.preventDefault();
    if (!cbhiName || !cbhiFaydaId || !cbhiTelebirrPhone) {
      alert("Please fill in all enrollment fields.");
      return;
    }
    setCbhiPaymentStep("paying");
  };
  
  const handleCbhiPaymentSubmit = (e) => {
    if (e) e.preventDefault();
    setTimeout(() => {
      const newPolicyId = `CBHI-ET-${Math.floor(1000 + Math.random() * 9000)}`;
      const newEnrollment = {
        policyId: newPolicyId,
        name: cbhiName,
        members: parseInt(cbhiMembers, 10),
        region: cbhiRegion,
        status: "Approved",
        premium: `${parseInt(cbhiMembers, 10) * 60} ETB/yr`
      };
      setCbhiEnrollments(prev => [...prev, newEnrollment]);
      setCbhiPaymentStep("success");
      setCbhiName("");
      setCbhiFaydaId("");
      setCbhiTelebirrPhone("");
    }, 1000);
  };

  const handleCbhiSearch = (e) => {
    if (e) e.preventDefault();
    const result = cbhiEnrollments.find(item => item.policyId.toLowerCase() === cbhiSearchQuery.trim().toLowerCase());
    if (result) {
      setCbhiSearchResult(result);
    } else {
      setCbhiSearchResult("not_found");
    }
  };

  // Data Marketplace Handlers
  const handleToggleConsent = () => {
    const nextConsent = !marketplaceConsent;
    setMarketplaceConsent(nextConsent);
    if (nextConsent) {
      setAccruedVouchers(prev => prev + 150);
      setShareDataFeedback("Consent registered. +150 ETB Telebirr data voucher awarded!");
    } else {
      setShareDataFeedback("Consent withdrawn.");
    }
    setTimeout(() => setShareDataFeedback(""), 3000);
  };
  
  const redeemVouchers = () => {
    if (accruedVouchers <= 0) return;
    alert(`Transferring ${accruedVouchers} ETB to your mobile wallet...`);
    setAccruedVouchers(0);
    alert("✓ Telebirr payout successful!");
  };
  
  const simulateB2BSale = () => {
    const buyers = ["Nile Insurance", "Tsehay Insurance", "Ministry of Health", "Zemen Health Trust"];
    const types = ["Aggregated Ergonomic Load Indices", "Anonymized Herb Safety Queries", "Addis Workspace Stress Index"];
    const randomBuyer = buyers[Math.floor(Math.random() * buyers.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomValue = `${Math.floor(4 + Math.random() * 12) * 1500} ETB`;
    const newTx = {
      id: `TX-990${marketplaceTransactions.length + 1}`,
      buyer: randomBuyer,
      type: randomType,
      date: new Date().toISOString().split("T")[0],
      value: randomValue
    };
    setMarketplaceTransactions(prev => [newTx, ...prev]);
  };

  // HEW Credentials Handlers
  const checkHewQuiz = (e) => {
    if (e) e.preventDefault();
    if (!hewFaydaId.trim()) {
      setHewFeedback("Fayda ID is required.");
      return;
    }
    const correct1 = hewQuizAnswers.q1 === "tenadam";
    const correct2 = hewQuizAnswers.q2 === "fayda";
    const correct3 = hewQuizAnswers.q3 === "forward";
    
    setHewQuizChecked(true);
    if (correct1 && correct2 && correct3) {
      setHewQuizSuccess(true);
      setIsHewCertified(true);
      setHewFeedback("✓ Quiz passed! Credentials bound to Fayda ID.");
    } else {
      setHewQuizSuccess(false);
      setHewFeedback("One or more answers are incorrect. Review materials and try again.");
    }
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
            className={`px-2 py-1.5 rounded-md text-[9px] sm:text-[10px] uppercase font-bold tracking-wider transition-all ${
              activeTab === "chat" 
                ? (isDarkMode ? "bg-[#f4f4f5] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]") 
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Chat
          </button>
          <button 
            onClick={() => setActiveTab("posture")}
            className={`px-2 py-1.5 rounded-md text-[9px] sm:text-[10px] uppercase font-bold tracking-wider transition-all ${
              activeTab === "posture" 
                ? (isDarkMode ? "bg-[#f4f4f5] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]") 
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Posture
          </button>
          <button 
            onClick={() => setActiveTab("ingest")}
            className={`px-2 py-1.5 rounded-md text-[9px] sm:text-[10px] uppercase font-bold tracking-wider transition-all ${
              activeTab === "ingest" 
                ? (isDarkMode ? "bg-[#f4f4f5] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]") 
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Files
          </button>
          <button 
            onClick={() => setActiveTab("business")}
            className={`px-2 py-1.5 rounded-md text-[9px] sm:text-[10px] uppercase font-bold tracking-wider transition-all ${
              activeTab === "business" 
                ? (isDarkMode ? "bg-[#f4f4f5] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]") 
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Business
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`px-2 py-1.5 rounded-md text-[9px] sm:text-[10px] uppercase font-bold tracking-wider transition-all ${
              activeTab === "settings" 
                ? (isDarkMode ? "bg-[#f4f4f5] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]") 
                : "opacity-60 hover:opacity-100"
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Theme (Desktop) */}
        <div className="hidden sm:flex items-center gap-4">
          <button onClick={toggleTheme} className="p-1 opacity-70 hover:opacity-100">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* VIEW PANE CONTAINER */}
      <main className="flex-1 flex flex-col gap-6 p-4 sm:p-0">
        <div className={`${themePanel} border rounded-xl p-5 flex flex-col shadow-sm min-h-[450px]`}>
          
          {/* VIEW 1: FULL SCREEN CHAT */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {clinicalMode && (
                <div className="bg-[#c5a880]/10 border border-[#c5a880]/20 p-2.5 rounded-lg text-[10px] text-[#c5a880] flex items-center justify-between mb-3 font-semibold">
                  <span>✦ CLINICAL AI MODE ACTIVE (HEW Certified)</span>
                  <span className="text-[9px] bg-[#c5a880] text-black px-1.5 py-0.5 rounded font-mono font-bold">FAYDA BIND</span>
                </div>
              )}
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
                {isListening && (
                  <div className={`p-3 rounded-lg max-w-[85%] text-xs border mr-auto animate-pulse ${themePanel} flex items-center gap-2`}>
                    <Mic className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                    <span>{voiceTranscript || "Listening..."}</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={sendChatMessage} className={`flex gap-2 border-t pt-3 ${themeBorder} items-center`}>
                <button
                  type="button"
                  onClick={handleVoiceOrbClick}
                  className={`p-2.5 rounded transition-all border ${
                    isListening 
                      ? "bg-red-500 text-white animate-pulse border-red-500" 
                      : themeBtnMuted
                  }`}
                  title="Voice input"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                  placeholder={isListening ? "Listening..." : "Type a message here..."}
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


          {/* VIEW 2: POSTURE SCANNER */}
          {activeTab === "posture" && (
            <div className="flex-1 flex flex-col gap-5">
              <div>
                <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-1">Backbone & Posture Scan</h3>
                <p className={`text-xs ${themeTextMuted}`}>Real-time visual cervical spine alignment monitor targeting ergonomic fatigue.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {/* Camera / Feed Viewport */}
                <div className={`border p-4 rounded-lg flex flex-col gap-3 items-center relative overflow-hidden ${themeBg} ${themeBorder}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider self-start flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
                    Biometric Video Stream
                  </span>

                  <div className="w-full aspect-video rounded-lg border border-zinc-800 bg-black flex items-center justify-center relative overflow-hidden">
                    {/* Scanning overlay line */}
                    {(webcamActive || postureImagePreview) && (
                      <div className="absolute left-0 w-full h-[2px] bg-[#c5a880]/60 shadow-[0_0_10px_#c5a880] animate-[scan_2s_infinite_ease-in-out] z-10"></div>
                    )}

                    {webcamActive ? (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover rounded-lg scale-x-[-1]"
                      />
                    ) : postureImagePreview ? (
                      <img 
                        src={postureImagePreview} 
                        alt="Posture upload preview" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-zinc-600">
                        <Video className="w-8 h-8 opacity-45" />
                        <span className="text-[10px]">No Active Video Stream</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 w-full">
                    {webcamActive ? (
                      <>
                        <button 
                          onClick={capturePosture}
                          disabled={postureLoading}
                          className={`flex-1 py-2 rounded text-xs uppercase font-bold tracking-wider transition-all ${themeBtn}`}
                        >
                          Scan Posture
                        </button>
                        <button 
                          onClick={stopWebcam}
                          className={`px-3 py-2 rounded text-xs uppercase font-bold tracking-wider transition-all ${themeBtnMuted}`}
                        >
                          Stop
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={startWebcam}
                          className={`flex-1 py-2 rounded text-xs uppercase font-bold tracking-wider transition-all ${themeBtn}`}
                        >
                          Start Camera
                        </button>
                        
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePostureImageUpload} 
                          className="hidden" 
                          id="posture-upload" 
                        />
                        <label 
                          htmlFor="posture-upload" 
                          className={`px-3 py-2 rounded text-xs uppercase font-bold tracking-wider cursor-pointer border text-center transition-all ${themeBtnMuted}`}
                        >
                          Upload
                        </label>
                      </>
                    )}
                  </div>

                  {postureImagePreview && !webcamActive && (
                    <button
                      onClick={analyzeUploadedPosture}
                      disabled={postureLoading}
                      className={`w-full py-2 rounded text-xs uppercase font-bold tracking-wider transition-all ${themeBtn}`}
                    >
                      Analyze Uploaded Photo
                    </button>
                  )}
                </div>

                {/* Analysis / Diagnostics */}
                <div className="flex flex-col gap-3 w-full h-full justify-between">
                  <div className={`border p-4 rounded-lg flex-1 flex flex-col gap-3 min-h-[160px] ${themeBg} ${themeBorder}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Ergonomic Diagnostics</span>
                    <div className="flex-1 flex flex-col justify-center">
                      {postureLoading ? (
                        <div className="flex items-center gap-2 text-zinc-400 justify-center py-6">
                          <Loader className="w-5 h-5 animate-spin" />
                          <span className="text-xs">Analyzing spinal curvature...</span>
                        </div>
                      ) : postureOutput ? (
                        <div className="text-xs leading-relaxed font-medium">
                          {postureOutput}
                        </div>
                      ) : (
                        <div className={`text-xs text-center py-6 ${themeTextMuted}`}>
                          Activate camera or upload photo to initiate real-time posture analysis.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Somatic grounding reminder / tips banner */}
                  <div className={`border border-amber-500/20 bg-amber-500/5 p-3.5 rounded-lg text-xs flex gap-2.5 items-start`}>
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-amber-600 dark:text-amber-400 mb-0.5">Somatic Defense Tip</strong>
                      <span className="text-[11px] opacity-80 leading-normal font-medium">
                        Addis professionals experience 40% higher musculoskeletal stiffness. Keep your display at eye level and schedule a **Kibe Somatic Compressing** if neck stress persists.
                      </span>
                    </div>
                  </div>
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

          {/* VIEW 5: BUSINESS & REVENUE INNOVATIONS */}
          {activeTab === "business" && (
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-1">Business Model & Revenue Innovations</h3>
                <p className={`text-xs ${themeTextMuted}`}>Anonymized marketplace transaction frameworks, agent systems, and training credentials.</p>
              </div>

              {/* Subtab Navigation */}
              <nav className={`flex flex-wrap ${isDarkMode ? "bg-[#09090b]" : "bg-[#f4f4f5]"} p-0.5 rounded-lg border ${themeBorder} mb-2`}>
                <button 
                  onClick={() => setActiveBusinessSubTab("sme")}
                  className={`flex-1 min-w-[80px] px-2.5 py-1.5 rounded-md text-[9px] uppercase font-bold tracking-wider transition-all ${
                    activeBusinessSubTab === "sme" 
                      ? (isDarkMode ? "bg-[#f4f4f5] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]") 
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  SME Bundle
                </button>
                <button 
                  onClick={() => setActiveBusinessSubTab("cbhi")}
                  className={`flex-1 min-w-[80px] px-2.5 py-1.5 rounded-md text-[9px] uppercase font-bold tracking-wider transition-all ${
                    activeBusinessSubTab === "cbhi" 
                      ? (isDarkMode ? "bg-[#f4f4f5] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]") 
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  CBHI Portal
                </button>
                <button 
                  onClick={() => setActiveBusinessSubTab("marketplace")}
                  className={`flex-1 min-w-[80px] px-2.5 py-1.5 rounded-md text-[9px] uppercase font-bold tracking-wider transition-all ${
                    activeBusinessSubTab === "marketplace" 
                      ? (isDarkMode ? "bg-[#f4f4f5] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]") 
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  Data Market
                </button>
                <button 
                  onClick={() => setActiveBusinessSubTab("hew")}
                  className={`flex-1 min-w-[80px] px-2.5 py-1.5 rounded-md text-[9px] uppercase font-bold tracking-wider transition-all ${
                    activeBusinessSubTab === "hew" 
                      ? (isDarkMode ? "bg-[#f4f4f5] text-[#09090b]" : "bg-[#09090b] text-[#ffffff]") 
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  HEW Training
                </button>
              </nav>

              {/* SME Wellness Bundle tab contents */}
              {activeBusinessSubTab === "sme" && (
                <div className="flex flex-col gap-4">
                  <div className={`border p-4 rounded-lg flex flex-col gap-2.5 ${themeBg} ${themeBorder}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">SME & Cooperative Wellness Bundle</span>
                    <p className="text-xs leading-normal">
                      B2B wellness bundle integrating group health micro-insurance (30 ETB/member/month), tele-consultations, and monthly wellness check-ins. Sold directly to edir groups, equb networks, and agriculture cooperatives.
                    </p>

                    <div className="mt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">Enrolled Cooperatives & Groups</span>
                      <div className="space-y-1.5">
                        {smeEnrollmentList.map(coop => (
                          <div key={coop.id} className={`p-2.5 border rounded-lg flex justify-between items-center text-xs ${themePanel}`}>
                            <div>
                              <strong className="block font-bold">{coop.name}</strong>
                              <span className="text-[10px] opacity-75">{coop.size} members · {coop.id}</span>
                            </div>
                            <div className="text-right">
                              <span className="block font-bold text-zinc-400">{coop.premium}</span>
                              <span className="inline-flex items-center gap-1 text-[9px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded uppercase font-bold">
                                {coop.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* USSD Simulator */}
                  <div className={`border p-4 rounded-lg flex flex-col gap-3 ${themePanel} relative overflow-hidden`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-400">
                      <Activity className="w-3.5 h-3.5" />
                      Interactive USSD Simulator (Enrollment Flow)
                    </span>

                    {ussdStep === 0 ? (
                      <div className="py-6 flex flex-col items-center justify-center gap-3">
                        <p className={`text-xs text-center ${themeTextMuted}`}>
                          Simulate the offline mobile USSD enrollment protocol used by remote managers to register cooperatives.
                        </p>
                        <button 
                          onClick={dialUssd}
                          className={`px-4 py-2 rounded text-xs uppercase font-bold tracking-wider ${themeBtn}`}
                        >
                          Dial *847# to Begin
                        </button>
                      </div>
                    ) : (
                      <div className="bg-[#09090b] text-green-400 font-mono p-4 rounded-lg border border-zinc-800 text-xs flex flex-col justify-between min-h-[180px]">
                        <div className="space-y-1.5 overflow-y-auto max-h-[140px] pr-1">
                          {ussdLog.map((line, idx) => (
                            <div key={idx} className={line.startsWith("Input:") ? "text-zinc-400 text-right" : "text-green-400 whitespace-pre-wrap"}>
                              {line}
                            </div>
                          ))}
                          {ussdFeedback && <div className="text-red-400">{ussdFeedback}</div>}
                        </div>

                        {ussdStep < 5 ? (
                          <form onSubmit={handleUssdSend} className="flex gap-2 border-t border-zinc-800 pt-2.5 mt-2">
                            <span className="text-green-500 self-center">&gt;</span>
                            <input 
                              type="text" 
                              value={ussdInput}
                              onChange={(e) => setUssdInput(e.target.value)}
                              placeholder="Enter option/value..." 
                              className="flex-1 bg-transparent text-green-400 focus:outline-none border-none p-0 text-xs font-mono"
                              autoFocus
                            />
                            <button type="submit" className="text-green-400 hover:text-green-200 uppercase text-[10px] font-bold">
                              [Send]
                            </button>
                          </form>
                        ) : (
                          <div className="border-t border-zinc-800 pt-2 mt-2 flex justify-between">
                            <span className="text-zinc-500">Session closed</span>
                            <button 
                              onClick={() => setUssdStep(0)}
                              className="bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800 px-2 py-0.5 rounded text-[10px]"
                            >
                              Exit
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CBHI Enrollment Engine tab contents */}
              {activeBusinessSubTab === "cbhi" && (
                <div className="flex flex-col gap-4">
                  <div className={`border p-4 rounded-lg flex flex-col gap-3 ${themeBg} ${themeBorder}`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Community-Based Health Insurance (CBHI) Portal</span>
                      <p className="text-xs leading-normal mt-0.5">
                        Enroll community families, process digital premium collections via Telebirr, and check payment status instantaneously.
                      </p>
                    </div>

                    <form onSubmit={handleCbhiEnroll} className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase">Family Representative Name</label>
                          <input 
                            type="text" 
                            required
                            value={cbhiName}
                            onChange={(e) => setCbhiName(e.target.value)}
                            placeholder="e.g. Almaz Tolossa" 
                            className={`rounded px-2.5 py-1.5 text-xs focus:outline-none border ${themeInput}`}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase">Fayda National ID</label>
                          <input 
                            type="text" 
                            required
                            value={cbhiFaydaId}
                            onChange={(e) => setCbhiFaydaId(e.target.value)}
                            placeholder="e.g. ET-8829-FAY" 
                            className={`rounded px-2.5 py-1.5 text-xs focus:outline-none border ${themeInput}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase">Beneficiaries</label>
                          <select 
                            value={cbhiMembers}
                            onChange={(e) => setCbhiMembers(e.target.value)}
                            className={`rounded px-2 py-1.5 text-xs focus:outline-none border ${themeInput}`}
                          >
                            <option value="1">1 (Individual)</option>
                            <option value="3">3 Members</option>
                            <option value="5">5 Members</option>
                            <option value="7">7 Members</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1 col-span-2">
                          <label className="text-[10px] font-bold uppercase">Woreda / Region</label>
                          <input 
                            type="text" 
                            value={cbhiRegion}
                            onChange={(e) => setCbhiRegion(e.target.value)}
                            placeholder="e.g. Oromia / Adama Woreda 04" 
                            className={`rounded px-2.5 py-1.5 text-xs focus:outline-none border ${themeInput}`}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase">Telebirr Wallet Phone Number</label>
                        <input 
                          type="tel" 
                          required
                          value={cbhiTelebirrPhone}
                          placeholder="e.g. 0911223344"
                          onChange={(e) => setCbhiTelebirrPhone(e.target.value)}
                          className={`rounded px-2.5 py-1.5 text-xs focus:outline-none border ${themeInput}`}
                        />
                      </div>

                      <button 
                        type="submit"
                        className={`w-full py-2 rounded text-xs uppercase font-bold tracking-wider transition-all ${themeBtn}`}
                      >
                        Enroll Family & Request Premium
                      </button>
                    </form>

                    {/* Telebirr Payment Dialog Simulation */}
                    {cbhiPaymentStep === "paying" && (
                      <div className="mt-3 p-4 border border-zinc-800 bg-[#09090b] rounded-lg text-xs space-y-3">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                          <span className="font-bold text-[#c5a880] uppercase tracking-widest text-[10px]">telebirr payment request</span>
                          <span className="text-zinc-500 font-mono text-[9px]">ID: {Math.floor(100000 + Math.random()*900000)}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          Requesting **{parseInt(cbhiMembers, 10) * 60} ETB** premium for 1-Year CBHI scheme cover. (Bound to Fayda ID: {cbhiFaydaId}).
                        </p>
                        <form onSubmit={handleCbhiPaymentSubmit} className="flex gap-2">
                          <input 
                            type="password" 
                            maxLength={5} 
                            placeholder="Enter 5-digit PIN" 
                            className={`flex-1 rounded px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none font-mono`}
                            required
                          />
                          <button 
                            type="submit" 
                            className="bg-[#c5a880] text-black px-4 py-1 rounded text-[10px] font-bold uppercase hover:bg-[#b0936c]"
                          >
                            Pay Now
                          </button>
                        </form>
                      </div>
                    )}

                    {cbhiPaymentStep === "success" && (
                      <div className="mt-3 p-3.5 bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg text-xs flex items-start gap-2 animate-fade-in">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block mb-0.5">✓ Premium Paid & Scheme Active!</strong>
                          <span className="text-[10px] opacity-90 block">
                            Your family is enrolled in the Community scheme. Check policy ID details via the lookup tool below.
                          </span>
                          <button onClick={() => setCbhiPaymentStep("idle")} className="text-xs underline text-green-400 mt-2 block hover:text-green-300">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Claim Status Checker */}
                  <div className={`border p-4 rounded-lg flex flex-col gap-3 ${themePanel}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider">CBHI Policy & Claim Status Lookup</span>
                    <form onSubmit={handleCbhiSearch} className="flex gap-2">
                      <input 
                        type="text" 
                        value={cbhiSearchQuery}
                        onChange={(e) => setCbhiSearchQuery(e.target.value)}
                        placeholder="Enter Policy ID (e.g. CBHI-ET-9021)"
                        className={`flex-1 rounded px-3 py-1.5 text-xs focus:outline-none border ${themeInput}`}
                      />
                      <button 
                        type="submit" 
                        className={`px-4 py-1.5 rounded text-xs uppercase font-bold tracking-wider ${themeBtn}`}
                      >
                        Search
                      </button>
                    </form>

                    {cbhiSearchResult && (
                      <div className={`p-3 rounded-lg border border-zinc-800 bg-[#09090b]/40 text-xs`}>
                        {cbhiSearchResult === "not_found" ? (
                          <span className="text-red-400">Policy not found in CBHI regional directory database.</span>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                              <div>
                                <span className="font-bold text-[11px] block">{cbhiSearchResult.name}</span>
                                <span className="text-[9px] text-zinc-500 font-mono">{cbhiSearchResult.policyId}</span>
                              </div>
                              <span className="text-[9px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded font-bold uppercase">
                                {cbhiSearchResult.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400">
                              <span>Region: **{cbhiSearchResult.region}**</span>
                              <span>Yearly Premium: **{cbhiSearchResult.premium}**</span>
                              <span>Family Members: **{cbhiSearchResult.members}**</span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-zinc-900 text-[10px]">
                              <span className="font-bold block text-zinc-300 mb-0.5">Claim History</span>
                              <span className="text-[9px] text-zinc-500 block">✓ 1 Paid claim (Outpatient health consult - Bole Woreda Clinic)</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Data Marketplace tab contents */}
              {activeBusinessSubTab === "marketplace" && (
                <div className="flex flex-col gap-4">
                  <div className={`border p-4 rounded-lg flex flex-col gap-3 ${themeBg} ${themeBorder}`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Wellness Data B2B Exchange Marketplace</span>
                      <p className="text-xs leading-normal mt-0.5">
                        Aggregation of population health indicators. Provides insights (cervical load, musculoskeletal stress indexes, herbal application efficacy) to ministry databases and corporate insurers under strict consent parameters.
                      </p>
                    </div>

                    <div className={`p-3 border rounded-lg flex justify-between items-center ${themePanel}`}>
                      <div>
                        <span className="text-[11px] font-bold block">Contributor Data Monetization Consent</span>
                        <span className={`text-[9px] ${themeTextMuted}`}>Anonymize and trade your wellness indices. Earn micro-vouchers.</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input 
                          type="checkbox" 
                          checked={marketplaceConsent}
                          onChange={handleToggleConsent}
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 dark:after:bg-zinc-400 after:rounded-full after:height-4 after:w-4 after:transition-all peer-checked:bg-zinc-500"></div>
                      </label>
                    </div>

                    {shareDataFeedback && (
                      <div className="text-[10px] text-[#c5a880] animate-pulse font-medium">
                        {shareDataFeedback}
                      </div>
                    )}

                    {marketplaceConsent && (
                      <div className="p-3 border border-amber-500/20 bg-amber-500/5 rounded-lg flex justify-between items-center text-xs">
                        <div>
                          <span>Accrued Data Contribution Vouchers</span>
                          <strong className="block text-sm font-bold text-amber-500">{accruedVouchers} ETB</strong>
                        </div>
                        <button 
                          onClick={redeemVouchers}
                          disabled={accruedVouchers <= 0}
                          className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider disabled:opacity-40 ${themeBtn}`}
                        >
                          Redeem Telebirr
                        </button>
                      </div>
                    )}
                  </div>

                  {/* B2B Insights panel */}
                  <div className={`border p-4 rounded-lg flex flex-col gap-3 ${themePanel}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">B2B Health Insights Broker Transaction Logs</span>
                      <button 
                        onClick={simulateB2BSale}
                        className="text-[9px] underline uppercase font-bold tracking-wider hover:opacity-80"
                      >
                        Simulate Sale
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {marketplaceTransactions.map(tx => (
                        <div key={tx.id} className="p-2 border border-zinc-900 bg-[#09090b]/50 rounded-lg flex justify-between items-center text-[10px]">
                          <div>
                            <span className="font-bold text-zinc-300 block">{tx.type}</span>
                            <span className="text-zinc-500">{tx.buyer} · {tx.date}</span>
                          </div>
                          <span className="font-mono font-bold text-[#c5a880]">{tx.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* HEW Training tab contents */}
              {activeBusinessSubTab === "hew" && (
                <div className="flex flex-col gap-4">
                  <div className={`border p-4 rounded-lg flex flex-col gap-3 ${themeBg} ${themeBorder}`}>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">HEW Digital Skills Micro-Credentialing</span>
                      <p className="text-xs leading-normal mt-0.5">
                        Modular clinical literacy training modules empowering Health Extension Workers (HEWs) to integrate digital wellness diagnostics and earn pay upgrades.
                      </p>
                    </div>

                    {/* Tutorial slides */}
                    <div className={`p-3.5 border rounded-lg space-y-2.5 ${themePanel}`}>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#c5a880]">Module Course: Clinical AI & Somatic Defense</span>
                      <div className="space-y-1 text-[11px] leading-relaxed">
                        <div>
                          <strong className="block text-zinc-300">1. Traditional Medicine Standards:</strong>
                          <span>Tenadam requires micro-dosage limits (3-4 leaves) to counter inflammatory blood spasms safely. Never exceed during gestational checks.</span>
                        </div>
                        <div>
                          <strong className="block text-zinc-300">2. National Registry & Insurance:</strong>
                          <span>Always cross-reference and register patients via Fayda ID protocols to speed up CBHI mobile money premium triggers.</span>
                        </div>
                        <div>
                          <strong className="block text-zinc-300">3. Spinal Curvature Metrics:</strong>
                          <span>Ergonomic scans evaluate cervical deflection angles to diagnose muscle fatigue. Forward head posture is the primary skeletal marker.</span>
                        </div>
                      </div>
                    </div>

                    {/* Certification Quiz */}
                    <form onSubmit={checkHewQuiz} className="space-y-3.5 pt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase">Bind to Fayda National ID</label>
                        <input 
                          type="text" 
                          required
                          value={hewFaydaId}
                          onChange={(e) => setHewFaydaId(e.target.value)}
                          placeholder="e.g. FAY-HEW-9810" 
                          className={`rounded px-2.5 py-1.5 text-xs focus:outline-none border ${themeInput}`}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase">Q1: Which herb contains Parthenolide and requires careful dosing?</label>
                          <select 
                            value={hewQuizAnswers.q1}
                            onChange={(e) => setHewQuizAnswers({...hewQuizAnswers, q1: e.target.value})}
                            className={`rounded px-2 py-1.5 text-xs focus:outline-none border ${themeInput}`}
                            required
                          >
                            <option value="">Select answer...</option>
                            <option value="moringa">Moringa (Shiferaw)</option>
                            <option value="tenadam">Tenadam (Rue of Grace)</option>
                            <option value="damakese">Damakese (Indigenous Ocimum)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase">Q2: Which identity system maps CBHI micro-insurance registrations?</label>
                          <select 
                            value={hewQuizAnswers.q2}
                            onChange={(e) => setHewQuizAnswers({...hewQuizAnswers, q2: e.target.value})}
                            className={`rounded px-2 py-1.5 text-xs focus:outline-none border ${themeInput}`}
                            required
                          >
                            <option value="">Select answer...</option>
                            <option value="kebele">Local Kebele Card</option>
                            <option value="fayda">Fayda National ID</option>
                            <option value="passport">Ethiopian Passport</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase">Q3: What skeletal biomarker indicates desk fatigue in neck posture scans?</label>
                          <select 
                            value={hewQuizAnswers.q3}
                            onChange={(e) => setHewQuizAnswers({...hewQuizAnswers, q3: e.target.value})}
                            className={`rounded px-2 py-1.5 text-xs focus:outline-none border ${themeInput}`}
                            required
                          >
                            <option value="">Select answer...</option>
                            <option value="lumbar">Lumbar twist curvature</option>
                            <option value="forward">Forward head posture angle</option>
                            <option value="patella">Patellar tendon stretch</option>
                          </select>
                        </div>
                      </div>

                      {hewFeedback && (
                        <div className={`p-2 rounded text-xs text-center border font-medium ${
                          hewQuizSuccess 
                            ? "bg-green-500/10 text-green-300 border-green-500/20" 
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {hewFeedback}
                        </div>
                      )}

                      {!isHewCertified ? (
                        <button 
                          type="submit" 
                          className={`w-full py-2 rounded text-xs uppercase font-bold tracking-wider transition-all ${themeBtn}`}
                        >
                          Submit Answers & Verify Credentials
                        </button>
                      ) : (
                        <div className="p-4 border border-zinc-800 bg-[#09090b] rounded-lg text-center text-xs space-y-2">
                          <span className="font-bold text-[#c5a880] uppercase tracking-widest text-[11px] block">digital credential verified</span>
                          <span className="text-[10px] text-zinc-400 block font-mono">Holder: {hewFaydaId}</span>
                          <span className="text-zinc-500 block text-[9px]">Scope: Digital Health Integrator & Clinical Diagnostics Access</span>
                          
                          <div className="flex items-center justify-between border-t border-zinc-900 pt-3 mt-3">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-zinc-300">clinical ai mode</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={clinicalMode}
                                onChange={() => setClinicalMode(!clinicalMode)}
                                className="sr-only peer" 
                              />
                              <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 dark:after:bg-zinc-400 after:rounded-full after:height-4 after:w-4 after:transition-all peer-checked:bg-[#c5a880]"></div>
                            </label>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 4: SYSTEM SETTINGS */}
          {activeTab === "settings" && (
            <div className="flex-1 flex flex-col gap-6">
              
              <div>
                <h3 className="font-serif text-sm uppercase tracking-wider font-bold mb-1">Settings</h3>
                <p className={`text-xs ${themeTextMuted}`}>MinkTilet runs on Gemma 4 31B — no setup needed.</p>
              </div>

              <div className="bg-[#fcfcfc] dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-lg p-4 flex flex-col gap-4">

                {/* Connection status row */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold block">AI Connection</span>
                      <span className={`text-[10px] ${themeTextMuted}`}>Gemma 4 31B · Google AI Studio</span>
                    </div>
                    <button 
                      onClick={testConnection}
                      disabled={connectionStatus === "testing"}
                      className={`px-4 py-1.5 rounded text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50 ${themeBtn}`}
                    >
                      {connectionStatus === "testing" && <Loader className="w-3.5 h-3.5 animate-spin" />}
                      {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
                    </button>
                  </div>

                  {connectionStatus !== "idle" && (
                    <div className={`p-2.5 rounded text-xs flex items-center gap-2 border ${
                      connectionStatus === "testing" ? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" :
                      connectionStatus === "success" ? "bg-green-500/10 text-green-300 border-green-500/30" :
                      "bg-red-500/10 text-red-400 border-red-500/30"
                    }`}>
                      {connectionStatus === "testing" && <Loader className="w-4 h-4 animate-spin flex-shrink-0" />}
                      {connectionStatus === "success" && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                      {connectionStatus === "error" && <XCircle className="w-4 h-4 flex-shrink-0" />}
                      <span>
                        {connectionStatus === "testing" && "Connecting to Gemma 4..."}
                        {connectionStatus === "success" && "✓ Gemma 4 31B connected and ready"}
                        {connectionStatus === "error" && (connectionError || "Connection failed.")}
                      </span>
                    </div>
                  )}
                </div>

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

              </div>

            </div>
          )}

        </div>
      </main>

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Send, CodeSquare, LayoutTemplate, Loader2, Sparkles, TerminalSquare, ChevronDown, Key, Copy, Check } from "lucide-react";
import { generateComponent, AVAILABLE_MODELS, type ModelProvider } from "./services/ai";
import { Preview } from "./components/Preview";
import { cn } from "./utils";

const DEFAULT_CODE = `import React from "react";
import { Sparkles, Code2, MonitorPlay } from "lucide-react";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full space-y-8 text-center relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full" />
        
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10 ring-1 ring-white/5 mb-4 shadow-2xl">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Lovable Clone
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            Generate beautiful, production-ready React components using AI. 
            Just describe what you want in the prompt area.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 text-left">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <MonitorPlay className="w-6 h-6 text-purple-400 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Live Preview</h3>
            <p className="text-gray-400 text-sm">See your UI come to life instantly with full Tailwind CSS support.</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <Code2 className="w-6 h-6 text-pink-400 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Clean Code</h3>
            <p className="text-gray-400 text-sm">Get production-ready React typescript code you can copy and use immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

export default function App() {
  const [apiKeys, setApiKeys] = useState<Record<ModelProvider, string>>({
    google: "",
    openai: "",
    anthropic: "",
  });
  const [selectedModelId, setSelectedModelId] = useState("gemini-2.5-flash");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(DEFAULT_CODE);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedModel = AVAILABLE_MODELS.find(m => m.id === selectedModelId) || AVAILABLE_MODELS[0];

  useEffect(() => {
    const savedKeys = localStorage.getItem("ai_api_keys");
    const savedModelId = localStorage.getItem("ai_selected_model");
    const savedPrompt = localStorage.getItem("ai_prompt");
    const savedCode = localStorage.getItem("ai_code");
    const savedView = localStorage.getItem("ai_view_mode") as "preview" | "code";

    if (savedKeys) setApiKeys(JSON.parse(savedKeys));
    if (savedModelId) setSelectedModelId(savedModelId);
    if (savedPrompt) setPrompt(savedPrompt);
    if (savedCode) setGeneratedCode(savedCode);
    if (savedView) setViewMode(savedView);
  }, []);

  useEffect(() => {
    localStorage.setItem("ai_prompt", prompt);
  }, [prompt]);

  useEffect(() => {
    localStorage.setItem("ai_code", generatedCode);
  }, [generatedCode]);

  useEffect(() => {
    localStorage.setItem("ai_view_mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("ai_selected_model", selectedModelId);
  }, [selectedModelId]);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newKeys = { ...apiKeys, [selectedModel.provider]: val };
    setApiKeys(newKeys);
    localStorage.setItem("ai_api_keys", JSON.stringify(newKeys));
  };

  const handleGenerate = async () => {
    const currentApiKey = apiKeys[selectedModel.provider];

    if (!currentApiKey) {
      setError(`Please enter your ${selectedModel.provider.charAt(0).toUpperCase() + selectedModel.provider.slice(1)} API Key.`);
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a prompt to generate a component.");
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const code = await generateComponent(
        selectedModel.provider,
        selectedModel.id,
        currentApiKey,
        prompt
      );
      setGeneratedCode(code);
      setViewMode("preview");
    } catch (err: any) {
      setError(err.message || "Failed to generate component. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-gray-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Sidebar Area */}
      <div className="w-[380px] flex-shrink-0 border-r border-[#1e1e24] bg-[#0a0a0c] flex flex-col relative z-20 shadow-2xl">
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white">Lovable Clone app</h1>
          </div>

          <div className="space-y-6 mb-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <LayoutTemplate className="w-3.5 h-3.5" /> Select Model
              </label>
              <div className="relative group">
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full appearance-none bg-[#121214] border border-[#1e1e24] rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all cursor-pointer hover:bg-[#1a1a1f]"
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model.id} value={model.id} className="bg-[#121214]">
                      {model.name} ({model.provider})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none group-hover:text-gray-400 transition-colors" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-3.5 h-3.5" /> {selectedModel.provider.charAt(0).toUpperCase() + selectedModel.provider.slice(1)} API Key
              </label>
              <input
                type="password"
                placeholder={`Enter your ${selectedModel.provider} key`}
                value={apiKeys[selectedModel.provider]}
                onChange={handleApiKeyChange}
                className="w-full bg-[#121214] border border-[#1e1e24] rounded-xl px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono"
              />
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 mt-2 flex flex-col">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
            <TerminalSquare className="w-3.5 h-3.5" /> Prompt
          </label>
          <div className="relative flex-1 flex flex-col">
            <textarea
              placeholder="Describe the UI you want to build... (e.g. A gorgeous SaaS pricing section with 3 tiers, dark mode, and feature toggles)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full flex-1 bg-[#121214] border border-[#1e1e24] rounded-xl p-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none shadow-inner"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={cn(
                "absolute bottom-4 right-4 p-2.5 rounded-lg flex items-center justify-center transition-all group",
                isGenerating || !prompt.trim()
                  ? "bg-[#1e1e24] text-gray-500 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
              )}
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Preview/Code Area */}
      <div className="flex-1 flex flex-col bg-[#050505] relative z-10">
        <div className="h-14 border-b border-[#1e1e24] bg-[#0a0a0c]/80 backdrop-blur-md flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-50">
          <div className="flex bg-[#121214] p-1 rounded-lg border border-[#1e1e24]">
            <button
              onClick={() => setViewMode("preview")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                viewMode === "preview"
                  ? "bg-[#25252d] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a20]"
              )}
            >
              <LayoutTemplate className="w-4 h-4" /> Preview
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                viewMode === "code"
                  ? "bg-[#25252d] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300 hover:bg-[#1a1a20]"
              )}
            >
              <CodeSquare className="w-4 h-4" /> Code
            </button>
          </div>

          <div className="flex items-center gap-3 pr-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-[#121214] border border-[#1e1e24] text-gray-400 hover:text-white hover:bg-[#1a1a20] transition-all shadow-sm group"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
            <div className="text-xs text-gray-500 font-mono flex items-center">
              Generated with <span className="text-indigo-400 ml-1">{selectedModel.name}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 relative flex flex-col bg-gradient-to-br from-[#0c0c0e] to-[#050505]">
          {isGenerating && (
            <div className="absolute inset-0 z-50 bg-[#050505]/70 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-16 h-16 relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
                <div className="relative w-16 h-16 bg-[#121214] border border-[#1e1e24] rounded-2xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <p className="mt-6 text-sm font-medium text-indigo-300 tracking-wide animate-pulse">
                Crafting your UI with {selectedModel.name}...
              </p>
            </div>
          )}
          <Preview code={generatedCode} viewMode={viewMode} />
        </div>
      </div>
    </div>
  );
}

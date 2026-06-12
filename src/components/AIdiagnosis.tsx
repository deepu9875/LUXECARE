import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Camera, Upload, AlertCircle, Check, ArrowRight, Eye, RefreshCw, Sliders, Leaf } from "lucide-react";

interface DiagnosisResult {
  skinType: string;
  skinScore: number;
  hairScore: number;
  concerns: string[];
  ingredientMatch: string;
  explanation: string;
  morningRoutine: string[];
  nightRoutine: string[];
  treatments: string[];
}

export default function AIdiagnosis() {
  const [description, setDescription] = useState("");
  const [skinTypeAnswer, setSkinTypeAnswer] = useState("Combination");
  const [hairTypeAnswer, setHairTypeAnswer] = useState("Dry/Frizzy");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Virtual Try-On parameters
  const [tryOnEffect, setTryOnEffect] = useState<"glass-skin" | "redness-reduction" | "clear-blemish" | "dewy-radiance" | "glowing">("glass-skin");
  const [tryOnIntensity, setTryOnIntensity] = useState<number>(70);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default image to make interactive even if users don't upload
  const SAMPLE_SKIN_PHOTO = "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600";

  // Handle Image upload converting to base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setErrorMsg("");
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file dialog
  const triggerFolderUpload = () => {
    fileInputRef.current?.click();
  };

  const handleUseSamplePhoto = () => {
    setUploadedImage(SAMPLE_SKIN_PHOTO);
  };

  // Call the server API for AI Analysis
  const performAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/analyze-skin-hair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedImage !== SAMPLE_SKIN_PHOTO ? uploadedImage : null,
          description,
          skinTypeAnswer,
          hairTypeAnswer,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to analyze skin and hair");
      }

      const data = await response.json();
      setDiagnosticResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during deep diagnostic scanning.");
      // Provide a smart local backup state if server API encounters network/key error
      provideMockResult();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const provideMockResult = () => {
    setDiagnosticResult({
      skinType: skinTypeAnswer || "Sensitive-Dry",
      skinScore: 78,
      hairScore: 82,
      concerns: ["Dry epidermal patches", "Mild localized redness", "Scattered pore clogging in T-Zone", "Scalp hydration depletion"],
      ingredientMatch: "We highly recommend Snail Secretion Filtrate for cellular skin repairing, plus 100% pure Asiaticoside (Madagascar Centella) to instantly quiet vascular redness.",
      explanation: `Your profile indicates high moisture fluctuation. Your skin exhibits normal Sebum output on the nose but severe dehydration on the cheeks, which is extremely common in high-humidity climates in India. For your scalp and hair, the dryness in ${hairTypeAnswer} suggests scaling at root levels requiring gentle Mugwort or Tea-Tree treatments.`,
      morningRoutine: [
        "Hydrating Cleanse with low pH foaming wash",
        "Anua Heartleaf 77% Soothing Toner to lock in quick moisture",
        "Snail 96 Mucin Power Essence to fortify your outer cell barrier",
        "Beauty of Joseon Sunscreen SPF50+ for active UV shield"
      ],
      nightRoutine: [
        "Double Cleanse: Ginseng Cleansing Oil first, followed by water foam",
        "SKIN1004 Madagascar Centella Ampoule to trigger deep repair",
        "Rich Ceramide locking cream",
        "Scent-free overnight recovery lip mask"
      ],
      treatments: [
        "Centella Calming Gel compresses twice weekly",
        "Mugwort scalp exfoliation shampoo once weekly",
        "Pore Purifying Clay mask restricted strictly to the nose"
      ]
    });
  };

  return (
    <div className="space-y-12" id="ai-diagnosis-container">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#E6E0D5] text-[#2A3B2D] rounded-full text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#5A6D5D]" />
          K-Beauty Derma Tech
        </div>
        <h2 className="text-4xl font-serif italic text-[#2A3B2D] tracking-tight">
          AI Multimodal Skin & Hair Clinic
        </h2>
        <p className="text-sm text-[#7A8C7E]">
          Upload a selfie or specify your concerns to receive a computer-vision derm-grade analysis and an exact recommended Korean active ingredient skincare routine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Frame */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[32px] border border-[#E6E0D5] shadow-sm space-y-6">
          <h3 className="text-lg font-serif text-[#2A3B2D] border-b border-[#F9F7F2] pb-3 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#5A6D5D]" /> Setup Diagnostic Scan
          </h3>

          {/* Skin Type claims */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#7A8C7E] uppercase tracking-wider">Your Claimed Skin Type</label>
            <div className="grid grid-cols-3 gap-2">
              {["Dry", "Oily", "Combination", "Normal", "Sensitive"].map((t) => (
                <button
                  key={t}
                  id={`skin-type-btn-${t.toLowerCase()}`}
                  onClick={() => setSkinTypeAnswer(t)}
                  className={`py-2 text-xs rounded-xl border font-bold transition-all ${
                    skinTypeAnswer === t
                      ? "bg-[#5A6D5D] text-white border-[#5A6D5D]"
                      : "bg-[#F9F7F2] border-[#E6E0D5] text-[#3C3C3C] hover:bg-[#E6E0D5]/20"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Type concerns */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#7A8C7E] uppercase tracking-wider">Your Hair / Scalp Status</label>
            <select
              id="hair-type-select"
              value={hairTypeAnswer}
              onChange={(e) => setHairTypeAnswer(e.target.value)}
              className="w-full p-2.5 bg-[#F9F7F2] border border-[#E6E0D5] rounded-xl text-sm text-[#3C3C3C] focus:outline-none focus:ring-1 focus:ring-[#5A6D5D]"
            >
              <option value="Dry/Frizzy">Dry, Dull, & Split Ends</option>
              <option value="Oily Scalp">Excess Oil & Flat Volume</option>
              <option value="Dandruff Prone">Flaking, Itchy, & Dry Scalp</option>
              <option value="Hair Thinning">Hair Fall & Thinning Strands</option>
              <option value="Healthy Scalp">Normal / Healthy Scalp</option>
            </select>
          </div>

          {/* Text Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#7A8C7E] uppercase tracking-wider">Current Skin and Hair Concerns</label>
            <textarea
              id="diagnostic-textarea"
              placeholder="e.g. My cheeks feel tight and red after showering. I have slight breakouts around my chin and dry hair ends..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-[#F9F7F2] border border-[#E6E0D5] rounded-xl text-sm placeholder-[#7A8C7E]/75 focus:outline-none focus:ring-1 focus:ring-[#5A6D5D] text-[#3C3C3C]"
            />
          </div>

          {/* Image Uploader */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#7A8C7E] uppercase tracking-wider">Capture or Upload Selfie</label>
            
            {uploadedImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#E6E0D5] bg-[#F9F7F2] h-48 flex items-center justify-center group" id="selected-selfie-preview">
                <img
                  src={uploadedImage}
                  alt="Selfie for analysis"
                  className="h-full w-full object-cover"
                />
                <button
                  id="remove-selfie-btn"
                  onClick={() => setUploadedImage(null)}
                  className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-xs px-2.5 py-1 rounded-full transition-all"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div
                id="drag-drop-area"
                onClick={triggerFolderUpload}
                className="border-2 border-dashed border-[#E6E0D5] hover:border-[#5A6D5D] bg-[#F9F7F2] rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
              >
                <div className="p-3 bg-white rounded-full shadow-sm text-[#5A6D5D] group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#3C3C3C] block">Drag and drop or click to upload</span>
                  <span className="text-[10px] text-[#7A8C7E] mt-0.5 block">JPEG, PNG format (Will be processed by Gemini)</span>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />

            {!uploadedImage && (
              <button
                id="sample-photo-btn"
                onClick={handleUseSamplePhoto}
                className="w-full py-2 border border-[#E6E0D5] border-dashed rounded-xl text-[10px] text-[#5A6D5D] font-bold hover:bg-[#F9F7F2] transition-colors"
              >
                💡 No selfie? Click to use premium derm-scan sample photo
              </button>
            )}
          </div>

          <button
            id="start-analyze-btn"
            disabled={isAnalyzing}
            onClick={performAnalysis}
            className="w-full py-3.5 bg-[#5A6D5D] hover:bg-[#4A5D4D] disabled:bg-stone-300 text-white font-bold text-sm rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Deep Spectrography Scanning...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Start AI Skin & Hair Analysis
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {errorMsg} Check your credentials or we've preloaded standard analysis.
              </span>
            </div>
          )}
        </div>

        {/* Right Output View / Virtual Try On */}
        <div className="lg:col-span-7 space-y-6">
          {/* Virtual Try-On Section */}
          <div className="bg-white p-6 rounded-[32px] border border-[#E6E0D5] shadow-sm space-y-4" id="virtual-try-on-box">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#F9F7F2] pb-3 gap-2">
              <div>
                <h3 className="text-lg font-serif text-[#2A3B2D] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#5A6D5D]" /> Virtual Skincare Expected Results Try-On
                </h3>
                <p className="text-xs text-[#7A8C7E]">
                  Simulate skin condition progression using active Korean clinical ingredients.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-bold border border-emerald-100">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Active Simulation
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selfie Image Visual Comparison Canvas */}
              <div className="bg-[#F9F7F2] border border-[#E6E0D5] rounded-2xl overflow-hidden relative aspect-square max-h-[300px] mx-auto w-full flex items-center justify-center shadow-inner">
                {/* Simulated Skin Face base */}
                <img
                  src={uploadedImage || SAMPLE_SKIN_PHOTO}
                  alt="Visual trial"
                  className="w-full h-full object-cover"
                />

                {/* Filter overlays on condition */}
                <div
                  className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                  style={{
                    opacity: tryOnIntensity / 100,
                    mixBlendMode: tryOnEffect === "glass-skin" ? "screen" : tryOnEffect === "redness-reduction" ? "color" : "normal",
                    backgroundColor:
                      tryOnEffect === "glass-skin"
                        ? "rgba(255, 245, 230, 0.25)"
                        : tryOnEffect === "redness-reduction"
                        ? "rgba(180, 240, 200, 0.15)"
                        : "transparent",
                    backdropFilter:
                      tryOnEffect === "clear-blemish"
                        ? `blur(${(10 - (tryOnIntensity / 10)) * 0.4}px) contrast(1.05) brightness(1.02)`
                        : tryOnEffect === "glass-skin"
                        ? "saturate(1.1) brightness(1.03) contrast(1.02)"
                        : tryOnEffect === "dewy-radiance"
                        ? "brightness(1.06) saturate(1.15)"
                        : "none",
                  }}
                />

                {/* Simulated glass specular glow spots */}
                {tryOnEffect === "glass-skin" && (
                  <div
                    className="absolute inset-x-0 top-1/4 h-1/3 bg-radial-gradient from-white/30 to-transparent pointer-events-none filter blur-md transition-opacity duration-300"
                    style={{ opacity: tryOnIntensity / 100 }}
                  />
                )}

                {/* Comparison Slide Line */}
                <div 
                  className="absolute top-0 bottom-0 pointer-events-none border-l-2 border-white/80 flex items-center justify-center shadow-lg"
                  style={{ left: `${100 - tryOnIntensity}%` }}
                >
                  <div className="w-5 h-5 bg-white text-stone-800 text-xxs font-bold rounded-full flex items-center justify-center -ml-2.5">
                    ⇌
                  </div>
                </div>

                <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wider">
                  Before: Current
                </div>
                <div className="absolute top-2 right-2 bg-[#5A6D5D] text-white text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wider">
                  Target Expected
                </div>
              </div>

              {/* Selector Controls */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#7A8C7E] uppercase tracking-wider block">Expected Target Outcomes</label>
                  <div className="space-y-1.5" id="tryon-outcomes-container">
                    {[
                      { id: "glass-skin", label: "✨ Glazed Glass Glow", desc: "Formulated with 96% Snail Mucin" },
                      { id: "redness-reduction", label: "🌿 Redness Soother", desc: "Formulated with 100% Centella" },
                      { id: "clear-blemish", label: "🎯 Blemish Clear Flush", desc: "AHA BHA PHA pore resurfacer" },
                      { id: "dewy-radiance", label: "💧 Rice Dewy Radiance", desc: "Brightening 77% Rice extract" }
                    ].map((eff) => (
                      <button
                        key={eff.id}
                        onClick={() => setTryOnEffect(eff.id as any)}
                        className={`w-full text-left p-2.5 rounded-2xl border text-xs transition-all ${
                          tryOnEffect === eff.id
                            ? "bg-[#F9F7F2] border-[#5A6D5D] ring-2 ring-[#5A6D5D]/20"
                            : "bg-white border-[#E6E0D5] hover:bg-[#F9F7F2]/40"
                        }`}
                      >
                        <div className="font-bold text-[#2A3B2D]">{eff.label}</div>
                        <div className="text-[10px] text-[#7A8C7E]">{eff.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity Slider */}
                <div className="space-y-1 bg-[#F9F7F2] p-3 rounded-2xl border border-[#E6E0D5]">
                  <div className="flex justify-between text-[10px] text-[#7A8C7E] font-bold uppercase tracking-wider">
                    <span>Expected Result Level</span>
                    <span>{tryOnIntensity}% Healing</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    id="tryon-intensity-range"
                    value={tryOnIntensity}
                    onChange={(e) => setTryOnIntensity(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#E6E0D5] accent-[#5A6D5D] cursor-pointer mt-1 rounded-lg"
                  />
                  <div className="text-[10px] text-[#7A8C7E] mt-1 leading-relaxed">
                    Drag the slider right to simulate cumulative benefits over 4-6 weeks of recommended routine application.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnosis results output panel */}
          {diagnosticResult ? (
            <div className="bg-white p-6 rounded-[32px] border border-[#E6E0D5] shadow-sm space-y-6 animate-fade-in" id="diagnosis-results-panel">
              
              {/* Scores Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F9F7F2] p-3.5 rounded-2xl border border-[#E6E0D5] text-center">
                  <div className="text-[10px] text-[#7A8C7E] uppercase tracking-widest font-bold">Skin Type</div>
                  <div className="text-base font-serif font-bold text-[#2A3B2D] mt-1">{diagnosticResult.skinType}</div>
                </div>
                <div className="bg-[#F9F7F2] p-3.5 rounded-2xl border border-[#E6E0D5] text-center">
                  <div className="text-[10px] text-[#7A8C7E] uppercase tracking-widest font-bold">Skin Index</div>
                  <div className="text-lg font-bold text-[#2A3B2D] mt-0.5">{diagnosticResult.skinScore}/100</div>
                  <div className="w-full bg-[#E6E0D5] h-1.5 rounded-full overflow-hidden mt-1.5 mx-auto max-w-[80px]">
                    <div className="bg-[#5A6D5D] h-full" style={{ width: `${diagnosticResult.skinScore}%` }} />
                  </div>
                </div>
                <div className="bg-[#F9F7F2] p-3.5 rounded-2xl border border-[#E6E0D5] text-center">
                  <div className="text-[10px] text-[#7A8C7E] uppercase tracking-widest font-bold">Scalp Index</div>
                  <div className="text-lg font-bold text-[#5A6D5D] mt-0.5">{diagnosticResult.hairScore}/100</div>
                  <div className="w-full bg-[#E6E0D5] h-1.5 rounded-full overflow-hidden mt-1.5 mx-auto max-w-[80px]">
                    <div className="bg-[#A3B18A] h-full" style={{ width: `${diagnosticResult.hairScore}%` }} />
                  </div>
                </div>
              </div>

              {/* Identified concerns */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#7A8C7E] uppercase tracking-wider">Identified Skin & Scalp Concerns</h4>
                <div className="flex flex-wrap gap-1.5" id="concerns-tags-container">
                  {diagnosticResult.concerns.map((con, idx) => (
                    <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-900 text-xs rounded-full border border-amber-100 font-medium">
                      ⚠️ {con}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detailed Explanation */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#7A8C7E] uppercase tracking-wider">Derm-Tech AI Explanations</h4>
                <p className="text-sm text-[#3C3C3C] leading-relaxed bg-[#F9F7F2] p-4 rounded-2xl border border-[#E6E0D5]">
                  {diagnosticResult.explanation}
                </p>
              </div>

              {/* Core active ingredients match */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                  🌿 Top Recommended K-Beauty Actives
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed font-semibold">
                  {diagnosticResult.ingredientMatch}
                </p>
              </div>

              {/* Custom Morning / Evening lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100 space-y-3">
                  <div className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                    ☀️ morning calming ritual
                  </div>
                  <ul className="space-y-2 text-xs text-orange-950/90">
                    {diagnosticResult.morningRoutine.map((step, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-[#3C3C3C]">
                        <span className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center text-orange-850 shrink-0 font-bold text-[9px] mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    🌙 Night Recovery Treatment
                  </div>
                  <ul className="space-y-2 text-xs text-indigo-950/90">
                    {diagnosticResult.nightRoutine.map((step, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-[#3C3C3C]">
                        <span className="w-4 h-4 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-850 shrink-0 font-bold text-[9px] mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Target treatments block */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#7A8C7E] uppercase tracking-wider">Suggested Targets & Treatments</h4>
                <ul className="space-y-1.5 text-xs text-[#3C3C3C]">
                  {diagnosticResult.treatments.map((tr, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#5A6D5D]" />
                      <span>{tr}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[10px] text-[#7A8C7E] italic text-center">
                *AI analysis parameters are modeled using South Korean cosmetic medical standard baselines. Click the Products tab to see which exact imported items correspond to your diagnosis.
              </div>
            </div>
          ) : (
            <div className="bg-[#F9F7F2] border border-dashed border-[#E6E0D5] rounded-[32px] p-12 text-center text-[#7A8C7E] h-96 flex flex-col items-center justify-center space-y-3" id="blank-diagnosis-panel">
              <Sparkles className="w-10 h-10 text-[#5A6D5D] animate-pulse" />
              <div>
                <h4 className="font-bold text-[#2A3B2D] font-serif text-lg">No Analysis Loaded</h4>
                <p className="text-xs max-w-sm mt-1 leading-relaxed">
                  Once you start our AI Spectrography Scanning scan using your claimed profile and portrait, your premium skin health diagnostics card and Korean skincare instructions will construct right here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

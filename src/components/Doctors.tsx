import React, { useState } from "react";
import { INITIAL_DOCTORS, Doctor, CurrencyUnit } from "../data/skincareData";
import { Star, Video, MapPin, Calendar, CheckCircle2, PhoneCall, Link2, Search, ArrowRight, User, Stethoscope, X } from "lucide-react";

interface DoctorsProps {
  activeCurrency?: CurrencyUnit;
  formatCurrency?: (val: number) => string;
  showToast?: (message: string, type?: "success" | "info" | "error") => void;
}

export default function Doctors({
  activeCurrency = { code: "INR", symbol: "₹", rateToINR: 1.0 },
  formatCurrency = (val: number) => `₹${val.toLocaleString()}`,
  showToast = () => {}
}: DoctorsProps) {
  const [selectedSpec, setSelectedSpec] = useState<string>("All");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // States to simulate booking flow
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);
  const [userConsultationNote, setUserConsultationNote] = useState("");
  
  // States to simulate active online video session
  const [activeVideoSession, setActiveVideoSession] = useState<{ doctor: Doctor; active: boolean } | null>(null);
  const [videoChatText, setVideoChatText] = useState("");
  const [videoChatHistory, setVideoChatHistory] = useState<{ sender: "user" | "doctor"; text: string }[]>([
    { sender: "doctor", text: "Hello! Welcome to LUXECARE teleconsultation. What seems to be your primary skin or scalp concern today?" }
  ]);

  // Unique specialty lists
  const specialties = ["All", "Aesthetic K-Beauty", "Glass Skin & Hyperpigmentation", "Scalp Health & Trichology", "Barrier Specialist"];

  // Search input
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDoctors = INITIAL_DOCTORS.filter((doc) => {
    // filter by specialty tags or query
    const matchesSpec =
      selectedSpec === "All" ||
      doc.specialty.toLowerCase().includes(selectedSpec.split(" ")[0].toLowerCase());
    const matchesQuery =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpec && matchesQuery;
  });

  const handleBookSession = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setBookedSlot(doc.nextAvailableSlot);
    setIsBookingModalOpen(true);
  };

  const confirmBooking = () => {
    setIsBookingModalOpen(false);
    // Automatically mock pre-booked slots
    const finalFee = selectedDoctor ? formatCurrency(selectedDoctor.consultationFeeINR) : "";
    showToast(`🎉 Booking Confirmation Details Sent! Your interactive telehealth link with ${selectedDoctor?.name} has been secured for ${bookedSlot}. Consultation Fee: ${finalFee}`, "success");
  };

  const startVideoCallSim = (doc: Doctor) => {
    setActiveVideoSession({ doctor: doc, active: true });
    setVideoChatHistory([
      { sender: "doctor", text: `Annyeonghaseyo! I am ${doc.name}. I'm reviewing your skin parameters and concern: "${userConsultationNote || "Hyperpigmentation & Dehydration"}". Let's get started!` }
    ]);
  };

  const handleSendVideoChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoChatText.trim()) return;
    const newMsg = { sender: "user" as const, text: videoChatText };
    setVideoChatHistory((prev) => [...prev, newMsg]);
    setVideoChatText("");

    // Simulate doctor response
    setTimeout(() => {
      let doctorRep = "Based on that, I suggest you pair a skin-repairing 96% snail filtrate essence with dual niacinamide morning serum, and limit physical scrubbing. Also, use standard lukewarm water for washing.";
      if (activeVideoSession?.doctor.specialty.includes("Scalp")) {
        doctorRep = "With scalp flaking in Indian warm climates, we must soothe yeast scaling first. I recommend an initial chemical tea tree flush alongside a Centella calming serum immediately after cleansing.";
      }
      setVideoChatHistory((prev) => [
        ...prev,
        { sender: "doctor", text: doctorRep }
      ]);
    }, 1200);
  };

  return (
    <div className="space-y-12 animate-fade-in" id="doctors-module">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#E6E0D5] text-[#2A3B2D] rounded-full text-xs font-semibold uppercase tracking-wider">
          <Stethoscope className="w-3.5 h-3.5 text-[#5A6D5D]" />
          Global Tele-Dermatology
        </div>
        <h2 className="text-4xl font-serif italic text-[#2A3B2D] tracking-tight">
          Professional Skincare Consultation
        </h2>
        <p className="text-sm text-[#7A8C7E]">
          Connect with top-tier aesthetic dermatologists from Seoul and our hand-picked partner clinical centers in India. Consult over face-to-face video and receive custom treatment logs.
        </p>
      </div>

      {activeVideoSession?.active ? (
        /* Video Consultation Simulator */
        <div className="bg-stone-900 p-6 rounded-[32px] border border-stone-800 shadow-2xl space-y-6 text-white animate-fade-in" id="telehealth-video-simulator">
          <div className="flex justify-between items-center border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping" />
              <div>
                <span className="text-xs uppercase text-[#A3B18A] font-bold tracking-wider">Live Telehealth consultation</span>
                <h3 className="text-base font-serif">{activeVideoSession.doctor.name} ({activeVideoSession.doctor.specialty})</h3>
              </div>
            </div>
            <button
              id="end-telehealth-btn"
              onClick={() => setActiveVideoSession(null)}
              className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              End Session
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left simulated video screens */}
            <div className="lg:col-span-7 bg-[#1C1917] rounded-2xl overflow-hidden aspect-video relative flex flex-col justify-between border border-stone-800 shadow-inner">
              {/* Main doctor camera stream */}
              <div className="absolute inset-0">
                <img
                  src={activeVideoSession.doctor.imageUrl}
                  alt={activeVideoSession.doctor.name}
                  className="w-full h-full object-cover brightness-95 opacity-80"
                />
                <div className="absolute top-3 left-3 bg-black/60 px-2.5 py-1 rounded text-xxs flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-red-500" /> Remote: {activeVideoSession.doctor.clinicName}
                </div>
              </div>

              {/* Sub portrait: User Camera view */}
              <div className="absolute bottom-3 right-3 w-1/4 aspect-square rounded-lg overflow-hidden border border-white/20 bg-stone-900 shadow-lg">
                <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900/90 text-center p-1">
                  <User className="w-6 h-6 text-stone-400 animate-pulse" />
                  <span className="text-[9px] text-[#A8A29E] mt-1">Your Self-Cam (Active)</span>
                </div>
              </div>

              {/* Control Overlays */}
              <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1.5 rounded-lg text-xxs text-stone-200">
                ⚡ Connection latency: 85ms | Audio: 16kHz Little-Endian PCM Compliant
              </div>
            </div>

            {/* Right live recommendation and clinical prescription chat */}
            <div className="lg:col-span-5 bg-[#1C1A18] rounded-2xl border border-stone-800 p-4 flex flex-col h-[320px] justify-between">
              <div className="overflow-y-auto space-y-3 pb-2 text-stone-250" id="video-chat-log">
                {videoChatHistory.map((chat, idx) => (
                  <div key={idx} className={`flex flex-col ${chat.sender === "user" ? "items-end" : "items-start"}`}>
                    <div className="text-[10px] text-stone-400 font-semibold mb-0.5 px-1">
                      {chat.sender === "user" ? "You" : activeVideoSession.doctor.name}
                    </div>
                    <div
                      className={`max-w-[85%] p-2.5 rounded-2xl text-xs leading-relaxed ${
                        chat.sender === "user"
                          ? "bg-[#5A6D5D] text-white rounded-br-none"
                          : "bg-stone-800 text-stone-200 rounded-bl-none"
                      }`}
                    >
                      {chat.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input for chat */}
              <form onSubmit={handleSendVideoChat} className="flex gap-2 border-t border-stone-800 pt-3">
                <input
                  type="text"
                  placeholder="Ask a quick follow-up question..."
                  value={videoChatText}
                  onChange={(e) => setVideoChatText(e.target.value)}
                  className="flex-1 text-xs bg-stone-850 text-stone-100 placeholder-stone-500 border border-stone-700/50 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#5A6D5D]"
                />
                <button
                  id="send-videochat-btn"
                  type="submit"
                  className="px-4 py-2 bg-[#5A6D5D] hover:bg-[#4A5D4D] rounded-xl text-xs font-semibold text-white cursor-pointer transition-all"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Doctors List Grid & Locator Map */
        <div className="space-y-8 animate-fade-in">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E6E0D5] flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
            {/* Specialty selectors */}
            <div className="flex flex-wrap gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0" id="specialty-filters-bar">
              {specialties.map((spec) => (
                <button
                  key={spec}
                  id={`spec-filter-btn-${spec.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => setSelectedSpec(spec)}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                    selectedSpec === spec
                      ? "bg-[#5A6D5D] text-white"
                      : "bg-[#F9F7F2] border border-[#E6E0D5] text-[#3C3C3C] hover:bg-[#E6E0D5]/20"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            {/* Keyword search bar */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                id="doc-search-query-input"
                placeholder="Search name, clinic or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs p-2.5 ps-9 bg-[#F9F7F2] border border-[#E6E0D5] rounded-xl text-[#3C3C3C] focus:outline-none focus:ring-1 focus:ring-[#5A6D5D] placeholder-[#7A8C7E]"
              />
              <Search className="w-4 h-4 text-[#7A8C7E] absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Doctor Columns */}
            <div className="lg:col-span-8 space-y-4" id="doctors-cards-list">
              {filteredDoctors.map((doc) => {
                const isKoreanRemote = !doc.isAvailableInIndia;

                return (
                  <div
                    key={doc.id}
                    id={`doc-card-${doc.id}`}
                    className="bg-white p-5 rounded-[24px] border border-[#E6E0D5] hover:border-[#5A6D5D] shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5"
                  >
                    {/* Portrait picture */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-stone-100 mx-auto sm:mx-0">
                      <img src={doc.imageUrl} alt={doc.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <span className="text-xxs px-2.5 py-0.5 bg-[#F9F7F2] border border-[#E6E0D5] text-[#5A6D5D] rounded font-bold uppercase tracking-wider block sm:inline-block mr-2 mb-1 sm:mb-0">
                            {doc.specialty}
                          </span>
                          <h3 className="text-base font-serif font-bold text-[#2A3B2D] inline-block align-middle">{doc.name}</h3>
                        </div>
                        <div className="flex items-center gap-1 justify-center sm:justify-start text-amber-500 text-xs font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{doc.rating} ({doc.experience} yrs expert)</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-[#3C3C3C]">
                        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                          <MapPin className="w-3.5 h-3.5 text-[#7A8C7E]" />
                          <span>{doc.clinicName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-center sm:justify-start text-[#7A8C7E]">
                          <span className="font-bold text-[#5A6D5D]">Location:</span>
                          <span>{doc.location}</span>
                        </div>
                        {isKoreanRemote && (
                          <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-100 text-[11px] text-amber-850 font-medium inline-block mt-1">
                            ℹ️ Based in S. Korea (Unavailable for physically visiting in India. High quality video consults only.)
                          </div>
                        )}
                        {!isKoreanRemote && (
                          <div className="text-[11px] text-emerald-800 font-semibold mt-1 flex items-center gap-1 justify-center sm:justify-start">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-550" /> Partner Clinic physically close ({doc.distanceKm} km away)
                          </div>
                        )}
                      </div>

                      {/* Pricing, Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[#F5F2ED] pt-3 mt-3 gap-3">
                        <div className="text-center sm:text-left">
                          <span className="text-[10px] uppercase text-[#7A8C7E] font-bold block">Consultation Fee</span>
                          <span className="text-sm font-bold text-[#2A3B2D]">{formatCurrency(doc.consultationFeeINR)} / Session</span>
                        </div>

                        <div className="flex gap-2 justify-center">
                          {bookedSlot && selectedDoctor?.id === doc.id ? (
                            <button
                              id={`start-consultation-btn-${doc.id}`}
                              onClick={() => startVideoCallSim(doc)}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Video className="w-3.5 h-3.5" /> Start Online Session
                            </button>
                          ) : (
                            <button
                              id={`book-consultation-btn-${doc.id}`}
                              onClick={() => handleBookSession(doc)}
                              className="px-4 py-2 bg-[#5A6D5D] hover:bg-[#4A5D4D] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Calendar className="w-3.5 h-3.5" /> Book Consultation
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredDoctors.length === 0 && (
                <div className="bg-white p-12 text-center rounded-2xl border border-[#E6E0D5] text-[#7A8C7E] font-bold">
                  No specialists matched your active query. Try resetting filters.
                </div>
              )}
            </div>

            {/* Right Clinical Locator Map / Nearby Centers */}
            <div className="lg:col-span-4 bg-[#F9F7F2] border border-[#E6E0D5] p-5 rounded-[24px] shadow-sm space-y-4" id="nearby-centers-locator">
              <h4 className="text-xs uppercase font-bold text-[#2A3B2D] tracking-wider flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#5A6D5D]" /> Nearby Clinic Locator
              </h4>
              <p className="text-xs text-[#7A8C7E]">
                If Korean remote doctors require face-to-face physical diagnostics (e.g. skin scrapings), easily visit our partner dermatological centers in major Indian metropolises:
              </p>

              {/* Simulated Map Visual */}
              <div className="rounded-xl border border-[#E6E0D5] overflow-hidden bg-[#ECE7E1] relative h-48 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(#D9D1C5_2px,transparent_2px)] [background-size:16px_16px] opacity-60" />
                
                {/* Simulated markers */}
                <span className="absolute left-[30%] top-[40%] text-stone-800 flex flex-col items-center">
                  <span className="w-2.5 h-2.5 bg-[#5A6D5D] rounded-full ring-2 ring-white animate-pulse" />
                  <span className="text-[9px] font-bold bg-white/95 px-1 rounded shadow mt-0.5 whitespace-nowrap">Delhi Hub (Dr. Ananya)</span>
                </span>

                <span className="absolute left-[55%] top-[70%] text-stone-800 flex flex-col items-center">
                  <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full ring-2 ring-white animate-pulse" />
                  <span className="text-[9px] font-bold bg-white/95 px-1 rounded shadow mt-0.5 whitespace-nowrap">Mumbai Center</span>
                </span>

                <span className="absolute left-[65%] top-[55%] text-stone-800 flex flex-col items-center">
                  <span className="w-2.5 h-2.5 bg-[#5A6D5D] rounded-full ring-2 ring-white animate-pulse" />
                  <span className="text-[9px] font-bold bg-white/95 px-1 rounded shadow mt-0.5 whitespace-nowrap">Bengaluru Unit</span>
                </span>

                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] text-white tracking-widest uppercase">
                  Indian Depot Locator
                </div>
              </div>

              {/* Physical centers listing */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#E6E0D5] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#2A3B2D] block">Delhi Vasant Vihar Center</span>
                    <span className="text-[10px] text-[#7A8C7E]">Distance: 4.2 km | Partner: Dr. Ananya</span>
                  </div>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-[#F9F7F2] text-stone-700 border border-[#E6E0D5] hover:bg-stone-50 rounded"
                  >
                    <Link2 className="w-4 h-4 text-[#5A6D5D]" />
                  </a>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E6E0D5] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#2A3B2D] block">Bengaluru Indiranagar Center</span>
                    <span className="text-[10px] text-[#7A8C7E]">Distance: 8.5 km | Partner: Dr. Priya</span>
                  </div>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-[#F9F7F2] text-stone-700 border border-[#E6E0D5] hover:bg-stone-50 rounded"
                  >
                    <Link2 className="w-4 h-4 text-[#5A6D5D]" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Overlay Modal */}
      {isBookingModalOpen && (
        <div id="booking-modal-overlay" className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-[#E6E0D5] max-w-md w-full p-6 space-y-4 shadow-xl animate-fade-in">
            <h3 className="text-xl font-serif text-[#2A3B2D]">Confirm Your Tele-Consulting Slot</h3>
            <p className="text-xs text-[#7A8C7E]">
              You are securing an online session with <strong className="text-[#2A3B2D]">{selectedDoctor?.name}</strong>.
            </p>

            <div className="bg-[#F9F7F2] p-3.5 rounded-2xl border border-[#E6E0D5] space-y-2 text-xs text-[#3C3C3C]">
              <div className="flex justify-between">
                <span>Dermatologist:</span>
                <span className="font-bold text-[#2A3B2D]">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Secured Slot:</span>
                <span className="font-bold text-[#5A6D5D]">{bookedSlot}</span>
              </div>
              <div className="flex justify-between">
                <span>Specialization:</span>
                <span className="text-stone-600 font-semibold">{selectedDoctor?.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee (Inc. import custom consulting):</span>
                <span className="font-bold text-[#2A3B2D]">{selectedDoctor ? formatCurrency(selectedDoctor.consultationFeeINR) : ""}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-[#2A3B2D] block">Tell the doctor about your symptoms</label>
              <textarea
                id="booking-consultation-textarea"
                rows={3}
                placeholder="Type any concerns, currently used moisturizers, active ingredients, or medication details..."
                value={userConsultationNote}
                onChange={(e) => setUserConsultationNote(e.target.value)}
                className="w-full p-3 bg-[#F9F7F2] border border-[#E6E0D5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5A6D5D] text-[#3C3C3C]"
              />
            </div>

            <div className="flex gap-2 justify-end text-xs pt-2">
              <button
                id="close-booking-modal-btn"
                onClick={() => setIsBookingModalOpen(false)}
                className="px-4 py-2 hover:bg-stone-100 rounded-xl font-bold text-stone-600 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="confirm-booking-btn"
                onClick={confirmBooking}
                className="px-5 py-2 bg-[#5A6D5D] hover:bg-[#4A5D4D] text-white rounded-full font-bold transition-all cursor-pointer"
              >
                Confirm Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

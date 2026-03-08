import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalyze } from "@/contexts/AnalyzeContext";

const statusMessages = [
  "📄 Parsing your resume...",
  "🔍 Scanning 2,847 job listings for your dream role...",
  "🧠 AI analyzing skill requirements...",
  "📊 Calculating your gap score...",
  "🗺️ Building your personalized roadmap...",
  "✅ Analysis complete!",
];

const dataCards = [
  { text: "Found 47 required skills", delay: 1000 },
  { text: "Matched 28 from your resume", delay: 2000 },
  { text: "Building 30-day roadmap...", delay: 3000 },
];

const StepScanning = () => {
  const navigate = useNavigate();
  const { data } = useAnalyze();
  const [msgIdx, setMsgIdx] = useState(0);
  const [visibleCards, setVisibleCards] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => {
        if (prev >= statusMessages.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dataCards.forEach((_, i) => {
      setTimeout(() => setVisibleCards((prev) => prev + 1), dataCards[i].delay);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale((s) => (s === 1 ? 1.15 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto redirect after ~5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/results");
    }, 6000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const jobTitle = data.jobTitle || "Software Engineer";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
      {/* Scanner */}
      <div className="relative w-48 h-48 mb-12">
        {[1, 2, 3].map((ring) => (
          <div
            key={ring}
            className="absolute inset-0 rounded-full border border-primary/20"
            style={{
              transform: `scale(${pulseScale * (0.6 + ring * 0.2)})`,
              transition: "transform 1s ease-in-out",
              opacity: 1 - ring * 0.25,
            }}
          />
        ))}
        <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <div
              className="w-8 h-8 rounded-full bg-primary glow-box-blue"
              style={{ transform: `scale(${pulseScale})`, transition: "transform 1s ease-in-out" }}
            />
          </div>
        </div>
      </div>

      {/* Status message */}
      <div className="h-8 mb-8">
        <p
          key={msgIdx}
          className="text-lg text-foreground font-medium animate-fade-in-up text-center"
        >
          {statusMessages[msgIdx]?.replace("your dream role", `${jobTitle}`)}
        </p>
      </div>

      {/* Data cards */}
      <div className="flex flex-col sm:flex-row gap-4">
        {dataCards.map((card, i) => (
          <div
            key={i}
            className={`card-surface px-6 py-4 transition-all duration-500 ${
              i < visibleCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <p className="text-sm text-foreground font-medium">{card.text}</p>
          </div>
        ))}
      </div>

      {/* Progress to completion */}
      {msgIdx === statusMessages.length - 1 && (
        <div className="mt-10 animate-fade-in-up">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-secondary font-heading font-bold text-lg">Analysis Complete!</p>
          <p className="text-sm text-muted-foreground mt-1">Redirecting to your results...</p>
        </div>
      )}
    </div>
  );
};

export default StepScanning;

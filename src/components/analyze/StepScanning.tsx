import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalyze } from "@/contexts/AnalyzeContext";
import { analyzeSkills } from "@/lib/ai";
import { toast } from "sonner";

const statusMessages = [
  "📄 Parsing your resume...",
  "🔍 Scanning job listings for your dream role...",
  "🧠 AI analyzing skill requirements...",
  "📊 Calculating your gap score...",
  "🗺️ Building your personalized roadmap...",
  "✅ Analysis complete!",
];

const StepScanning = () => {
  const navigate = useNavigate();
  const { data, setData } = useAnalyze();
  const [msgIdx, setMsgIdx] = useState(0);
  const [pulseScale, setPulseScale] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  // Cycle through status messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => {
        if (prev >= statusMessages.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale((s) => (s === 1 ? 1.15 : 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Run AI analysis
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const run = async () => {
      try {
        const result = await analyzeSkills({
          skills: data.parsedResume?.skills || [],
          jobTitle: data.jobTitle || "Software Engineer",
          targetCompanies: data.targetCompanies,
          experienceLevel: data.experienceLevel,
          experience: data.parsedResume?.experience,
          education: data.parsedResume?.education,
        });

        setData({ skillAnalysis: result });
        // Navigate after a brief delay to show completion
        setTimeout(() => navigate("/results"), 1500);
      } catch (err: any) {
        console.error("Analysis error:", err);
        setError(err.message || "Analysis failed");
        toast.error(err.message || "Analysis failed. Please try again.");
      }
    };

    run();
  }, [data, setData, navigate]);

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
        <p key={msgIdx} className="text-lg text-foreground font-medium animate-fade-in-up text-center">
          {statusMessages[msgIdx]?.replace("your dream role", jobTitle)}
        </p>
      </div>

      {error ? (
        <div className="mt-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => navigate("/analyze")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:brightness-110 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : (
        msgIdx === statusMessages.length - 1 && !error && (
          <div className="mt-10 animate-fade-in-up">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-secondary font-heading font-bold text-lg">Analysis Complete!</p>
            <p className="text-sm text-muted-foreground mt-1">Redirecting to your results...</p>
          </div>
        )
      )}
    </div>
  );
};

export default StepScanning;

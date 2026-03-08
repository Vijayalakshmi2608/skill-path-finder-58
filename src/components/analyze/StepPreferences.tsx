import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAnalyze } from "@/contexts/AnalyzeContext";
import { cn } from "@/lib/utils";

interface StepPrefsProps {
  onNext: () => void;
  onBack: () => void;
}

const timeOptions = [
  { label: "30 min/day", value: "30min" },
  { label: "1 hour/day", value: "1hr" },
  { label: "2 hours/day", value: "2hr" },
  { label: "4+ hours/day", value: "4hr+" },
];

const styleOptions = ["Video Courses", "Reading Docs", "Building Projects", "Practice Problems", "Mentorship"];

const statusOptions = ["1st Year", "2nd Year", "3rd Year", "Final Year", "Recent Graduate", "Working Professional"];

const StepPreferences = ({ onNext, onBack }: StepPrefsProps) => {
  const { data, setData } = useAnalyze();
  const [time, setTime] = useState(data.timeCommitment || "");
  const [styles, setStyles] = useState<string[]>(data.learningStyles || []);
  const [status, setStatus] = useState(data.studentStatus || "");
  const [budget, setBudget] = useState(data.budget ?? 2500);

  const toggleStyle = (s: string) =>
    setStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const handleContinue = () => {
    setData({ timeCommitment: time, learningStyles: styles, studentStatus: status, budget });
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade-in-up">
      {/* Time */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-bold text-foreground">How much time can you dedicate to learning?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {timeOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => setTime(t.value)}
              className={cn(
                "p-4 rounded-xl border text-center transition-all duration-200",
                time === t.value
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-card border-card-border text-muted-foreground hover:border-primary/30"
              )}
            >
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Learning style */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-bold text-foreground">What learning style do you prefer?</h3>
        <div className="flex flex-wrap gap-3">
          {styleOptions.map((s) => (
            <button
              key={s}
              onClick={() => toggleStyle(s)}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200",
                styles.includes(s)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-card-border text-muted-foreground hover:border-primary/30"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Student status */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-bold text-foreground">Your current status:</h3>
        <div className="flex flex-wrap gap-3">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200",
                status === s
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-card border-card-border text-muted-foreground hover:border-secondary/30"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-bold text-foreground">
          Budget for courses? <span className="text-muted-foreground font-normal text-sm">(optional)</span>
        </h3>
        <div className="card-surface p-6">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-muted-foreground">Free Only</span>
            <span className="text-primary font-medium">
              {budget === 0 ? "Free Only" : `Up to ₹${budget.toLocaleString()}/mo`}
            </span>
            <span className="text-muted-foreground">₹5,000/mo</span>
          </div>
          <input
            type="range"
            min={0}
            max={5000}
            step={500}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-6 py-3 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">
          ← Back
        </button>
        <button
          onClick={handleContinue}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold glow-box-blue hover:brightness-110 transition-all duration-300 flex items-center gap-2 group"
        >
          Start Analysis
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default StepPreferences;

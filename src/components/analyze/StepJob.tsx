import { useState, useEffect } from "react";
import { Search, ArrowRight, X } from "lucide-react";
import { useAnalyze } from "@/contexts/AnalyzeContext";
import { cn } from "@/lib/utils";

interface StepJobProps {
  onNext: () => void;
  onBack: () => void;
}

const jobSuggestions = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "ML Engineer", "DevOps Engineer", "Product Manager",
  "Cloud Architect", "Mobile Developer", "QA Engineer", "Data Analyst",
];

const popularChips = [
  "SWE @ FAANG", "Data Scientist", "ML Engineer",
  "Product Manager", "DevOps Engineer", "Full Stack Developer",
];

const companies = [
  { name: "Google", emoji: "🔵" },
  { name: "Amazon", emoji: "📦" },
  { name: "Microsoft", emoji: "🟢" },
  { name: "Meta", emoji: "🔷" },
  { name: "Apple", emoji: "🍎" },
  { name: "Flipkart", emoji: "🛒" },
  { name: "Razorpay", emoji: "💳" },
  { name: "Swiggy", emoji: "🍽️" },
  { name: "Zomato", emoji: "🍕" },
  { name: "Startup", emoji: "🚀" },
];

const levels = ["Internship", "Entry Level (0-1yr)", "Junior (1-3yr)", "Mid-level (3-5yr)"];

const placeholders = [
  "Software Engineer at Google...",
  "Data Scientist at Amazon...",
  "Product Manager at Startup...",
  "ML Engineer at Meta...",
];

const StepJob = ({ onNext, onBack }: StepJobProps) => {
  const { data, setData } = useAnalyze();
  const [query, setQuery] = useState(data.jobTitle || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(data.targetCompanies || []);
  const [level, setLevel] = useState(data.experienceLevel || "");
  const [customCompany, setCustomCompany] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setPlaceholderIdx((p) => (p + 1) % placeholders.length), 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = query.length > 0
    ? jobSuggestions.filter((j) => j.toLowerCase().includes(query.toLowerCase()))
    : [];

  const toggleCompany = (name: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const addCustom = () => {
    if (customCompany.trim() && !selectedCompanies.includes(customCompany.trim())) {
      setSelectedCompanies((prev) => [...prev, customCompany.trim()]);
      setCustomCompany("");
    }
  };

  const handleContinue = () => {
    setData({ jobTitle: query, targetCompanies: selectedCompanies, experienceLevel: level });
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade-in-up">
      {/* Job search */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholders[placeholderIdx]}
            className="w-full pl-12 pr-4 py-4 text-lg bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {showDropdown && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 card-surface p-2 z-20 max-h-60 overflow-y-auto">
              {filtered.map((j) => (
                <button
                  key={j}
                  onClick={() => { setQuery(j); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 rounded-lg transition-colors"
                >
                  {j}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {popularChips.map((c) => (
            <button
              key={c}
              onClick={() => { setQuery(c); setShowDropdown(false); }}
              className={cn(
                "px-4 py-2 text-sm rounded-full border transition-all duration-200",
                query === c
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-muted border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Companies */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-bold text-foreground">
          Any specific companies in mind? <span className="text-muted-foreground font-normal text-sm">(optional)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {companies.map((c) => (
            <button
              key={c.name}
              onClick={() => toggleCompany(c.name)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200",
                selectedCompanies.includes(c.name)
                  ? "bg-primary/10 border-primary/40"
                  : "bg-card border-card-border hover:border-primary/30"
              )}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs text-foreground">{c.name}</span>
            </button>
          ))}
        </div>
        {selectedCompanies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCompanies.map((c) => (
              <span key={c} className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-primary/15 text-primary border border-primary/30">
                {c}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleCompany(c)} />
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={customCompany}
            onChange={(e) => setCustomCompany(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="Or enter custom company name"
            className="flex-1 px-4 py-2.5 text-sm bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-all"
          />
          <button onClick={addCustom} className="px-4 py-2.5 text-sm bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            Add
          </button>
        </div>
      </div>

      {/* Experience level */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-bold text-foreground">I'm targeting roles for...</h3>
        <div className="flex flex-wrap gap-3">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200",
                level === l
                  ? "bg-primary text-primary-foreground border-primary glow-box-blue"
                  : "bg-card border-card-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-6 py-3 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors">
          ← Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!query.trim()}
          className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold glow-box-blue hover:brightness-110 transition-all duration-300 flex items-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default StepJob;

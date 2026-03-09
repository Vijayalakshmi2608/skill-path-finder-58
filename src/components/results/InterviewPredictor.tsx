import { useState } from "react";
import { Search, Loader2, Target, BookOpen, Clock, Brain } from "lucide-react";
import { predictInterview, type InterviewPrediction } from "@/lib/ai";
import { toast } from "sonner";

const InterviewPredictor = () => {
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<InterviewPrediction | null>(null);

  const handlePredict = async () => {
    if (!company.trim()) return;
    setLoading(true);
    try {
      const result = await predictInterview({ company: company.trim() });
      setPrediction(result);
    } catch (err: any) {
      toast.error(err.message || "Failed to predict");
    } finally {
      setLoading(false);
    }
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 70) return "text-secondary";
    if (rate >= 40) return "text-amber-400";
    return "text-destructive";
  };

  return (
    <div className="card-surface p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-heading font-bold text-foreground">AI Interview Predictor</h3>
          <p className="text-sm text-muted-foreground">Get AI-powered interview predictions</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePredict()}
            placeholder="Which company are you interviewing at?"
            className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <button
          onClick={handlePredict}
          disabled={loading || !company.trim()}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 transition-all disabled:opacity-40 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Predict"}
        </button>
      </div>

      {prediction && (
        <div className="space-y-5 animate-fade-in-up">
          {/* Success rate */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
            <div className={`text-4xl font-heading font-extrabold ${getSuccessColor(prediction.success_rate)}`}>
              {prediction.success_rate}%
            </div>
            <div>
              <p className="text-foreground font-medium">Predicted Success Rate</p>
              <p className="text-sm text-muted-foreground">{prediction.company_insights}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Topics */}
            <div className="p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Likely Interview Topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {prediction.likely_topics.map((t, i) => (
                  <span key={i} className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Top 3 prep */}
            <div className="p-4 bg-muted rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-foreground">Top 3 Things to Prepare</span>
              </div>
              <ol className="space-y-1.5">
                {prediction.top_3_to_prepare.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-secondary font-bold">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Prep time */}
          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">
              Estimated prep time: <strong className="text-primary">{prediction.estimated_prep_days} days</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPredictor;

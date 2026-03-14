import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "@/components/analyze/ProgressBar";
import StepUpload from "@/components/analyze/StepUpload";
import StepJob from "@/components/analyze/StepJob";
import StepPreferences from "@/components/analyze/StepPreferences";
import StepScanning from "@/components/analyze/StepScanning";
import { Zap } from "lucide-react";

const stepLabels = ["Upload", "Dream Job", "Preferences", "Analyzing"];
const stepTitles = [
  "Tell us about yourself",
  "What's your dream job?",
  "Customize your analysis",
  "AI is scanning...",
];

const AnalyzePage = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Simple top bar */}
      <div className="border-b border-border bg-surface-secondary">
        <div className="section-container flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2 text-lg font-heading font-bold">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-foreground">Skill</span>
            <span className="text-primary">Scan</span>
          </a>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>

      <div className="section-container py-10 max-w-5xl">
        <ProgressBar currentStep={step} totalSteps={4} labels={stepLabels} />

        <div className="mb-8">
          <p className="text-sm text-primary font-medium mb-1">Step {step} of 4</p>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            {stepTitles[step - 1]}
          </h2>
        </div>

        {step === 1 && <StepUpload onNext={() => setStep(2)} />}
        {step === 2 && <StepJob onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <StepPreferences onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <StepScanning />}
      </div>
    </div>
  );
};

export default AnalyzePage;

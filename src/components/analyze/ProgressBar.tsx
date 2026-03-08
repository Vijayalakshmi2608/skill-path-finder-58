import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

const ProgressBar = ({ currentStep, totalSteps, labels }: ProgressBarProps) => {
  const pct = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-10">
      <div className="flex justify-between mb-3">
        {labels.map((label, i) => (
          <span
            key={i}
            className={cn(
              "text-xs font-medium transition-colors duration-300",
              i + 1 <= currentStep ? "text-primary" : "text-muted-foreground/50"
            )}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700 ease-out glow-box-blue"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

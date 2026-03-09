import { useNavigate } from "react-router-dom";
import { Briefcase, Globe, Github, QrCode, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const PortfolioCTA = ({ completedDays }: { completedDays: number }) => {
  const navigate = useNavigate();
  const progress = Math.round((completedDays / 30) * 100);

  return (
    <section className="py-12 border-b border-border">
      <div className="section-container">
        <div className="card-surface p-8 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                🎯 Your Auto-Generated Portfolio
              </h2>
              <p className="text-muted-foreground mb-4 max-w-xl">
                As you complete roadmap tasks, we automatically build your portfolio with live
                projects, a shareable QR code, and a "Hire Me" button with your readiness score.
              </p>

              <div className="flex flex-wrap gap-4 mb-5 text-sm text-muted-foreground">
                {[
                  { icon: Github, text: "Auto GitHub repo" },
                  { icon: Globe, text: "Live portfolio site" },
                  { icon: QrCode, text: "QR code sharing" },
                  { icon: Briefcase, text: "Hire Me button" },
                ].map((item) => (
                  <span key={item.text} className="flex items-center gap-1.5">
                    <item.icon className="w-4 h-4 text-primary" />
                    {item.text}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <Progress value={progress} className="h-2 flex-1 max-w-xs" />
                <span className="text-sm font-semibold text-foreground">{progress}%</span>
              </div>

              <Button onClick={() => navigate("/portfolio")}>
                View My Portfolio
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>

            {/* Mini preview card */}
            <div className="card-surface p-5 w-full lg:w-56 text-center shrink-0">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-lg font-bold text-primary mx-auto mb-2">
                PS
              </div>
              <p className="text-sm font-semibold text-foreground">Priya Sharma</p>
              <p className="text-xs text-muted-foreground mb-3">priyasharma.skillscan.dev</p>
              <div className="text-3xl font-heading font-extrabold text-primary mb-1">78%</div>
              <p className="text-xs text-muted-foreground">Job Readiness</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioCTA;

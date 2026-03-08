import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const badges = [
  { text: "Python +45%", color: "bg-primary/20 text-primary border-primary/30" },
  { text: "React ✅", color: "bg-secondary/20 text-secondary border-secondary/30" },
  { text: "ML Missing ⚠️", color: "bg-destructive/20 text-destructive border-destructive/30" },
  { text: "AWS Gap 🔴", color: "bg-destructive/20 text-destructive border-destructive/30" },
  { text: "Interview Ready 87%", color: "bg-secondary/20 text-secondary border-secondary/30" },
];

const badgePositions = [
  "top-[15%] left-[5%] animate-float",
  "top-[8%] right-[8%] animate-float-delayed",
  "bottom-[25%] left-[3%] animate-float-slow",
  "bottom-[15%] right-[5%] animate-float",
  "top-[45%] right-[2%] animate-float-delayed",
];

const Hero = () => {
  const navigate = useNavigate();
  return (
  <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
    <div className="absolute inset-0 dot-pattern opacity-40" />
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />

    {badges.map((b, i) => (
      <div
        key={i}
        className={`absolute hidden lg:block px-3 py-1.5 text-xs font-medium border rounded-full ${b.color} ${badgePositions[i]}`}
      >
        {b.text}
      </div>
    ))}

    <div className="section-container relative z-10 text-center max-w-4xl">
      <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-heading font-extrabold leading-[1.05] mb-6">
        Stop Guessing.
        <br />
        <span className="text-primary glow-blue">Start Getting Hired.</span>
      </h1>
      <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
        Upload your resume, pick your dream job — SkillScan's AI reveals exactly what's missing and builds your personal roadmap to close the gap in 30 days.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onClick={() => navigate("/analyze")} className="group px-8 py-4 text-base font-semibold bg-primary text-primary-foreground rounded-lg glow-box-blue hover:brightness-110 transition-all duration-300 flex items-center gap-2">
          Analyze My Resume Free
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
        <button className="px-8 py-4 text-base font-medium text-muted-foreground border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 flex items-center gap-2">
          <Play className="w-4 h-4" />
          Watch 2-min Demo
        </button>
      </div>

      {/* Skill gap visualization */}
      <div className="mt-16 flex items-center justify-center gap-4 sm:gap-8">
        <div className="card-surface p-4 sm:p-6 text-left min-w-[140px] sm:min-w-[180px]">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Current Skills</p>
          {["JavaScript", "HTML/CSS", "Git"].map((s) => (
            <div key={s} className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-sm text-foreground">{s}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-1 h-20 rounded-full bg-gradient-to-b from-secondary via-primary to-destructive animate-pulse" />
          <span className="text-xs text-primary font-medium">GAP</span>
        </div>
        <div className="card-surface p-4 sm:p-6 text-left min-w-[140px] sm:min-w-[180px]">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Required Skills</p>
          {["React", "TypeScript", "System Design"].map((s) => (
            <div key={s} className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-sm text-foreground">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
};

export default Hero;

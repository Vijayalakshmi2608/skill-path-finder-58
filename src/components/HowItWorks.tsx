const steps = [
  { icon: "📄", title: "Upload Resume", desc: "Upload your resume or paste your LinkedIn URL" },
  { icon: "🎯", title: "Pick Dream Job", desc: "Choose your target job title and company" },
  { icon: "🤖", title: "AI Scans Jobs", desc: "AI analyzes 1000s of real job listings instantly" },
  { icon: "🗺️", title: "Get Roadmap", desc: "Receive your personalized 30-day action plan" },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 bg-surface-secondary">
    <div className="section-container">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-center mb-16">
        How It <span className="text-primary">Works</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {steps.map((s, i) => (
          <div key={i} className="text-center relative">
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-primary/30" />
            )}
            <div className="text-5xl font-heading font-extrabold text-primary/20 mb-2">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="text-4xl mb-4">{s.icon}</div>
            <h3 className="text-lg font-heading font-bold mb-2 text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;

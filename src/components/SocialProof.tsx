const items = [
  "🎓 10,000+ students analyzed",
  "💼 500+ companies covered",
  "📈 87% got interviews after following their roadmap",
  "🏆 #1 Career Tool at 50+ Colleges",
];

const SocialProof = () => (
  <section className="py-6 border-y border-border bg-surface-secondary overflow-hidden">
    <div className="relative">
      <div className="animate-ticker flex whitespace-nowrap">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} className="inline-block px-8 text-sm text-muted-foreground">
            {item}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProof;

const problems = [
  "They apply blindly without knowing what skills are actually needed",
  "They spend months learning the wrong things",
  "Their resume doesn't match what companies are actually looking for",
];

const ProblemSection = () => (
  <section className="py-24">
    <div className="section-container text-center">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-14">
        Why Do 60% of Graduates
        <br />
        <span className="text-destructive">Struggle to Get Hired?</span>
      </h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        {problems.map((p, i) => (
          <div
            key={i}
            className="card-surface p-6 border-destructive/20 hover-lift"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <span className="text-destructive text-2xl mb-4 block">❌</span>
            <p className="text-muted-foreground leading-relaxed">{p}</p>
          </div>
        ))}
      </div>
      <p className="text-xl sm:text-2xl font-heading font-bold text-secondary">
        SkillScan fixes all three. In minutes.
      </p>
    </div>
  </section>
);

export default ProblemSection;

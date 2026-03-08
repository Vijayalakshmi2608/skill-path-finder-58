const testimonials = [
  {
    quote: "SkillScan told me I was missing Docker and System Design. I learned both in 3 weeks and got an offer from Google.",
    name: "Arjun S.",
    college: "IIT Delhi",
    result: "→ Google",
    avatar: "AS",
  },
  {
    quote: "I was applying to 50+ jobs with no response. SkillScan showed me my resume was missing key AWS skills. Fixed it, got 5 callbacks in a week.",
    name: "Priya M.",
    college: "NIT Trichy",
    result: "→ Amazon",
    avatar: "PM",
  },
  {
    quote: "The 30-day roadmap was a game changer. Every day I knew exactly what to study. Landed my dream ML role in a month.",
    name: "Rahul K.",
    college: "BITS Pilani",
    result: "→ Microsoft",
    avatar: "RK",
  },
];

const Testimonials = () => (
  <section id="success-stories" className="py-24">
    <div className="section-container">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-center mb-14">
        Success <span className="text-primary">Stories</span>
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="card-surface p-6 hover-lift flex flex-col">
            <p className="text-muted-foreground leading-relaxed flex-1 mb-6">"{t.quote}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name} <span className="text-secondary">{t.result}</span></p>
                <p className="text-xs text-muted-foreground">{t.college}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;

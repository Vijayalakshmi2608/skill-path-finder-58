import { BarChart3, Users, Handshake } from "lucide-react";

const benefits = [
  { icon: BarChart3, title: "Placement Rate Analytics", desc: "Track and improve your institution's placement outcomes with real-time data." },
  { icon: Users, title: "Student Skill Tracking", desc: "Monitor skill development across cohorts and identify gaps early." },
  { icon: Handshake, title: "Industry Partnership Insights", desc: "Understand what industry partners actually need from your graduates." },
];

const ForColleges = () => (
  <section id="for-colleges" className="py-24 bg-surface-secondary">
    <div className="section-container text-center">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-4">
        SkillScan for <span className="text-primary">Institutions</span>
      </h2>
      <p className="text-muted-foreground mb-14 max-w-2xl mx-auto">
        Empower your placement cell with AI-driven insights to boost student outcomes.
      </p>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {benefits.map((b, i) => (
          <div key={i} className="card-surface p-6 hover-lift text-left">
            <b.icon className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-heading font-bold text-lg mb-2 text-foreground">{b.title}</h3>
            <p className="text-sm text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </div>
      <button className="px-8 py-4 text-base font-semibold bg-primary text-primary-foreground rounded-lg glow-box-blue hover:brightness-110 transition-all duration-300">
        Request a Demo for Your College
      </button>
    </div>
  </section>
);

export default ForColleges;

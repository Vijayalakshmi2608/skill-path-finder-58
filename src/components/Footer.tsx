const Footer = () => (
  <footer className="py-12 border-t border-border">
    <div className="section-container">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <a href="#" className="flex items-center gap-2 text-xl font-heading font-bold mb-2">
            <span className="text-primary">⚡</span>
            <span className="text-foreground">SkillScan</span>
          </a>
          <p className="text-sm text-muted-foreground">Helping every student find their path 🎯</p>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          {["Privacy", "Terms", "Contact", "Blog"].map((l) => (
            <a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>
          ))}
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SkillScan. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;

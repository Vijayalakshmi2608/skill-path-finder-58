import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["How It Works", "Features", "Success Stories", "For Colleges"];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="section-container flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2 text-xl font-heading font-bold">
          <span className="text-primary glow-blue">⚡</span>
          <span className="text-foreground">Skill</span>
          <span className="text-primary">Scan</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {l}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors duration-200">
            Sign In
          </button>
          <button className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg glow-box-blue hover:brightness-110 transition-all duration-200">
            Analyze My Skills
          </button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 pb-4">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
              className="block py-3 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {l}
            </a>
          ))}
          <div className="flex flex-col gap-2 mt-3">
            <button className="px-4 py-2 text-sm text-muted-foreground border border-border rounded-lg">Sign In</button>
            <button className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg">Analyze My Skills</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

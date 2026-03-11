import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const homeLinks = ["How It Works", "Features", "Success Stories", "For Colleges"];

  const tools = [
    { label: "Resume Analysis", path: "/resume-analysis" },
    { label: "Mock Interview", path: "/mock-interview" },
    { label: "Study Buddy", path: "/study-buddy" },
    { label: "Portfolio", path: "/portfolio" },
    { label: "Leaderboard", path: "/leaderboard" },
    { label: "API", path: "/api" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="section-container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 text-xl font-heading font-bold">
          <span className="text-primary glow-blue">⚡</span>
          <span className="text-foreground">Skill</span>
          <span className="text-primary">Scan</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {isHome &&
            homeLinks.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {l}
              </a>
            ))}

          <Link
            to="/analyze"
            className={`text-sm transition-colors duration-200 ${
              location.pathname === "/analyze" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Analyze
          </Link>

          <div className="relative group">
            <button
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              onClick={() => setToolsOpen(!toolsOpen)}
              onMouseEnter={() => setToolsOpen(true)}
            >
              Tools <ChevronDown size={14} className={`transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`} />
            </button>
            {toolsOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-card border border-border rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                onMouseLeave={() => setToolsOpen(false)}
              >
                {tools.map((t) => (
                  <Link
                    key={t.path}
                    to={t.path}
                    className={`block px-4 py-2.5 text-sm transition-colors duration-150 ${
                      location.pathname === t.path
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setToolsOpen(false)}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <User size={14} />
                    {user.email?.split("@")[0]}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors duration-200 flex items-center gap-1.5"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/analyze"
                    className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg glow-box-blue hover:brightness-110 transition-all duration-200"
                  >
                    Analyze My Skills
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
          {isHome &&
            homeLinks.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
                className="block py-3 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {l}
              </a>
            ))}

          <Link
            to="/analyze"
            className="block py-3 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Analyze
          </Link>

          <div className="border-t border-border mt-2 pt-2">
            <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-1">Tools</p>
            {tools.map((t) => (
              <Link
                key={t.path}
                to={t.path}
                className={`block py-2.5 text-sm transition-colors ${
                  location.pathname === t.path ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {t.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 mt-3 border-t border-border pt-3">
            {user ? (
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false); }}
                className="px-4 py-2 text-sm text-muted-foreground border border-border rounded-lg flex items-center gap-1.5 justify-center"
              >
                <LogOut size={14} /> Sign Out
              </button>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="px-4 py-2 text-sm text-muted-foreground border border-border rounded-lg text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/analyze"
                  className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Analyze My Skills
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

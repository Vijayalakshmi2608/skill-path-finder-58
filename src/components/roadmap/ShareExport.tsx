import { Share2, FileDown, CalendarPlus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const actions = [
  {
    icon: Share2,
    label: "Share Your Roadmap",
    desc: "Generate a public link",
    onClick: () => toast.success("Shareable link copied to clipboard!"),
  },
  {
    icon: FileDown,
    label: "Download as PDF",
    desc: "Full roadmap as printable PDF",
    onClick: () => toast.success("PDF download started!"),
  },
  {
    icon: CalendarPlus,
    label: "Sync to Google Calendar",
    desc: "Add daily tasks to calendar",
    onClick: () => toast.success("Calendar sync initiated!"),
  },
  {
    icon: MessageCircle,
    label: "Set WhatsApp Reminder",
    desc: "Daily reminder message",
    onClick: () => toast.success("WhatsApp reminder set!"),
  },
];

const ShareExport = () => {
  return (
    <section className="py-12">
      <div className="section-container">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-8">
          🔗 Share & Export
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="card-surface p-5 hover-lift text-left group"
            >
              <a.icon className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {a.label}
              </h3>
              <p className="text-xs text-muted-foreground">{a.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShareExport;

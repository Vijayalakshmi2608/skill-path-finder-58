import { useState, useRef } from "react";
import { Award, Download, Linkedin, QrCode, Share2, CheckCircle2, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

interface CertificateGeneratorProps {
  completedDays: number;
  totalDays?: number;
}

const CertificateGenerator = ({ completedDays, totalDays = 30 }: CertificateGeneratorProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("Rahul Sharma");
  const [role, setRole] = useState("Software Engineer");
  const [generated, setGenerated] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const isComplete = completedDays >= totalDays;
  const progress = Math.round((completedDays / totalDays) * 100);
  const certId = `SS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const verifyUrl = `https://skill-path-finder-58.lovable.app/verify/${certId}`;
  const completionDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const linkedinText = `🎉 I just completed my 30-day learning roadmap and earned my SkillScan Verified certificate!\n\n✅ SkillScan Verified: Job-Ready for ${role}\n📊 Completed ${totalDays} days of structured learning\n🔗 Verify: ${verifyUrl}\n\nReady to take on new challenges! 💪\n\n@SkillScan #SkillScan #CareerGrowth #JobReady #TechSkills #LearningJourney`;

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}&title=${encodeURIComponent(`SkillScan Verified: Job-Ready for ${role}`)}&summary=${encodeURIComponent(linkedinText)}`;

  const handleGenerate = () => {
    if (!name.trim()) {
      toast({ title: "Enter your name", variant: "destructive" });
      return;
    }
    setGenerated(true);
    toast({ title: "🎉 Certificate Generated!", description: "Your LinkedIn-ready certificate is ready to share." });
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(linkedinText);
    toast({ title: "Copied to clipboard!", description: "Paste this in your LinkedIn post." });
  };

  const handleDownload = () => {
    toast({ title: "Downloading certificate...", description: "Your certificate image is being prepared." });
    // In production this would use html2canvas or similar
  };

  if (!isComplete) {
    return (
      <section className="py-16 border-b border-border">
        <div className="section-container max-w-3xl">
          <div className="card-surface p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              🏅 Your Certificate Awaits
            </h2>
            <p className="text-muted-foreground mb-6">
              Complete your {totalDays}-day roadmap to unlock your LinkedIn-ready certificate
            </p>
            <div className="max-w-xs mx-auto mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{completedDays}/{totalDays} days</span>
                <span className="text-primary font-semibold">{progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalDays - completedDays} more days to go — keep the streak alive! 🔥
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 border-b border-border">
      <div className="section-container max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> Roadmap Complete!
          </div>
          <h2 className="text-3xl font-heading font-extrabold text-foreground mb-2">
            🎉 Congratulations! Claim Your Certificate
          </h2>
          <p className="text-muted-foreground text-lg">
            Share your achievement on LinkedIn and stand out to recruiters
          </p>
        </div>

        {!generated ? (
          <div className="card-surface p-8 max-w-lg mx-auto space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Your Full Name</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" className="bg-muted/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Target Role</label>
              <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer" className="bg-muted/50" />
            </div>
            <Button onClick={handleGenerate} className="w-full h-12 text-base font-semibold glow-box-blue">
              <Award className="w-5 h-5" /> Generate My Certificate
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Certificate Card */}
            <div ref={certRef} className="card-surface p-0 overflow-hidden max-w-2xl mx-auto">
              {/* Certificate Header */}
              <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20 p-1">
                <div className="bg-card p-8 sm:p-10">
                  {/* Top badges row */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-primary font-heading font-bold text-lg">
                      <Award className="w-6 h-6" /> SkillScan
                    </div>
                    <span className="px-3 py-1 text-xs rounded-full bg-secondary/15 text-secondary border border-secondary/30 font-semibold">
                      VERIFIED ✓
                    </span>
                  </div>

                  {/* Main content */}
                  <div className="text-center mb-8">
                    <p className="text-sm text-muted-foreground uppercase tracking-widest mb-3">Certificate of Completion</p>
                    <h3 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground mb-1">{name}</h3>
                    <p className="text-muted-foreground text-sm mb-6">has successfully completed the SkillScan learning roadmap</p>

                    <div className="inline-block px-6 py-3 rounded-xl bg-primary/10 border border-primary/20 mb-6">
                      <p className="text-sm text-primary/80 mb-0.5">SkillScan Verified</p>
                      <p className="text-xl font-heading font-bold text-primary">Job-Ready for {role}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center mb-6">
                      <div>
                        <p className="text-2xl font-heading font-bold text-foreground">{totalDays}</p>
                        <p className="text-xs text-muted-foreground">Days Completed</p>
                      </div>
                      <div>
                        <p className="text-2xl font-heading font-bold text-foreground">100%</p>
                        <p className="text-xs text-muted-foreground">Completion Rate</p>
                      </div>
                      <div>
                        <p className="text-2xl font-heading font-bold text-foreground">A+</p>
                        <p className="text-xs text-muted-foreground">Grade</p>
                      </div>
                    </div>
                  </div>

                  {/* QR + details row */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border">
                    <div className="text-sm space-y-1">
                      <p className="text-muted-foreground">Issued: <span className="text-foreground">{completionDate}</span></p>
                      <p className="text-muted-foreground">ID: <span className="text-foreground font-mono text-xs">{certId}</span></p>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                      <QRCodeSVG value={verifyUrl} size={80} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
              <Button onClick={handleDownload} variant="outline" className="h-11">
                <Download className="w-4 h-4" /> Download Certificate
              </Button>
              <a href={linkedinShareUrl} target="_blank" rel="noopener noreferrer">
                <Button className="h-11 bg-[hsl(210,80%,45%)] hover:bg-[hsl(210,80%,40%)] text-white">
                  <Linkedin className="w-4 h-4" /> Post to LinkedIn
                </Button>
              </a>
              <Button onClick={handleCopyText} variant="outline" className="h-11">
                <Share2 className="w-4 h-4" /> Copy Post Text
              </Button>
            </div>

            {/* LinkedIn Post Preview */}
            <div className="card-surface p-6 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Linkedin className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-foreground">LinkedIn Post Preview</h3>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">Aspiring {role} • Just now</p>
                  </div>
                </div>
                <div className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                  {linkedinText}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span>Auto-tags @SkillScan for maximum visibility</span>
              </div>
            </div>

            {/* Verify Link */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-sm text-muted-foreground">
                <QrCode className="w-4 h-4" />
                Verify: <span className="font-mono text-xs text-primary">{certId}</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CertificateGenerator;

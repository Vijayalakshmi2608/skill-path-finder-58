import { useState, useCallback } from "react";
import { Upload, FileText, Linkedin, ChevronDown, ChevronUp, ArrowRight, Shield, Zap, Target, Loader2 } from "lucide-react";
import { useAnalyze } from "@/contexts/AnalyzeContext";
import { cn } from "@/lib/utils";
import { parseResume } from "@/lib/ai";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface StepUploadProps {
  onNext: () => void;
}

const StepUpload = ({ onNext }: StepUploadProps) => {
  const { data, setData } = useAnalyze();
  const [dragOver, setDragOver] = useState(false);
  const [showTextarea, setShowTextarea] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState(data.linkedinUrl || "");
  const [resumeText, setResumeText] = useState(data.resumeText || "");

  const processResume = useCallback(async (text: string) => {
    setLoading(true);
    try {
      const parsed = await parseResume(text);
      setData({
        parsedResume: parsed,
        detectedName: parsed.name,
        detectedSkills: parsed.skills.map((s) => s.name),
        detectedExperience: parsed.experience.length > 0
          ? `${parsed.experience.length} role(s): ${parsed.experience.map((e) => e.title).join(", ")}`
          : "No experience detected",
        detectedEducation: parsed.education
          ? `${parsed.education.degree} ${parsed.education.field}, ${parsed.education.year}`
          : "Not detected",
        resumeText: text,
      });
      setExtracted(true);
    } catch (err: any) {
      console.error("Resume parse error:", err);
      toast.error(err.message || "Failed to parse resume. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [setData]);

  const extractTextFromPdf = useCallback(async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map((item: any) => item.str).join(" "));
    }
    return pages.join("\n");
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setData({ fileName: file.name });
      setLoading(true);
      try {
        let text: string;
        if (file.name.toLowerCase().endsWith(".pdf")) {
          text = await extractTextFromPdf(file);
        } else {
          text = await file.text();
        }
        if (!text.trim()) {
          toast.error("Could not extract text from file. Try pasting your resume text instead.");
          setLoading(false);
          return;
        }
        await processResume(text);
      } catch (err: any) {
        console.error("File read error:", err);
        toast.error("Failed to read file. Try pasting your resume text instead.");
        setLoading(false);
      }
    },
    [setData, processResume, extractTextFromPdf]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleLinkedin = () => {
    if (!linkedinUrl.trim()) return;
    setData({ linkedinUrl });
    // LinkedIn URL would need scraping — use as context hint
    toast.info("LinkedIn import is coming soon. Please paste your resume text instead.");
  };

  const handlePasteResume = () => {
    if (!resumeText.trim()) return;
    processResume(resumeText);
  };

  const info = [
    { icon: Shield, text: "Your resume is never stored permanently" },
    { icon: Zap, text: "AI analyzes in under 10 seconds" },
    { icon: Target, text: "Works with any format or style" },
  ];

  if (extracted && data.detectedName) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in-up">
        <div className="card-surface p-8">
          <h3 className="text-xl font-heading font-bold text-foreground mb-6">We detected the following from your resume:</h3>
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-secondary">✅</span>
              <span className="text-muted-foreground">Name detected:</span>
              <span className="text-foreground font-medium">{data.detectedName}</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-secondary">✅</span>
                <span className="text-muted-foreground">Skills detected ({data.detectedSkills?.length || 0}):</span>
              </div>
              <div className="flex flex-wrap gap-2 ml-8">
                {data.detectedSkills?.map((s) => (
                  <span key={s} className="px-3 py-1 text-sm rounded-full bg-secondary/15 text-secondary border border-secondary/30">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-secondary">✅</span>
              <span className="text-muted-foreground">Experience:</span>
              <span className="text-foreground font-medium">{data.detectedExperience}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-secondary">✅</span>
              <span className="text-muted-foreground">Education:</span>
              <span className="text-foreground font-medium">{data.detectedEducation}</span>
            </div>
            {data.parsedResume?.summary && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground italic">{data.parsedResume.summary}</p>
              </div>
            )}
          </div>
          <button
            onClick={onNext}
            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold glow-box-blue hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            Looks right? Continue
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => {
              setExtracted(false);
              setData({ detectedName: undefined, detectedSkills: undefined, detectedExperience: undefined, detectedEducation: undefined, fileName: undefined, parsedResume: undefined });
            }}
            className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Re-upload a different resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in-up">
      {/* Left panel */}
      <div className="flex-[3] space-y-6">
        {loading && (
          <div className="card-surface p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-foreground font-medium">AI is analyzing your resume...</p>
            <p className="text-sm text-muted-foreground">This usually takes 5-10 seconds</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Upload zone */}
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-4 p-12 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300",
                dragOver
                  ? "border-primary bg-primary/10 glow-box-blue"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <Upload className={cn("w-12 h-12 transition-colors", dragOver ? "text-primary" : "text-muted-foreground")} />
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">Drop your resume here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
              </div>
              <div className="flex gap-2">
                {["PDF", "DOCX", "TXT"].map((f) => (
                  <span key={f} className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">{f}</span>
                ))}
              </div>
              <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={onFileSelect} />
            </label>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Linkedin className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Paste LinkedIn Profile URL</span>
              </div>
              <div className="flex gap-2">
                <input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourname"
                  className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
                <button onClick={handleLinkedin} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 transition-all">
                  Import
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Paste text */}
            <div>
              <button
                onClick={() => setShowTextarea(!showTextarea)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText className="w-4 h-4" />
                Paste Resume Text Directly
                {showTextarea ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showTextarea && (
                <div className="mt-3 space-y-3">
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={8}
                    placeholder="Paste your resume content here..."
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  />
                  <button
                    onClick={handlePasteResume}
                    disabled={!resumeText.trim()}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 transition-all disabled:opacity-40"
                  >
                    Analyze Text
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right panel */}
      <div className="flex-[2] space-y-6">
        <h3 className="text-lg font-heading font-bold text-foreground">Why we need this</h3>
        <div className="space-y-4">
          {info.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="card-surface p-5 relative overflow-hidden">
          <div className="blur-sm select-none pointer-events-none space-y-2">
            <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
            <div className="h-3 bg-muted-foreground/10 rounded w-3/4" />
            <div className="h-3 bg-muted-foreground/10 rounded w-2/3" />
            <div className="h-3 bg-muted-foreground/10 rounded w-4/5" />
            <div className="h-4 bg-muted-foreground/20 rounded w-1/3 mt-4" />
            <div className="h-3 bg-muted-foreground/10 rounded w-3/4" />
            <div className="h-3 bg-muted-foreground/10 rounded w-1/2" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs bg-card px-3 py-1 rounded-full text-muted-foreground border border-border">
              🔒 Sample resume preview
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepUpload;

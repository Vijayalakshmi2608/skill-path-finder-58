import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, ArrowLeft, Clock, Brain, Target, Zap,
  CheckCircle2, XCircle, ChevronDown, ChevronRight,
  Loader2, RotateCcw, Download, SkipForward, Keyboard
} from "lucide-react";
import Navbar from "@/components/Navbar";

// ── Types ──────────────────────────────────────────────
interface SimQuestion {
  id: number;
  question: string;
  type: "technical" | "behavioral";
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  key_concepts: string[];
  ideal_answer_points: string[];
}

interface Evaluation {
  relevance: number;
  clarity: number;
  technical: number;
  overall: number;
  keywords_found: string[];
  keywords_missed: string[];
  feedback: string;
  ideal_hint: string;
}

interface AnswerRecord {
  question: SimQuestion;
  answer: string;
  evaluation: Evaluation;
}

type Phase = "setup" | "interview" | "evaluating" | "feedback" | "report";

const ROLES = [
  { emoji: "💻", label: "Software Engineer" },
  { emoji: "📊", label: "Data Scientist" },
  { emoji: "🎨", label: "UI/UX Designer" },
  { emoji: "📱", label: "Product Manager" },
  { emoji: "🔧", label: "DevOps Engineer" },
  { emoji: "☁️", label: "Cloud Architect" },
];

const LEVELS = [
  { emoji: "🌱", label: "Fresher", desc: "0 experience" },
  { emoji: "⚡", label: "Junior", desc: "1-2 years" },
  { emoji: "🔥", label: "Mid-Level", desc: "3-5 years" },
];

const TYPES = [
  { emoji: "🧠", label: "Technical Only" },
  { emoji: "💬", label: "HR & Behavioral" },
  { emoji: "🔄", label: "Mixed", desc: "Recommended" },
];

// ── Animated counter ──────────────────────────────────
function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(id); }
      else setDisplay(Math.round(start));
    }, 16);
    return () => clearInterval(id);
  }, [value, duration]);
  return <>{display}</>;
}

// ── Score bar ─────────────────────────────────────────
function ScoreBar({ label, score, max = 10 }: { label: string; score: number; max?: number }) {
  const pct = (score / max) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{score.toFixed(1)}/{max}</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: pct >= 70 ? "#00D4AA" : pct >= 50 ? "#FBBF24" : "#FF6B6B" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────
const InterviewSimulatorPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("setup");

  // Setup
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [interviewType, setInterviewType] = useState("Mixed");

  // Interview
  const [questions, setQuestions] = useState<SimQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [inputMode, setInputMode] = useState<"type" | "speak">("type");
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [currentEval, setCurrentEval] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [idealOpen, setIdealOpen] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Timer ───────────────────────────────────────────
  useEffect(() => {
    if (phase === "interview" && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      }), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, currentQ]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // ── Speech Recognition ──────────────────────────────
  const startRecording = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Speech recognition not supported"); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    let finalText = answerText;
    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
        else interim = e.results[i][0].transcript;
      }
      setAnswerText(finalText + interim);
    };
    recognition.onerror = (e: any) => { if (e.error !== "no-speech") console.error(e.error); };
    recognition.onend = () => { if (isRecording) recognition.start(); };
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [answerText, isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); }
    setIsRecording(false);
  }, []);

  // ── Generate questions ──────────────────────────────
  const startInterview = async () => {
    if (!role || !level) { toast.error("Select a role and experience level"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("interview-simulator", {
        body: { action: "generate-questions", role, level, interviewType },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setQuestions(data.questions);
      setPhase("interview");
      setTimeLeft(120);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  // ── Submit answer ───────────────────────────────────
  const submitAnswer = async () => {
    stopRecording();
    if (!answerText.trim()) { toast.error("Please provide an answer"); return; }
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("evaluating");
    try {
      const q = questions[currentQ];
      const { data, error } = await supabase.functions.invoke("interview-simulator", {
        body: {
          action: "evaluate-answer",
          role, question: q.question, answer: answerText,
          keyConcepts: q.key_concepts,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      const evaluation = data as Evaluation;
      setCurrentEval(evaluation);
      setAnswers(prev => [...prev, { question: q, answer: answerText, evaluation }]);
      setPhase("feedback");
    } catch (err: any) {
      toast.error(err.message || "Failed to evaluate");
      setPhase("interview");
    }
  };

  const skipQuestion = () => {
    const q = questions[currentQ];
    const skipEval: Evaluation = { relevance: 0, clarity: 0, technical: 0, overall: 0, keywords_found: [], keywords_missed: q.key_concepts, feedback: "Question skipped.", ideal_hint: "" };
    setAnswers(prev => [...prev, { question: q, answer: "(skipped)", evaluation: skipEval }]);
    goNext();
  };

  const goNext = () => {
    setCurrentEval(null);
    setAnswerText("");
    setIdealOpen(false);
    if (currentQ + 1 >= questions.length) {
      setPhase("report");
    } else {
      setCurrentQ(currentQ + 1);
      setPhase("interview");
      setTimeLeft(120);
    }
  };

  const restart = () => {
    setPhase("setup");
    setQuestions([]);
    setCurrentQ(0);
    setAnswers([]);
    setCurrentEval(null);
    setAnswerText("");
    setTimeLeft(120);
  };

  // ── Report calculations ─────────────────────────────
  const totalScore = answers.length
    ? Math.round(answers.reduce((s, a) => s + a.evaluation.overall, 0) / answers.length * 10)
    : 0;
  const strongest = answers.length ? answers.reduce((a, b) => a.evaluation.overall > b.evaluation.overall ? a : b) : null;
  const weakest = answers.length ? answers.reduce((a, b) => a.evaluation.overall < b.evaluation.overall ? a : b) : null;
  const scoreLabel = totalScore >= 80 ? "Excellent 🟢" : totalScore >= 60 ? "Good 🟡" : totalScore >= 40 ? "Needs Work 🟠" : "Keep Practicing 🔴";

  return (
    <div className="min-h-screen bg-[#0A0A1A] text-foreground">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <AnimatePresence mode="wait">

          {/* ═══ SETUP ═══ */}
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              {/* Header */}
              <div className="text-center space-y-3">
                <h1 className="text-4xl md:text-5xl font-heading font-bold">🎤 AI Interview Simulator</h1>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                  Practice with a real AI interviewer.<br />Get scored. Get better. Get hired.
                </p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { emoji: "📝", label: "8 Questions", desc: "per session" },
                  { emoji: "⏱️", label: "2 Minutes", desc: "per answer" },
                  { emoji: "🎯", label: "3 Dimensions", desc: "scored" },
                ].map(s => (
                  <div key={s.label} className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 text-center">
                    <span className="text-2xl">{s.emoji}</span>
                    <p className="font-semibold mt-2">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>

              {/* Setup card */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 md:p-8 space-y-8">
                {/* Step 1 — Role */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Step 1 — Target Role</h3>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map(r => (
                      <button key={r.label} onClick={() => setRole(r.label)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${role === r.label ? "bg-[#FF6B6B]/15 border-[#FF6B6B] text-[#FF6B6B]" : "bg-[#0A0A1A] border-[#1F2937] text-muted-foreground hover:border-[#FF6B6B]/40"}`}>
                        {r.emoji} {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2 — Level */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Step 2 — Experience Level</h3>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map(l => (
                      <button key={l.label} onClick={() => setLevel(l.label)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${level === l.label ? "bg-[#00D4AA]/15 border-[#00D4AA] text-[#00D4AA]" : "bg-[#0A0A1A] border-[#1F2937] text-muted-foreground hover:border-[#00D4AA]/40"}`}>
                        {l.emoji} {l.label} <span className="text-xs opacity-60 ml-1">({l.desc})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3 — Type */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Step 3 — Interview Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map(t => (
                      <button key={t.label} onClick={() => setInterviewType(t.label)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${interviewType === t.label ? "bg-primary/15 border-primary text-primary" : "bg-[#0A0A1A] border-[#1F2937] text-muted-foreground hover:border-primary/40"}`}>
                        {t.emoji} {t.label} {t.desc && <span className="text-xs opacity-60 ml-1">({t.desc})</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={startInterview} disabled={loading || !role || !level}
                  className="w-full py-4 bg-[#FF6B6B] text-white rounded-xl font-bold text-lg hover:brightness-110 transition-all disabled:opacity-40 flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  {loading ? "Generating Questions..." : "Start Interview →"}
                </button>
                {!loading && <p className="text-center text-xs text-muted-foreground">Your AI interviewer is ready</p>}
              </div>
            </motion.div>
          )}

          {/* ═══ INTERVIEW ═══ */}
          {phase === "interview" && questions.length > 0 && (
            <motion.div key="interview" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-6">
              {/* Top bar */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Question {currentQ + 1} of {questions.length}</span>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[#FF6B6B]" />
                  <span className={`font-mono font-bold ${timeLeft <= 30 ? "text-[#FF6B6B] animate-pulse" : "text-foreground"}`}>{formatTime(timeLeft)}</span>
                  <span className="text-muted-foreground">remaining</span>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1.5 justify-center">
                {questions.map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full transition-all ${i < currentQ ? "bg-[#FF6B6B]" : i === currentQ ? "bg-[#FF6B6B] ring-2 ring-[#FF6B6B]/30 scale-125" : "bg-[#1F2937]"}`} />
                ))}
              </div>

              {/* AI Interviewer card */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center text-lg">🤖</div>
                  <div>
                    <p className="font-semibold text-foreground">AI Interviewer — TechCorp Senior Engineer</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${questions[currentQ].difficulty === "hard" ? "bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/25" : questions[currentQ].difficulty === "medium" ? "bg-amber-400/10 text-amber-400 border-amber-400/25" : "bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/25"}`}>{questions[currentQ].difficulty}</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-muted border border-border">{questions[currentQ].type}</span>
                    </div>
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-heading font-bold leading-relaxed">
                  "{questions[currentQ].question}"
                </h2>
              </div>

              {/* Answer section */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 space-y-4">
                {/* Tabs */}
                <div className="flex gap-2">
                  <button onClick={() => { setInputMode("type"); stopRecording(); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === "type" ? "bg-[#FF6B6B]/15 text-[#FF6B6B] border border-[#FF6B6B]/30" : "text-muted-foreground hover:text-foreground"}`}>
                    <Keyboard className="w-4 h-4" /> Type Answer
                  </button>
                  <button onClick={() => setInputMode("speak")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === "speak" ? "bg-[#00D4AA]/15 text-[#00D4AA] border border-[#00D4AA]/30" : "text-muted-foreground hover:text-foreground"}`}>
                    <Mic className="w-4 h-4" /> Speak Answer
                  </button>
                </div>

                {inputMode === "type" ? (
                  <div className="relative">
                    <textarea
                      value={answerText}
                      onChange={e => setAnswerText(e.target.value.slice(0, 500))}
                      placeholder="Your answer..."
                      rows={5}
                      className="w-full bg-[#0A0A1A] border border-[#1F2937] rounded-xl p-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[#FF6B6B] resize-none"
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">{answerText.length}/500</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="min-h-[120px] bg-[#0A0A1A] border border-[#1F2937] rounded-xl p-4">
                      {answerText ? (
                        <p className="text-sm leading-relaxed">{answerText}</p>
                      ) : (
                        <p className="text-muted-foreground/40 text-sm italic">
                          {isRecording ? "Listening... start speaking" : "Click record to start"}
                        </p>
                      )}
                    </div>
                    {isRecording && (
                      <div className="flex justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <motion.div key={i} className="w-1 bg-[#00D4AA] rounded-full"
                            animate={{ height: [12, 28, 12] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                          />
                        ))}
                      </div>
                    )}
                    <button onClick={isRecording ? stopRecording : startRecording}
                      className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${isRecording ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-[#00D4AA]/15 text-[#00D4AA] border border-[#00D4AA]/30 hover:bg-[#00D4AA]/25"}`}>
                      {isRecording ? <><MicOff className="w-4 h-4" /> Stop Recording</> : <><Mic className="w-4 h-4" /> Start Recording</>}
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={submitAnswer} disabled={!answerText.trim()}
                    className="flex-1 py-3.5 bg-[#FF6B6B] text-white rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                    Submit Answer <ChevronRight className="w-4 h-4" />
                  </button>
                  <button onClick={skipQuestion}
                    className="px-5 py-3.5 border border-[#1F2937] text-muted-foreground rounded-xl hover:text-foreground hover:border-[#FF6B6B]/40 transition-all flex items-center gap-2">
                    <SkipForward className="w-4 h-4" /> Skip
                  </button>
                </div>
              </div>

              {/* Previous answers sidebar */}
              {answers.length > 0 && (
                <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Previous Answers</p>
                  {answers.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1">
                      <span className="text-muted-foreground">Q{i + 1} {a.evaluation.overall > 0 ? "✅" : "⏭️"}</span>
                      <span className="font-semibold" style={{ color: a.evaluation.overall >= 7 ? "#00D4AA" : a.evaluation.overall >= 5 ? "#FBBF24" : "#FF6B6B" }}>
                        {a.evaluation.overall > 0 ? `${a.evaluation.overall.toFixed(1)}/10` : "Skipped"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ EVALUATING ═══ */}
          {phase === "evaluating" && (
            <motion.div key="evaluating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 gap-6">
              <Loader2 className="w-12 h-12 text-[#FF6B6B] animate-spin" />
              <p className="text-lg text-muted-foreground">AI is evaluating your answer...</p>
            </motion.div>
          )}

          {/* ═══ FEEDBACK ═══ */}
          {phase === "feedback" && currentEval && (
            <motion.div key="feedback" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
              <h3 className="text-xl font-heading font-bold">Answer Evaluation</h3>

              {/* Score bars */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 space-y-4">
                <ScoreBar label="Relevance" score={currentEval.relevance} />
                <ScoreBar label="Clarity" score={currentEval.clarity} />
                <ScoreBar label="Technical" score={currentEval.technical} />
                <div className="pt-2 border-t border-[#1F2937]">
                  <ScoreBar label="Overall" score={currentEval.overall} />
                </div>
              </div>

              {/* Keywords */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 space-y-4">
                {currentEval.keywords_found.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Keywords detected</p>
                    <div className="flex flex-wrap gap-2">
                      {currentEval.keywords_found.map((k, i) => (
                        <motion.span key={k} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/25 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {k}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
                {currentEval.keywords_missed.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Keywords missed</p>
                    <div className="flex flex-wrap gap-2">
                      {currentEval.keywords_missed.map((k, i) => (
                        <motion.span key={k} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/25 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> {k}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Feedback */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 space-y-4">
                <p className="text-sm font-medium text-foreground">AI Feedback</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{currentEval.feedback}</p>

                {currentEval.ideal_hint && (
                  <div>
                    <button onClick={() => setIdealOpen(!idealOpen)}
                      className="flex items-center gap-2 text-sm text-[#00D4AA] hover:underline">
                      <ChevronDown className={`w-4 h-4 transition-transform ${idealOpen ? "rotate-180" : ""}`} />
                      See Ideal Answer Structure
                    </button>
                    <AnimatePresence>
                      {idealOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <p className="mt-3 p-4 bg-[#0A0A1A] border border-[#1F2937] rounded-xl text-sm text-muted-foreground leading-relaxed">
                            {currentEval.ideal_hint}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <button onClick={goNext}
                className="w-full py-3.5 bg-[#FF6B6B] text-white rounded-xl font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2">
                {currentQ + 1 >= questions.length ? "View Report" : "Next Question →"}
              </button>
            </motion.div>
          )}

          {/* ═══ REPORT ═══ */}
          {phase === "report" && (
            <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
              {/* Big score */}
              <div className="text-center space-y-3">
                <p className="text-muted-foreground text-sm uppercase tracking-wider">Interview Score</p>
                <div className="text-7xl font-heading font-bold" style={{ color: totalScore >= 70 ? "#00D4AA" : totalScore >= 50 ? "#FBBF24" : "#FF6B6B" }}>
                  <AnimatedNumber value={totalScore} /><span className="text-3xl text-muted-foreground">/100</span>
                </div>
                <p className="text-lg">{scoreLabel}</p>
                <p className="text-sm text-muted-foreground">
                  {totalScore >= 60 ? `You are interview-ready for ${level.toLowerCase()} roles` : "Keep practicing to improve your score"}
                </p>
              </div>

              {/* Performance table */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1F2937]">
                  <h3 className="font-semibold">Performance Breakdown</h3>
                </div>
                <div className="divide-y divide-[#1F2937]">
                  {answers.map((a, i) => (
                    <div key={i} className="px-6 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Q{i + 1}</span>
                        <span className="text-sm font-medium">{a.question.topic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: a.evaluation.overall >= 7 ? "#00D4AA" : a.evaluation.overall >= 5 ? "#FBBF24" : "#FF6B6B" }}>
                          {a.evaluation.overall.toFixed(1)}/10
                        </span>
                        {a.evaluation.overall >= 7 ? <CheckCircle2 className="w-4 h-4 text-[#00D4AA]" /> :
                          a.evaluation.overall >= 5 ? <span className="text-amber-400">🟡</span> :
                          <XCircle className="w-4 h-4 text-[#FF6B6B]" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strongest / Weakest */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#00D4AA]/5 border border-[#00D4AA]/20 rounded-xl p-5">
                  <p className="text-xs text-[#00D4AA] uppercase tracking-wider mb-1">Strongest Answer</p>
                  <p className="font-semibold text-sm">{strongest?.question.topic}</p>
                  <p className="text-lg font-bold text-[#00D4AA]">{strongest?.evaluation.overall.toFixed(1)}/10</p>
                </div>
                <div className="bg-[#FF6B6B]/5 border border-[#FF6B6B]/20 rounded-xl p-5">
                  <p className="text-xs text-[#FF6B6B] uppercase tracking-wider mb-1">Weakest Answer</p>
                  <p className="font-semibold text-sm">{weakest?.question.topic}</p>
                  <p className="text-lg font-bold text-[#FF6B6B]">{weakest?.evaluation.overall.toFixed(1)}/10</p>
                </div>
              </div>

              {/* Improvement areas */}
              <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 space-y-3">
                <h3 className="font-semibold">Top Improvement Areas</h3>
                {answers
                  .filter(a => a.evaluation.overall > 0)
                  .sort((a, b) => a.evaluation.overall - b.evaluation.overall)
                  .slice(0, 3)
                  .map((a, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-[#FF6B6B]/10 text-[#FF6B6B] flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-muted-foreground">{a.question.topic}</span>
                    </div>
                  ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button onClick={restart}
                  className="flex-1 py-3.5 bg-[#FF6B6B] text-white rounded-xl font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Retry This Interview
                </button>
                <button onClick={() => navigate("/roadmap")}
                  className="flex-1 py-3.5 bg-[#00D4AA]/15 text-[#00D4AA] border border-[#00D4AA]/30 rounded-xl font-semibold hover:bg-[#00D4AA]/25 transition-all flex items-center justify-center gap-2">
                  + Add Weak Areas to Roadmap
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default InterviewSimulatorPage;

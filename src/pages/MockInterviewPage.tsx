import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Mic, MicOff, Play, SkipForward, ArrowLeft, Clock, Brain,
  MessageSquare, Target, Zap, CheckCircle2, AlertTriangle,
  Volume2, Loader2, BarChart3, ChevronRight, RotateCcw
} from "lucide-react";

interface InterviewQuestion {
  question: string;
  type: "technical" | "behavioral" | "situational";
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

interface AnswerEvaluation {
  technical_accuracy: number;
  communication_clarity: number;
  confidence_level: number;
  overall_score: number;
  strengths: string[];
  improvements: string[];
  ideal_answer: string;
  specific_feedback: string;
}

interface AnswerRecord {
  question: InterviewQuestion;
  transcript: string;
  duration: number;
  pauseCount: number;
  evaluation: AnswerEvaluation | null;
}

type Phase = "setup" | "interview" | "evaluating" | "feedback" | "summary";

const ROLES = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "ML Engineer", "DevOps Engineer",
  "Product Manager", "Software Architect", "Mobile Developer",
];

const MockInterviewPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("setup");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [timer, setTimer] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [currentEval, setCurrentEval] = useState<AnswerEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const speakQuestion = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const startRecording = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Speech recognition not supported in this browser"); return; }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalText = "";
    let pauses = 0;

    recognition.onresult = (e: any) => {
      if (silenceRef.current) clearTimeout(silenceRef.current);
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
        else interim = e.results[i][0].transcript;
      }
      setTranscript(finalText + interim);

      silenceRef.current = setTimeout(() => {
        pauses++;
        setPauseCount(pauses);
      }, 3000);
    };

    recognition.onerror = (e: any) => {
      if (e.error !== "no-speech") console.error("Speech error:", e.error);
    };

    recognition.onend = () => {
      if (isRecording) recognition.start();
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTimer(0);
    setTranscript("");
    setPauseCount(0);
    startTimeRef.current = Date.now();
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
    if (silenceRef.current) clearTimeout(silenceRef.current);
    setIsRecording(false);
    window.speechSynthesis.cancel();
  }, []);

  const generateQuestions = async () => {
    const selectedRole = role || customRole;
    if (!selectedRole.trim()) { toast.error("Please select or enter a role"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mock-interview", {
        body: { action: "generate-questions", role: selectedRole },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setQuestions(data.questions);
      setPhase("interview");
      setTimeout(() => speakQuestion(data.questions[0].question), 500);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    stopRecording();
    if (!transcript.trim()) { toast.error("No answer recorded"); return; }

    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    setPhase("evaluating");

    try {
      const { data, error } = await supabase.functions.invoke("mock-interview", {
        body: {
          action: "evaluate-answer",
          role: role || customRole,
          question: questions[currentQ].question,
          answer: transcript,
          questionIndex: currentQ,
          totalQuestions: questions.length,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const evaluation = data as AnswerEvaluation;
      setCurrentEval(evaluation);
      setAnswers(prev => [...prev, {
        question: questions[currentQ],
        transcript,
        duration,
        pauseCount,
        evaluation,
      }]);
      setPhase("feedback");
    } catch (err: any) {
      toast.error(err.message || "Failed to evaluate answer");
      setPhase("interview");
    }
  };

  const nextQuestion = () => {
    setCurrentEval(null);
    setTranscript("");
    if (currentQ + 1 >= questions.length) {
      setPhase("summary");
    } else {
      setCurrentQ(currentQ + 1);
      setPhase("interview");
      setTimeout(() => speakQuestion(questions[currentQ + 1].question), 500);
    }
  };

  const restartInterview = () => {
    setPhase("setup");
    setQuestions([]);
    setCurrentQ(0);
    setAnswers([]);
    setCurrentEval(null);
    setTranscript("");
    setTimer(0);
    setPauseCount(0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-secondary";
    if (score >= 50) return "text-amber-400";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-secondary/20 border-secondary/30";
    if (score >= 50) return "bg-amber-400/20 border-amber-400/30";
    return "bg-destructive/20 border-destructive/30";
  };

  const getDifficultyColor = (d: string) => {
    if (d === "easy") return "bg-secondary/15 text-secondary border-secondary/25";
    if (d === "medium") return "bg-amber-400/15 text-amber-400 border-amber-400/25";
    return "bg-destructive/15 text-destructive border-destructive/25";
  };

  const avgScore = answers.length
    ? Math.round(answers.reduce((s, a) => s + (a.evaluation?.overall_score ?? 0), 0) / answers.length)
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-heading font-bold text-lg">AI Mock Interview</h1>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* SETUP PHASE */}
        {phase === "setup" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-heading font-bold">Practice Your Interview</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                AI-powered mock interviews with real-time voice recognition and detailed feedback on every answer.
              </p>
            </div>

            <div className="card-surface p-6 space-y-5">
              <label className="text-sm font-medium text-foreground">Select Target Role</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setCustomRole(""); }}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      role === r
                        ? "bg-primary/15 border-primary text-primary"
                        : "bg-muted border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Or enter a custom role</label>
                <input
                  value={customRole}
                  onChange={e => { setCustomRole(e.target.value); setRole(""); }}
                  placeholder="e.g. Blockchain Developer"
                  className="w-full mt-1 px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                onClick={generateQuestions}
                disabled={loading || (!role && !customRole.trim())}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                {loading ? "Generating Questions..." : "Start Interview"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { icon: Mic, label: "Voice Recording", desc: "Speak naturally" },
                { icon: Brain, label: "AI Evaluation", desc: "Instant feedback" },
                { icon: BarChart3, label: "Score Breakdown", desc: "Detailed metrics" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="card-surface p-4">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INTERVIEW PHASE */}
        {phase === "interview" && questions.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Question {currentQ + 1}/{questions.length}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="card-surface p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(questions[currentQ].difficulty)}`}>
                  {questions[currentQ].difficulty}
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground border border-border">
                  {questions[currentQ].type}
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground border border-border">
                  {questions[currentQ].topic}
                </span>
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground leading-relaxed">
                {questions[currentQ].question}
              </h3>
              <button
                onClick={() => speakQuestion(questions[currentQ].question)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? "animate-pulse" : ""}`} />
                {isSpeaking ? "Speaking..." : "Read aloud"}
              </button>
            </div>

            {/* Recording Controls */}
            <div className="card-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-2xl font-mono font-bold text-foreground">{formatTime(timer)}</span>
                </div>
                {pauseCount > 0 && (
                  <div className="flex items-center gap-2 text-amber-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {pauseCount} pause{pauseCount > 1 ? "s" : ""} detected
                  </div>
                )}
              </div>

              {/* Transcript */}
              <div className="min-h-[120px] max-h-[200px] overflow-y-auto p-4 bg-muted rounded-xl border border-border">
                {transcript ? (
                  <p className="text-foreground text-sm leading-relaxed">{transcript}</p>
                ) : (
                  <p className="text-muted-foreground/50 text-sm italic">
                    {isRecording ? "Listening... start speaking" : "Click record to start answering"}
                  </p>
                )}
              </div>

              {/* Pulse animation when recording */}
              {isRecording && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-primary rounded-full animate-pulse"
                        style={{
                          height: `${12 + Math.random() * 20}px`,
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <Mic className="w-5 h-5" /> Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex-1 py-3.5 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <MicOff className="w-5 h-5" /> Stop Recording
                  </button>
                )}
                <button
                  onClick={submitAnswer}
                  disabled={!transcript.trim()}
                  className="px-6 py-3.5 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  Submit <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EVALUATING PHASE */}
        {phase === "evaluating" && (
          <div className="max-w-md mx-auto text-center space-y-6 py-20 animate-fade-in-up">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h3 className="text-xl font-heading font-bold">Evaluating Your Answer...</h3>
            <p className="text-muted-foreground">AI is analyzing technical accuracy, clarity, and confidence</p>
          </div>
        )}

        {/* FEEDBACK PHASE */}
        {phase === "feedback" && currentEval && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
            <h3 className="text-xl font-heading font-bold">Answer Feedback</h3>

            {/* Score Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Technical Accuracy", score: currentEval.technical_accuracy, icon: Target },
                { label: "Communication", score: currentEval.communication_clarity, icon: MessageSquare },
                { label: "Confidence", score: currentEval.confidence_level, icon: Zap },
                { label: "Overall", score: currentEval.overall_score, icon: BarChart3 },
              ].map(({ label, score, icon: Icon }) => (
                <div key={label} className={`card-surface p-4 border ${getScoreBg(score)}`}>
                  <Icon className={`w-5 h-5 mb-2 ${getScoreColor(score)}`} />
                  <div className={`text-3xl font-heading font-extrabold ${getScoreColor(score)}`}>{score}</div>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Time & Pauses */}
            {answers.length > 0 && (
              <div className="flex gap-4">
                <div className="card-surface p-4 flex-1 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Time Taken</p>
                    <p className="text-lg font-bold text-primary">{formatTime(answers[answers.length - 1].duration)}</p>
                  </div>
                </div>
                <div className="card-surface p-4 flex-1 flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${answers[answers.length - 1].pauseCount > 2 ? "text-amber-400" : "text-secondary"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">Pauses Detected</p>
                    <p className="text-lg font-bold">
                      {answers[answers.length - 1].pauseCount}
                      {answers[answers.length - 1].pauseCount > 2 && (
                        <span className="text-xs text-amber-400 ml-2">— practice this more</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback */}
            <div className="card-surface p-6">
              <p className="text-foreground leading-relaxed">{currentEval.specific_feedback}</p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card-surface p-5 space-y-3">
                <h4 className="text-sm font-semibold text-secondary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Strengths
                </h4>
                <ul className="space-y-2">
                  {currentEval.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-secondary mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-surface p-5 space-y-3">
                <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Areas to Improve
                </h4>
                <ul className="space-y-2">
                  {currentEval.improvements.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Side-by-side answers */}
            <div className="card-surface p-6 space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Your Answer vs Ideal Answer</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-xl border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">YOUR ANSWER</p>
                  <p className="text-sm text-foreground leading-relaxed">{answers[answers.length - 1]?.transcript}</p>
                </div>
                <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/20">
                  <p className="text-xs font-medium text-secondary mb-2">IDEAL ANSWER</p>
                  <p className="text-sm text-foreground leading-relaxed">{currentEval.ideal_answer}</p>
                </div>
              </div>
            </div>

            <button
              onClick={nextQuestion}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {currentQ + 1 >= questions.length ? "View Summary" : "Next Question"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SUMMARY PHASE */}
        {phase === "summary" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
            <div className="text-center space-y-3">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto ${getScoreBg(avgScore)}`}>
                <span className={`text-3xl font-heading font-extrabold ${getScoreColor(avgScore)}`}>{avgScore}</span>
              </div>
              <h2 className="text-2xl font-heading font-bold">Interview Complete</h2>
              <p className="text-muted-foreground">Here's how you performed across all {answers.length} questions</p>
            </div>

            {/* Per-question breakdown */}
            <div className="space-y-4">
              {answers.map((a, i) => (
                <div key={i} className="card-surface p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full border mb-2 ${getDifficultyColor(a.question.difficulty)}`}>
                        {a.question.difficulty}
                      </span>
                      <p className="text-sm font-medium text-foreground">{a.question.question}</p>
                    </div>
                    <div className={`text-2xl font-heading font-bold ${getScoreColor(a.evaluation?.overall_score ?? 0)}`}>
                      {a.evaluation?.overall_score ?? 0}
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>⏱ {formatTime(a.duration)}</span>
                    <span>⏸ {a.pauseCount} pause{a.pauseCount !== 1 ? "s" : ""}</span>
                    <span>🎯 Tech: {a.evaluation?.technical_accuracy}</span>
                    <span>💬 Clarity: {a.evaluation?.communication_clarity}</span>
                    <span>💪 Confidence: {a.evaluation?.confidence_level}</span>
                  </div>
                  {a.pauseCount > 2 && (
                    <p className="text-xs text-amber-400 mt-2">
                      ⚠️ You paused {a.pauseCount} times — practice this topic more
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={restartInterview}
                className="flex-1 py-3.5 bg-muted border border-border text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:brightness-110 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MockInterviewPage;

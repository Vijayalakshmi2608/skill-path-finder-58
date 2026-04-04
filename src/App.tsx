import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AnalyzeProvider } from "./contexts/AnalyzeContext";
import PageTransition from "./components/PageTransition";
import Index from "./pages/Index";
import AnalyzePage from "./pages/AnalyzePage";
import ResultsPage from "./pages/ResultsPage";
import RoadmapPage from "./pages/RoadmapPage";
import ChatPage from "./pages/ChatPage";
import CollegeDashboard from "./pages/CollegeDashboard";
import MarketIntelligence from "./pages/MarketIntelligence";
import MockInterviewPage from "./pages/MockInterviewPage";
import StudyBuddyPage from "./pages/StudyBuddyPage";
import PortfolioPage from "./pages/PortfolioPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ResumeAnalysisPage from "./pages/ResumeAnalysisPage";
import ApiPage from "./pages/ApiPage";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import InterviewSimulatorPage from "./pages/InterviewSimulatorPage";
import SalaryIntelligencePage from "./pages/SalaryIntelligencePage";
import LinkedInAnalyzerPage from "./pages/LinkedInAnalyzerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const wrap = (el: React.ReactNode) => <PageTransition>{el}</PageTransition>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnalyzeProvider>
            <Routes>
              <Route path="/" element={wrap(<Index />)} />
              <Route path="/analyze" element={wrap(<AnalyzePage />)} />
              <Route path="/results" element={wrap(<ResultsPage />)} />
              <Route path="/roadmap" element={wrap(<RoadmapPage />)} />
              <Route path="/chat" element={wrap(<ChatPage />)} />
              <Route path="/college-dashboard" element={wrap(<CollegeDashboard />)} />
              <Route path="/market-intelligence" element={wrap(<MarketIntelligence />)} />
              <Route path="/mock-interview" element={wrap(<MockInterviewPage />)} />
              <Route path="/study-buddy" element={wrap(<StudyBuddyPage />)} />
              <Route path="/portfolio" element={wrap(<PortfolioPage />)} />
              <Route path="/leaderboard" element={wrap(<LeaderboardPage />)} />
              <Route path="/resume-analysis" element={wrap(<ResumeAnalysisPage />)} />
              <Route path="/api" element={wrap(<ApiPage />)} />
              <Route path="/interview-simulator" element={wrap(<InterviewSimulatorPage />)} />
              <Route path="/salary-intelligence" element={wrap(<SalaryIntelligencePage />)} />
              <Route path="/linkedin-analyzer" element={wrap(<LinkedInAnalyzerPage />)} />
              <Route path="/auth" element={wrap(<AuthPage />)} />
              <Route path="/reset-password" element={wrap(<ResetPasswordPage />)} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnalyzeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

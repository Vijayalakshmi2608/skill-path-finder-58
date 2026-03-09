import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AnalyzePage from "./pages/AnalyzePage";
import ResultsPage from "./pages/ResultsPage";
import RoadmapPage from "./pages/RoadmapPage";
import ChatPage from "./pages/ChatPage";
import CollegeDashboard from "./pages/CollegeDashboard";
import MarketIntelligence from "./pages/MarketIntelligence";
import MockInterviewPage from "./pages/MockInterviewPage";
import StudyBuddyPage from "./pages/StudyBuddyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/college-dashboard" element={<CollegeDashboard />} />
          <Route path="/market-intelligence" element={<MarketIntelligence />} />
          <Route path="/mock-interview" element={<MockInterviewPage />} />
          <Route path="/study-buddy" element={<StudyBuddyPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

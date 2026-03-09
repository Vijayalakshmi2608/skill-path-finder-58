import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoadmapHeader from "@/components/roadmap/RoadmapHeader";
import WeekOverview from "@/components/roadmap/WeekOverview";
import DayByDay from "@/components/roadmap/DayByDay";
import ResourcesLibrary from "@/components/roadmap/ResourcesLibrary";
import PortfolioCTA from "@/components/roadmap/PortfolioCTA";
import ProgressTracker from "@/components/roadmap/ProgressTracker";
import ShareExport from "@/components/roadmap/ShareExport";

const RoadmapPage = () => {
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  const toggleDay = useCallback((day: number) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  }, []);

  // Simple streak calc: consecutive completed days from day 1
  let streak = 0;
  for (let i = 1; i <= 30; i++) {
    if (completedDays.has(i)) streak++;
    else break;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <RoadmapHeader completedDays={completedDays.size} />
        <WeekOverview />
        <DayByDay completedDays={completedDays} toggleDay={toggleDay} />
        <ResourcesLibrary />
        <PortfolioCTA completedDays={completedDays.size} />
        <ProgressTracker completedDays={completedDays.size} streak={streak} />
        <ShareExport />
      </main>
      <Footer />
    </div>
  );
};

export default RoadmapPage;

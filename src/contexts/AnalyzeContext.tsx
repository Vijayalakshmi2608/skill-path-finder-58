import { createContext, useContext, useState, ReactNode } from "react";
import type { ParsedResume, SkillGapAnalysis, GeneratedRoadmap } from "@/lib/ai";

export interface AnalyzeData {
  // Step 1
  resumeText?: string;
  linkedinUrl?: string;
  fileName?: string;
  detectedName?: string;
  detectedSkills?: string[];
  detectedExperience?: string;
  detectedEducation?: string;
  // Step 2
  jobTitle?: string;
  targetCompanies?: string[];
  experienceLevel?: string;
  // Step 3
  timeCommitment?: string;
  learningStyles?: string[];
  studentStatus?: string;
  budget?: number;
  // AI Results
  parsedResume?: ParsedResume;
  skillAnalysis?: SkillGapAnalysis;
  generatedRoadmap?: GeneratedRoadmap;
}

interface AnalyzeContextType {
  data: AnalyzeData;
  setData: (d: Partial<AnalyzeData>) => void;
}

const AnalyzeContext = createContext<AnalyzeContextType | null>(null);

export const useAnalyze = () => {
  const ctx = useContext(AnalyzeContext);
  if (!ctx) throw new Error("useAnalyze must be inside AnalyzeProvider");
  return ctx;
};

export const AnalyzeProvider = ({ children }: { children: ReactNode }) => {
  const [data, setDataState] = useState<AnalyzeData>({});
  const setData = (partial: Partial<AnalyzeData>) =>
    setDataState((prev) => ({ ...prev, ...partial }));
  return (
    <AnalyzeContext.Provider value={{ data, setData }}>
      {children}
    </AnalyzeContext.Provider>
  );
};

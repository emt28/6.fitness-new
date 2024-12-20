import { Assessment } from './assessment';
import { TestProtocol } from './protocol';
import { Athlete } from './athlete';

export interface PerformanceData {
  date: string;
  value: number;
  performanceLevel: string;
  protocol: TestProtocol;
}

export interface AthleteReport {
  athlete: Athlete;
  assessments: Assessment[];
  protocols: TestProtocol[];
  performanceData: Record<string, PerformanceData[]>;
  summary: {
    totalAssessments: number;
    improvementRate: number;
    strengths: string[];
    areasForImprovement: string[];
  };
}
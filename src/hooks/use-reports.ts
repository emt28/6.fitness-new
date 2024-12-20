import { useQuery } from '@tanstack/react-query';
import { getAthleteAssessments } from '@/lib/api';
import { useAthletes } from './use-athletes';
import { useProtocols } from './use-protocols';
import { AthleteReport, PerformanceData } from '@/types/report';
import { Assessment } from '@/types/assessment';
import { TestProtocol } from '@/types/protocol';
import { Athlete } from '@/types/athlete';

function calculateImprovementRate(assessments: Assessment[], protocols: TestProtocol[]): number {
  let improvements = 0;
  let totalComparisons = 0;

  protocols.forEach(protocol => {
    const protocolAssessments = assessments
      .filter(a => a.protocolId === protocol.id)
      .sort((a, b) => new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime());

    for (let i = 1; i < protocolAssessments.length; i++) {
      const current = protocolAssessments[i].value;
      const previous = protocolAssessments[i - 1].value;
      
      if (protocol.criteria === 'lower') {
        if (current < previous) improvements++;
      } else {
        if (current > previous) improvements++;
      }
      totalComparisons++;
    }
  });

  return totalComparisons > 0 ? (improvements / totalComparisons) * 100 : 0;
}

function analyzePerformance(
  assessments: Assessment[],
  protocols: TestProtocol[]
): { strengths: string[]; areasForImprovement: string[] } {
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];

  protocols.forEach(protocol => {
    const protocolAssessments = assessments
      .filter(a => a.protocolId === protocol.id)
      .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());

    if (protocolAssessments.length > 0) {
      const latestAssessment = protocolAssessments[0];
      if (latestAssessment.performanceLevel === 'excellent') {
        strengths.push(protocol.name);
      } else if (latestAssessment.performanceLevel === 'needs_improvement') {
        areasForImprovement.push(protocol.name);
      }
    }
  });

  return { strengths, areasForImprovement };
}

function generateAthleteReport(
  athlete: Athlete,
  assessments: Assessment[],
  protocols: TestProtocol[]
): AthleteReport {
  const performanceData: Record<string, PerformanceData[]> = {};
  
  protocols.forEach(protocol => {
    const protocolAssessments = assessments
      .filter(a => a.protocolId === protocol.id)
      .sort((a, b) => new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime());

    if (protocolAssessments.length > 0) {
      performanceData[protocol.id] = protocolAssessments.map(assessment => ({
        date: assessment.assessedAt,
        value: assessment.value,
        performanceLevel: assessment.performanceLevel,
        protocol,
      }));
    }
  });

  const { strengths, areasForImprovement } = analyzePerformance(assessments, protocols);

  return {
    athlete,
    assessments,
    protocols,
    performanceData,
    summary: {
      totalAssessments: assessments.length,
      improvementRate: calculateImprovementRate(assessments, protocols),
      strengths,
      areasForImprovement,
    },
  };
}

export function useAthleteReport(athleteId: string) {
  const { data: athletes } = useAthletes();
  const { data: protocols } = useProtocols();
  const { data: assessments } = useQuery({
    queryKey: ['assessments', athleteId],
    queryFn: () => getAthleteAssessments(athleteId),
    enabled: !!athleteId,
  });

  return useQuery({
    queryKey: ['report', athleteId],
    queryFn: () => {
      const athlete = athletes?.find(a => a.id === athleteId);
      if (!athlete || !protocols || !assessments) {
        throw new Error('Required data not available');
      }
      return generateAthleteReport(athlete, assessments, protocols);
    },
    enabled: !!athleteId && !!athletes && !!protocols && !!assessments,
  });
}
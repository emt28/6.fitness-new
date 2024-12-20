import { Assessment } from './assessment';
import { TestProtocol } from './protocol';
import { User } from './auth';

export interface ActivityItem {
  id: string;
  type: 'assessment' | 'note' | 'template' | 'athlete';
  description: string;
  user: User;
  timestamp: string;
}

export interface UserActivityStats {
  userId: string;
  userName: string;
  assessmentCount: number;
  lastActive: string;
}

export interface DashboardStats {
  totalAthletes: number;
  activeAthletes: number;
  totalAssessments: number;
  assessmentsTrend: number;
  protocols: TestProtocol[];
  recentAssessments: Assessment[];
  recentActivities: ActivityItem[];
  userActivity: UserActivityStats[];
  performanceDistribution: {
    excellent: number;
    median: number;
    needsImprovement: number;
  };
  templateUsage: {
    templateId: string;
    templateName: string;
    useCount: number;
  }[];
}
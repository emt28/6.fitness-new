import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}
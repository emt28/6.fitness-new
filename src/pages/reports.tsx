import { useState } from 'react';
import { useAthletes } from '@/hooks/use-athletes';
import { useAthleteReport } from '@/hooks/use-reports';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { PerformanceChart } from '@/components/reports/performance-chart';
import { ReportSummary } from '@/components/reports/report-summary';
import { AttendanceReport } from '@/components/reports/attendance-report';
import { ReportOptions } from '@/components/reports/report-options';
import { useAthleteAttendanceStats } from '@/hooks/use-attendance';
import { useTrainingLog } from '@/hooks/use-feedback';
import { generatePDF } from '@/lib/pdf-generator';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ReportsPage() {
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: athletes, isLoading: athletesLoading } = useAthletes();
  const { data: report, isLoading: reportLoading } = useAthleteReport(selectedAthleteId);
  const { data: attendanceStats } = useAthleteAttendanceStats(selectedAthleteId);
  const { data: trainingLog } = useTrainingLog(selectedAthleteId);
  const { can } = usePermissions();

  const isDetailedView = can('manage_assessments');

  const handleGenerateReport = async (options: any) => {
    if (!report || !attendanceStats) return;
    
    setIsGenerating(true);
    try {
      console.log('Report:', report);
      console.log('Athlete Name:', report?.athlete?.name);
      console.log('Options:', options);

      const doc = generatePDF(
        report,
        options.includeAttendance ? attendanceStats : undefined,
        options.includeTrainingLog ? trainingLog : undefined,
        isDetailedView,
        options.dateRange
      );

      console.log('Generated PDF:', doc);

      const athleteName = report?.athlete?.name ?? 'unknown';
      doc.save(`${athleteName.toLowerCase().replace(/\s+/g, '-')}-report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (athletesLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Performance Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <label htmlFor="athlete" className="block text-sm font-medium text-gray-700">
              Select Athlete
            </label>
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select an athlete</option>
              {athletes?.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedAthleteId && (
          <div className="md:col-span-1">
            <ReportOptions
              onGenerate={handleGenerateReport}
              isLoading={isGenerating}
            />
          </div>
        )}
      </div>

      {reportLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        selectedAthleteId && report && (
          <div className="space-y-8">
            <ReportSummary report={report} detailed={isDetailedView} />

            <Tabs defaultValue="performance" className="space-y-6">
              <TabsList>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="training">Training Log</TabsTrigger>
              </TabsList>

              <TabsContent value="performance">
                <div className="grid grid-cols-1 gap-8">
                  {Object.entries(report.performanceData).map(([protocolId, data]) => {
                    const protocol = report.protocols.find(p => p.id === protocolId);
                    if (!protocol) return null;

                    return (
                      <div key={protocolId} className="bg-white p-6 rounded-lg shadow-sm">
                        <PerformanceChart
                          data={data}
                          title={protocol.name}
                          unit={protocol.unit}
                        />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="attendance">
                {attendanceStats && <AttendanceReport stats={attendanceStats} />}
              </TabsContent>

              <TabsContent value="training">
                {trainingLog && trainingLog.length > 0 ? (
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Training History</h3>
                    <div className="space-y-4">
                      {trainingLog.map((entry) => (
                        <div key={entry.id} className="border-b pb-4">
                          <h4 className="font-medium">{entry.feedback.mainFocus}</h4>
                          <p className="text-sm text-gray-600">{entry.feedback.notes}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No training logs available
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )
      )}
    </div>
  );
}
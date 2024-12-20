import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { AthleteReport } from '@/types/report';
import { AttendanceStats } from '@/types/attendance';
import { TrainingLogEntry } from '@/types/feedback';

export function generatePDF(
  report: AthleteReport,
  attendanceStats?: AttendanceStats,
  trainingLog?: TrainingLogEntry[],
  detailed: boolean = false,
  dateRange: string = '3m'
) {
  const doc = new jsPDF();
  const { athlete, summary, assessments, protocols } = report;

  // Title and Header
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text('6.fitness', 20, 20);
  
  doc.setFontSize(20);
  doc.setTextColor(0);
  doc.text('Athlete Performance Report', 20, 35);

  // Athlete Information
  doc.setFontSize(16);
  doc.setTextColor(75, 85, 99);
  doc.text('Athlete Profile', 20, 55);
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  const profileData = [
    ['Name', athlete.name],
    ['Age', `${new Date().getFullYear() - new Date(athlete.dateOfBirth).getFullYear()} years`],
    ['Date of Birth', format(new Date(athlete.dateOfBirth), 'MMMM d, yyyy')],
    ['World Tennis Number', athlete.wtn.toString()],
    ['Dominant Hand', athlete.dominantHand],
  ];

  autoTable(doc, {
    startY: 65,
    head: [],
    body: profileData,
    theme: 'plain',
    styles: { fontSize: 12, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 100 },
    },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 20;

  // Performance Summary
  doc.setFontSize(16);
  doc.setTextColor(75, 85, 99);
  doc.text('Performance Summary', 20, currentY);
  currentY += 15;

  const summaryData = [
    ['Total Assessments', summary.totalAssessments.toString()],
    ['Improvement Rate', `${summary.improvementRate.toFixed(1)}%`],
    ['Areas of Excellence', summary.strengths.join(', ') || 'None identified'],
    ['Areas for Improvement', summary.areasForImprovement.join(', ') || 'None identified'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: summaryData,
    theme: 'striped',
    styles: { fontSize: 11, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 120 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 20;

  // Assessment History
  doc.setFontSize(16);
  doc.setTextColor(75, 85, 99);
  doc.text('Assessment History', 20, currentY);
  currentY += 15;

  // Group assessments by protocol
  const assessmentsByProtocol = protocols.reduce((acc, protocol) => {
    const protocolAssessments = assessments
      .filter(a => a.protocolId === protocol.id)
      .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());

    if (protocolAssessments.length > 0) {
      acc[protocol.id] = {
        protocol,
        assessments: protocolAssessments,
      };
    }
    return acc;
  }, {} as Record<string, { protocol: TestProtocol; assessments: Assessment[] }>);

  Object.entries(assessmentsByProtocol).forEach(([_, { protocol, assessments }]) => {
    const tableData = assessments.map(assessment => [
      format(new Date(assessment.assessedAt), 'MMM d, yyyy'),
      assessment.value.toString(),
      assessment.performanceLevel.replace('_', ' '),
      assessment.notes || '-',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [[
        { content: protocol.name, colSpan: 4, styles: { halign: 'center', fillColor: [59, 130, 246] } },
      ], [
        'Date',
        `Result (${protocol.unit})`,
        'Performance',
        'Notes',
      ]],
      body: tableData,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 80 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Add new page if needed
    if (currentY > doc.internal.pageSize.height - 20) {
      doc.addPage();
      currentY = 20;
    }
  });

  // Attendance Summary (if available)
  if (attendanceStats) {
    doc.setFontSize(16);
    doc.setTextColor(75, 85, 99);
    doc.text('Attendance Overview', 20, currentY);
    currentY += 15;

    const attendanceData = [
      ['Total Sessions', attendanceStats.totalSessions.toString()],
      ['Attendance Rate', `${attendanceStats.attendanceRate.toFixed(1)}%`],
      ['Present', attendanceStats.attendedSessions.toString()],
      ['Late', attendanceStats.lateSessions.toString()],
      ['Absent', attendanceStats.missedSessions.toString()],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [],
      body: attendanceData,
      theme: 'striped',
      styles: { fontSize: 11, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 40 },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;
  }

  // Training Log (if available)
  if (trainingLog && trainingLog.length > 0) {
    if (currentY > doc.internal.pageSize.height - 100) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.setTextColor(75, 85, 99);
    doc.text('Recent Training Sessions', 20, currentY);
    currentY += 15;

    const trainingData = trainingLog.map(entry => [
      format(new Date(entry.date), 'MMM d, yyyy'),
      entry.feedback.mainFocus,
      entry.feedback.drills.join(', '),
      entry.feedback.notes || '-',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Focus', 'Drills', 'Notes']],
      body: trainingData,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 50 },
        3: { cellWidth: 60 },
      },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text(
      `Generated on ${format(new Date(), 'MMM d, yyyy')} - Page ${i} of ${pageCount}`,
      20,
      doc.internal.pageSize.height - 10
    );
  }

  return doc;
}
import { useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SessionModal } from '@/components/attendance/session-modal';
import { AttendanceModal } from '@/components/attendance/attendance-modal';
import { TemplateManager } from '@/components/attendance/template-manager';
import { useSessions } from '@/hooks/use-attendance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const { data: sessions, isLoading } = useSessions();

  const events = sessions?.map(session => ({
    id: session.id,
    title: session.name,
    start: new Date(session.date + 'T' + session.startTime),
    end: new Date(session.date + 'T' + session.endTime),
    resource: session,
  })) || [];

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Tracker</h1>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">Weekly Calendar</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setSelectedDate(new Date())}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Session
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100vh - 300px)' }}
                defaultView={Views.WEEK}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                tooltipAccessor={event => event.title}
                className="rounded-lg"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <TemplateManager />
          </div>
        </TabsContent>
      </Tabs>

      {selectedDate && (
        <SessionModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {selectedEvent && (
        <AttendanceModal
          session={selectedEvent.resource}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
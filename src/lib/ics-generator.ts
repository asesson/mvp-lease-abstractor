import { createEvent, EventAttributes } from 'ics';

export function generateICS(
  label: string,
  date: string,
  notes?: string | null
): string {
  const eventDate = new Date(date);

  const event: EventAttributes = {
    start: [
      eventDate.getFullYear(),
      eventDate.getMonth() + 1,
      eventDate.getDate(),
    ],
    duration: { days: 1 },
    title: label,
    description: notes || `Critical lease date: ${label}`,
    status: 'CONFIRMED',
    busyStatus: 'FREE',
    categories: ['Lease', 'Critical Date'],
    alarms: [
      {
        action: 'display',
        description: `Reminder: ${label}`,
        trigger: { days: 7, before: true },
      },
      {
        action: 'display',
        description: `Reminder: ${label}`,
        trigger: { days: 30, before: true },
      },
    ],
  };

  const { error, value } = createEvent(event);

  if (error) {
    console.error('ICS generation error:', error);
    throw new Error('Failed to generate ICS file');
  }

  return value || '';
}

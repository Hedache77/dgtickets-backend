import dayjs from 'dayjs';

export function getTimeTickets(createdAt: Date, updatedAt: Date): number {
  const start = dayjs(createdAt);
  const end = dayjs(updatedAt);

  const diffInSeconds = end.diff(start, 'second');

  return diffInSeconds;
}




import { differenceInDays, format, formatDistanceToNow } from "date-fns";

export function formatTimestamp(date: Date | string): string {
  const diffDays = differenceInDays(new Date(), date);

  if (diffDays >= 7) {
    return format(date, "P");
  }

  return formatDistanceToNow(date, { addSuffix: true });
}

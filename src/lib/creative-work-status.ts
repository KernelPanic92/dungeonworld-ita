export const CREATIVE_WORK_STATUSES = {
  Published: "Pubblicata",
  Draft: "Bozza",
} as const satisfies Record<string, string>;

export const CREATIVE_WORK_STATUS_OPTIONS = Object.entries(
  CREATIVE_WORK_STATUSES,
).map(([value, label]) => ({ label, value }));

export function creativeWorkStatusLabel(status: string): string {
  return (
    CREATIVE_WORK_STATUSES[status as keyof typeof CREATIVE_WORK_STATUSES] ??
    status
  );
}

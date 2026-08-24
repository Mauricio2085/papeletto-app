const BOGOTA_TZ = "America/Bogota";

export function formatDateTimeBogota(date: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: BOGOTA_TZ,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function startOfTodayBogota(): Date {
  const bogotaDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOGOTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return new Date(`${bogotaDate}T00:00:00-05:00`);
}

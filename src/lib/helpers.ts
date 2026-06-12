// Helper functions

export const toHref = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes("@") && !trimmed.includes("://") && !trimmed.startsWith("www.")) {
    return `mailto:${trimmed}`;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("www.")) return `https://${trimmed}`;
  return null;
};

export const formatLastLogin = (d: Date) => {
  // Example: Sat Jan 31 09:41:02
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("weekday")} ${get("month")} ${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
};

export const makeId = () => {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

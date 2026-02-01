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
}

export const parseQuotedJsonValueLine = (text: string) => {
    // Matches lines like: '  "institution": "Some School",'
    // Captures prefix up to opening quote of the value, the value itself, and suffix (closing quote + comma/etc).
    const m = text.match(/^(\s*"(institution|degree)"\s*:\s*")([^"]*)(".*)$/);
    if (!m) return null;
  
    const key = (m[2] ?? "") as "institution" | "degree";
    const prefix = m[1] ?? "";
    const value = m[3] ?? "";
    const suffix = m[4] ?? "";
    return { key, prefix, value, suffix };
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
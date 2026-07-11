/** First two letters of a display name, uppercased (e.g. "Alex Rivera" → "AL"). */
export function userInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '?';
  }
  return trimmed.slice(0, 2).toUpperCase();
}

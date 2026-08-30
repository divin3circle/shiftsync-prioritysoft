export function formatTime(value: string): string {
  const [hours, minutes] = value.split(":").map(Number)
  const period = hours >= 12 ? "p" : "a"
  const hour = hours % 12 === 0 ? 12 : hours % 12
  return minutes === 0 ? `${hour}${period}` : `${hour}:${String(minutes).padStart(2, "0")}${period}`
}

export function formatRange(start: string, end: string): string {
  return `${formatTime(start)} - ${formatTime(end)}`
}

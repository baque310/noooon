function generateTimeList(
  start: string,
  end: string
): { value: string; label: string }[] {
  const times: { value: string; label: string }[] = [];
  const startDate = new Date(`1970-01-01T${start}`);
  let endDate = new Date(`1970-01-01T${end}`);

  // If end time is less than or equal to start, assume it's the next day
  if (endDate <= startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }

  const current = new Date(startDate);

  while (current <= endDate) {
    const hours = current.getHours();
    const minutes = current.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes.toString().padStart(2, "0");

    const value = `${displayHours
      .toString()
      .padStart(2, "0")}:${displayMinutes} ${ampm}`;
    const label = `${displayHours
      .toString()
      .padStart(2, "0")}:${displayMinutes} ${ampm.toUpperCase()}`;

    times.push({ value, label });
    current.setMinutes(current.getMinutes() + 1);
  }

  return times;
}

export const listTime = generateTimeList("08:00:00", "07:59:00");

export default function getFormattedDates() {
  const now = new Date();
  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  const currentDate = formatDateTime(now);
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  if (now.getMonth() === 1 && now.getDate() === 29 && !oneYearAgo.getFullYear() % 4 === 0) {
    oneYearAgo.setDate(28);
  }
  const dateOneYearAgo = formatDateTime(oneYearAgo);
  return {
    start_date: `start_date=${dateOneYearAgo}`,
    end_date: `end_date=${currentDate}`
  }
}

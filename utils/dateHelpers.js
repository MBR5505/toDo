exports.getWeekNumber = (d) => {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  // Return week number
  return weekNo;
};

exports.getStartAndEndOfWeek = (year, week) => {
  // Create date object for the given year
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const day = simple.getDay();
  const date = simple.getDate() - day + (day === 0 ? -6 : 1);
  
  const startDate = new Date(year, 0, date);
  const endDate = new Date(year, 0, date + 6);
  
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

const tz = process.env.APP_TIMEZONE || 'Asia/Kolkata';

// Return a Date in local tz at midnight
function startOfDayLocal(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function addMonthsFixed(date, months) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + months;
  const day = d.getDate();
  const result = new Date(year, month, day, 0, 0, 0, 0);
  return result;
}

module.exports = { tz, startOfDayLocal, addMonthsFixed };

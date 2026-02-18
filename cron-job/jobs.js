import cron from 'node-cron';
const options = {
  year: 'numeric',   // "2026"
  month: 'long',     // "January" (use 'short' for "Jan" or '2-digit' for "01")
  day: '2-digit',    // "19"
  hour: '2-digit',   // "11"
  minute: '2-digit', // "46"
  second: '2-digit', // "21"
  hour12: true,      // AM/PM format
  timeZone: 'Asia/Kolkata' // Specify timezone
};
// Schedule a task to run every minute
cron.schedule('* * * * * *', () => {
  console.log('Running a task every Second - ' + new Date().toLocaleString('en-IN', options));
});

const task = cron.schedule('* * * * * *', () => {
  console.log('Running a task every Second - ' + new Date().toLocaleString('en-IN', options));
}, {
  scheduled: true,
  timezone: "Asia/Tokyo"
});

// To stop the task later based on logic
task.stop();
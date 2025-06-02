window.addEventListener("DOMContentLoaded", () => {
  
  const toggleBtn = document.getElementById("toggleBtn");
  const dailyChart = document.getElementById("daily-chart");
  const weeklyChart = document.getElementById("weekly-chart");
  const chartTitle = document.getElementById("chartTitle");

  

  function loadUserTasks() {
    const userDataStr = sessionStorage.getItem('loggedInUser');
    if (!userDataStr) return [];
    const user = JSON.parse(userDataStr);
    const tasksStr = localStorage.getItem(`tasks_${user.email}`);
    if (!tasksStr) return [];
    return JSON.parse(tasksStr);
  }

  function durationStrToSeconds(durationStr) {
    const parts = durationStr.split(":").map(Number);
    if (parts.length !== 3) return 0;
    const [hrs, mins, secs] = parts;
    return hrs * 3600 + mins * 60 + secs;
  }

  function getTodayDateStr() {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }

  function updateDailyChart() {
    const taskList = loadUserTasks();
    const todayStr = getTodayDateStr();

    const durationsByTask = {};

    taskList.forEach(task => {
      if (!task.taskName || !task.startDate) return;

      const startDateObj = new Date(task.startDate);
      const startDateStr = startDateObj.toISOString().split("T")[0];

      if (startDateStr !== todayStr) return;

      const durationSeconds = task.totalDuration ? durationStrToSeconds(task.totalDuration) : 0;
      const durationMinutes = Math.floor(durationSeconds / 60);
      const taskName = task.taskName.trim() || "Unnamed";

      durationsByTask[taskName] = (durationsByTask[taskName] || 0) + durationMinutes;
    });

    dailyChart.innerHTML = "";

    const taskNames = Object.keys(durationsByTask);
    if (taskNames.length === 0) {
      dailyChart.textContent = "No tasks found for today.";
      return;
    }

    const maxDuration = Math.max(...Object.values(durationsByTask));

    taskNames.forEach(taskName => {
      const duration = durationsByTask[taskName];
      const heightPercent = maxDuration > 0 ? (duration / maxDuration) * 100 : 0;

      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.alignItems = "center";

      const bar = document.createElement("div");
      bar.classList.add("bar");
      bar.style.height = `${heightPercent}%`;
      bar.textContent = `${duration}m`;

      const label = document.createElement("div");
      label.classList.add("label");
      label.textContent = taskName;

      container.appendChild(bar);
      container.appendChild(label);
      dailyChart.appendChild(container);
    });
  }

  function drawWeeklyDayChart() {
    const taskList = loadUserTasks();

    const dayDurations = {
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
      Sunday: 0,
    };

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    taskList.forEach(task => {
      if (!task.startDate) return;

      const start = new Date(task.startDate);
      if (isNaN(start)) return;

      const durationSeconds = task.totalDuration ? durationStrToSeconds(task.totalDuration) : 0;
      const durationMinutes = Math.floor(durationSeconds / 60);

      const dayName = days[start.getDay()];
      if (dayDurations[dayName] !== undefined) {
        dayDurations[dayName] += durationMinutes;
      }
    });

    weeklyChart.innerHTML = "";

    const maxDuration = Math.max(...Object.values(dayDurations), 1);

    const orderedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    orderedDays.forEach(day => {
      const duration = dayDurations[day] || 0;
      const heightPercent = (duration / maxDuration) * 100;

      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.alignItems = "center";

      const bar = document.createElement("div");
      bar.classList.add("bar");
      bar.style.height = `${heightPercent}%`;
      bar.textContent = `${duration}m`;

      const label = document.createElement("div");
      label.classList.add("label");
      label.textContent = day;

      container.appendChild(bar);
      container.appendChild(label);
      weeklyChart.appendChild(container);
    });
  }

  
  dailyChart.style.display = 'flex';
  weeklyChart.style.display = 'none';
  chartTitle.textContent = 'Daily Task Duration by Task Name (Today) - Live Update';
  toggleBtn.textContent = 'Show Weekly Chart';

  toggleBtn.addEventListener('click', () => {
    if (dailyChart.style.display === 'none') {
      dailyChart.style.display = 'flex';
      weeklyChart.style.display = 'none';
      chartTitle.textContent = 'Daily Task Duration by Task Name (Today) - Live Update';
      toggleBtn.textContent = 'Show Weekly Chart';
    } else {
      dailyChart.style.display = 'none';
      weeklyChart.style.display = 'flex';
      chartTitle.textContent = 'Weekly Task Duration by Day - Live Update';
      toggleBtn.textContent = 'Show Daily Chart';
    }
  });

  
  updateDailyChart();
  drawWeeklyDayChart();
});

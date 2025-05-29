// Helper function to get the storage key for user tasks
function getUserTasksKey() {
    return "tasks"; // Adjust if needed
  }
  
  // Parse the URL to get the task index (default to 0 if missing or invalid)
  const urlParams = new URLSearchParams(window.location.search);
  let taskIndex = parseInt(urlParams.get("taskIndex"), 10);
  if (isNaN(taskIndex) || taskIndex < 0) {
    taskIndex = 0;
  }
  
  // DOM references
  const elapsedTimeElement = document.getElementById("elapsedTime");
  const startTimeElement = document.getElementById("startTime");
  const endTimeElement = document.getElementById("endTime");
  const startButton = document.getElementById("start");
  const stopButton = document.getElementById("stop");
  const resetButton = document.getElementById("reset");
  const recordsList = document.getElementById("recordsList");
  
  let startTime = null;
  let endTime = null;
  let timerInterval = null;
  let elapsedMilliseconds = 0;
  
  // Load task details and display in recordsList
  function loadTaskDetails() {
    const tasks = JSON.parse(localStorage.getItem(getUserTasksKey())) || [];
    if (tasks.length === 0) {
      recordsList.innerHTML = "<p>No tasks found.</p>";
      return;
    }
  
    if (taskIndex >= tasks.length) {
      taskIndex = 0;
    }
  
    const task = tasks[taskIndex];
    console.log("Task loaded for display:", task);
  
    let html = `
      
    <div class="task-details-display">
      <h3>Task Details</h3>
      <p><strong>Task Name:</strong> ${task.taskName || task.name || "-"}</p>
      <p><strong>Task Tag:</strong> ${task.taskTag || task.tag || "-"}</p>
      <p><strong>Task Description:</strong> ${task.description || "-"}</p>
    </div>
    <h3>Recorded Sessions</h3>
  `;
  
  
    // ... rest unchanged ...
  
  
  
    let totalMilliseconds = 0;
  
    if (task.sessions && task.sessions.length > 0) {
      task.sessions.forEach((session, index) => {
        html += `
          <div class="record-item">
            <h4>Timer ${index + 1}</h4>
            <p><strong>Start:</strong> ${session.start || "--:--:--"}</p>
            <p><strong>End:</strong> ${session.end || "--:--:--"}</p>
            <p><strong>Duration:</strong> ${session.elapsed || "00:00:00"}</p>
          </div>
        `;
  
        // Add to total duration
        totalMilliseconds += parseTimeToMilliseconds(session.elapsed || "00:00:00");
      });
    } else {
      html += "<p>No sessions recorded yet.</p>";
    }
  
    // Total duration
    html += `
      <div class="record-item total-duration">
        <h4>Total Duration</h4>
        <p><strong>${formatTime(totalMilliseconds)}</strong></p>
      </div>
    `;
  
    recordsList.innerHTML = html;
  }
  
  // Convert hh:mm:ss string to milliseconds
  function parseTimeToMilliseconds(timeStr) {
    const parts = timeStr.split(":").map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    const seconds = parts[2] || 0;
    return ((hours * 3600) + (minutes * 60) + seconds) * 1000;
  }
  
  // Format milliseconds to hh:mm:ss
  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }
  
  // Start timer
  function startTimer() {
    startTime = new Date();
    startTimeElement.textContent = startTime.toLocaleTimeString();
  
    startButton.disabled = true;
    stopButton.disabled = false;
    resetButton.disabled = true;
  
    elapsedMilliseconds = 0;
  
    // Create a new session in localStorage
    const tasks = JSON.parse(localStorage.getItem(getUserTasksKey())) || [];
    const task = tasks[taskIndex];
  
    if (!task.sessions) {
      task.sessions = [];
    }
  
    // Add new session
    task.sessions.push({
      start: startTime.toLocaleTimeString(),
      end: "--:--:--",
      elapsed: "00:00:00"
    });
  
    tasks[taskIndex] = task;
    localStorage.setItem(getUserTasksKey(), JSON.stringify(tasks));
  
    loadTaskDetails();
  
    timerInterval = setInterval(() => {
      const now = new Date();
      elapsedMilliseconds = now - startTime;
      elapsedTimeElement.textContent = formatTime(elapsedMilliseconds);
    }, 1000);
  }
  
  // Stop timer
  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  
    endTime = new Date();
    endTimeElement.textContent = endTime.toLocaleTimeString();
  
    startButton.disabled = false;
    stopButton.disabled = true;
    resetButton.disabled = false;
  
    saveLastSession();
  }
  
  // Save the last session
  function saveLastSession() {
    const tasks = JSON.parse(localStorage.getItem(getUserTasksKey())) || [];
    const task = tasks[taskIndex];
  
    if (!task.sessions || task.sessions.length === 0) {
      return;
    }
  
    const lastSession = task.sessions[task.sessions.length - 1];
    lastSession.end = endTime.toLocaleTimeString();
    lastSession.elapsed = formatTime(elapsedMilliseconds);
  
    tasks[taskIndex] = task;
    localStorage.setItem(getUserTasksKey(), JSON.stringify(tasks));
  
    loadTaskDetails();
  }
  
  // Reset timer
  function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  
    elapsedMilliseconds = 0;
    elapsedTimeElement.textContent = "00:00:00";
    startTimeElement.textContent = "--:--:--";
    endTimeElement.textContent = "--:--:--";
    startTime = null;
    endTime = null;
  
    startButton.disabled = false;
    stopButton.disabled = true;
    resetButton.disabled = true;
  }
  
  // Initialize
  window.addEventListener("DOMContentLoaded", () => {
    loadTaskDetails();
  
    startButton.addEventListener("click", startTimer);
    stopButton.addEventListener("click", stopTimer);
    resetButton.addEventListener("click", resetTimer);
  });
  
  
//timer .js  
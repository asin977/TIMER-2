window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const taskIndex = parseInt(params.get("taskIndex"));

  const userDataStr = sessionStorage.getItem('loggedInUser');
  if (!userDataStr) {
    window.location.href = "index.html";
    return;
  }

  const user = JSON.parse(userDataStr);
  const userTasksKey = `tasks_${user.email}`;
  const tasks = JSON.parse(localStorage.getItem(userTasksKey)) || [];

  if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= tasks.length) {
    alert("Invalid task index");
    window.location.href = "track.html";
    return;
  }

  const taskData = tasks[taskIndex];

  const nameEl = document.getElementById("taskName");
  const tagEl = document.getElementById("taskTag");
  const descEl = document.getElementById("taskDescription");
  const startEl = document.getElementById("taskStartDate");
  const durationEl = document.getElementById("taskDuration");
  const elapsedTimeEl = document.getElementById("elapsedTime");
  const startTimeEl = document.getElementById("startTime");
  const endTimeEl = document.getElementById("endTime");
  const recordsList = document.getElementById("recordsList");

  
  if (nameEl) nameEl.textContent = taskData.taskName || "-";
  if (tagEl) tagEl.textContent = taskData.taskTag || "-";
  if (descEl) descEl.textContent = taskData.description || "-";
  if (startEl) startEl.textContent = new Date(taskData.startDate).toLocaleString();
  if (durationEl) durationEl.textContent = taskData.totalDuration || "00:00:00";

  let startTime;
  let timerInterval;

  renderAllTaskSessions();
  resetTimer();

  function timeFormatting(sec) {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  function startTimer() {
    startTime = new Date();
    if (startTimeEl) startTimeEl.textContent = startTime.toLocaleTimeString();

    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = false;
    document.getElementById("reset").disabled = false;

    timerInterval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now - startTime) / 1000);
      if (elapsedTimeEl) elapsedTimeEl.textContent = timeFormatting(diff);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);

    const endTime = new Date();
    const durationSec = Math.floor((endTime - startTime) / 1000);
    const durationStr = timeFormatting(durationSec);

    const session = {
      startDate: new Date().toLocaleDateString(),
      startTime: startTime.toLocaleTimeString(),
      endDate: endTime.toLocaleDateString(),
      endTime: endTime.toLocaleTimeString(),
      duration: durationStr
    };

    if (!taskData.sessions) taskData.sessions = [];
    taskData.sessions.push(session);

    
    let totalSeconds = 0;
    taskData.sessions.forEach(sess => {
      const [h, m, s] = sess.duration.split(":").map(Number);
      totalSeconds += h * 3600 + m * 60 + s;
    });
    taskData.totalDuration = timeFormatting(totalSeconds);

    if (endTimeEl) endTimeEl.textContent = session.endTime;
    if (elapsedTimeEl) elapsedTimeEl.textContent = durationStr;
    if (durationEl) durationEl.textContent = taskData.totalDuration;

    tasks[taskIndex] = taskData;
    localStorage.setItem(userTasksKey, JSON.stringify(tasks));

    renderAllTaskSessions();
  }

  function resetTimer() {
    clearInterval(timerInterval);
    if (elapsedTimeEl) elapsedTimeEl.textContent = "00:00:00";
    if (startTimeEl) startTimeEl.textContent = "--:--:--";
    if (endTimeEl) endTimeEl.textContent = "--:--:--";

    document.getElementById("start").disabled = false;
    document.getElementById("stop").disabled = true;
    document.getElementById("reset").disabled = true;
  }

  function renderAllTaskSessions() {
    if (!recordsList) return;

    recordsList.innerHTML = `
      <h2 class="details">Task Details</h2>
      <p><strong>Task Name:</strong> ${taskData.taskName || "-"}</p>
      <p><strong>Task Tag:</strong> ${taskData.taskTag || "-"}</p>
      <p><strong>Task Description:</strong> ${taskData.description || "No description provided."}</p>
      <hr>
    `;

    if (!taskData.sessions || taskData.sessions.length === 0) {
      recordsList.innerHTML += `<p>No sessions recorded yet.</p>`;
      return;
    }

    taskData.sessions.forEach((s, i) => {
      const sessionDiv = document.createElement("div");
      sessionDiv.className = "record";
      sessionDiv.innerHTML = `
        <div class="head"><strong>TIMER ${i + 1}</strong></div>
        <div class="session">
          <strong>Session ${i + 1}</strong><br>
          Start: ${s.startTime} (${s.startDate})<br>
          End: ${s.endTime} (${s.endDate})<br>
          Duration: ${s.duration}<br><br>
        </div>
      `;
      recordsList.appendChild(sessionDiv);
    });

    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<strong>Total Duration: ${taskData.totalDuration}</strong>`;
    recordsList.appendChild(totalDiv);

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear Sessions";
    clearBtn.className = "clear";
    clearBtn.addEventListener("click", clearSessions);
    recordsList.appendChild(clearBtn);

    const completedBtn = document.createElement("button");
    completedBtn.textContent = "Mark as Completed";
    completedBtn.className = "completed";
    completedBtn.addEventListener("click", () => {
      if (confirm("Mark this task as completed?")) {
        taskData.completed = true;
        tasks[taskIndex] = taskData;
        localStorage.setItem(userTasksKey, JSON.stringify(tasks));

        document.getElementById("start").disabled = true;
        document.getElementById("stop").disabled = true;
        document.getElementById("reset").disabled = true;

        alert("Task marked as completed. No further time tracking is allowed.");
        renderAllTaskSessions();
      }
    });
    recordsList.appendChild(completedBtn);
  }

  function clearSessions() {
    if (confirm("Clear all sessions for this task?")) {
      taskData.sessions = [];
      taskData.totalDuration = "00:00:00";
      tasks[taskIndex] = taskData;
      localStorage.setItem(userTasksKey, JSON.stringify(tasks));
      resetTimer();
      renderAllTaskSessions();
    }
  }

  document.getElementById("start").addEventListener("click", startTimer);
  document.getElementById("stop").addEventListener("click", stopTimer);
  document.getElementById("reset").addEventListener("click", resetTimer);
});


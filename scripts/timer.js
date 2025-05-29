window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const index = parseInt(params.get("taskIndex"));
  const viewOnlyMode = sessionStorage.getItem("viewOnlyMode") === "true";

  const userDataStr = sessionStorage.getItem('loggedInUser');
  if (!userDataStr) {
    window.location.href = "index.html";
    return;
  }

  const user = JSON.parse(userDataStr);
  const userTasksKey = `tasks_${user.email}`;
  const taskList = JSON.parse(localStorage.getItem(userTasksKey)) || [];

  if (isNaN(index) || index < 0 || index >= taskList.length) {
    alert("Invalid task index");
    window.location.href = "track.html";
    return;
  }

  const task = taskList[index];

  const nameEl = document.getElementById("taskName");
  const tagEl = document.getElementById("taskTag");
  const descEl = document.getElementById("taskDescription");
  const startEl = document.getElementById("taskStartDate");
  const durationEl = document.getElementById("taskDuration");
  const stopBtn = document.getElementById("stopBtn");
  const backBtn = document.getElementById("backBtn");

  // Check if all required elements exist
  if (nameEl) nameEl.textContent = task.taskName;
  if (tagEl) tagEl.textContent = task.taskTag;
  if (descEl) descEl.textContent = task.description;
  if (startEl) startEl.textContent = new Date(task.startDate).toLocaleString();
  if (durationEl) durationEl.textContent = formatDuration(task.duration);

  let timerInterval;
  let startTime;

  if (!viewOnlyMode) {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (durationEl) durationEl.textContent = formatDuration(task.duration + elapsed);
    }, 1000);
  }

  if (stopBtn) {
    stopBtn.addEventListener("click", () => {
      if (timerInterval) clearInterval(timerInterval);

      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      task.duration += elapsed;
      task.sessions.push({
        start: new Date(startTime).toISOString(),
        end: new Date().toISOString(),
        duration: elapsed
      });

      localStorage.setItem(userTasksKey, JSON.stringify(taskList));
      window.location.href = "track.html";
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (timerInterval) clearInterval(timerInterval);
      window.location.href = "track.html";
    });
  }

  if (viewOnlyMode && stopBtn) {
    stopBtn.style.display = "none";
    sessionStorage.removeItem("viewOnlyMode");
  }
});

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}


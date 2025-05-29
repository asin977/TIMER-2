
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const index = parseInt(params.get("taskIndex"));

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
  const elapsedEl = document.getElementById("elapsedTime");


  if (nameEl) nameEl.textContent = task.taskName;
  if (tagEl) tagEl.textContent = task.taskTag;
  if (descEl) descEl.textContent = task.description;
  if (startEl) startEl.textContent = new Date(task.startDate).toLocaleString();

  
  const recordsList = document.getElementById("recordsList");
  let totalDuration = 0;

  if (task.sessions && Array.isArray(task.sessions) && task.sessions.length > 0) {
    task.sessions.forEach((session, idx) => {
      const duration = session.duration || 0;
      totalDuration += duration;

      const sessionEl = document.createElement("div");
      sessionEl.classList.add("record-item");
      sessionEl.innerHTML = `
        <p><strong>Timer ${idx + 1}:</strong> ${formatDuration(duration)}</p>
        <p>Start: ${new Date(session.start).toLocaleString()}</p>
        <p>End: ${new Date(session.end).toLocaleString()}</p>
      `;
      recordsList.appendChild(sessionEl);
    });
  } else {
    const noSessionEl = document.createElement("p");
    noSessionEl.textContent = "No sessions recorded.";
    recordsList.appendChild(noSessionEl);
  }

  
  const totalDurationEl = document.createElement("div");
  totalDurationEl.classList.add("record-item", "total-duration");
  totalDurationEl.innerHTML = `<strong>Total Duration:</strong> ${formatDuration(totalDuration)}`;
  recordsList.appendChild(totalDurationEl);

  
  if (elapsedEl) elapsedEl.textContent = formatDuration(totalDuration);

  
  const stopBtn = document.getElementById("stopBtn");
  const backBtn = document.getElementById("backBtn");
  if (stopBtn) stopBtn.style.display = "none";
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "track.html";
    });
  }
});


function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}


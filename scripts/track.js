window.addEventListener('DOMContentLoaded', () => {
  const userDataStr = sessionStorage.getItem('loggedInUser');
  if (!userDataStr) {
    window.location.href = "index.html";
    return;
  }

  const userData = JSON.parse(userDataStr);
  document.getElementById('tooltipName').textContent = `Name: ${userData.firstName || "N/A"}`;
  document.getElementById('tooltipEmail').textContent = `Email: ${userData.email || "N/A"}`;
  document.getElementById('tooltipworkSpace').textContent = `WorkSpace: ${userData.workSpace || "N/A"}`;

  loadUserTasks();
  renderTaskTable();
});

let taskList = [];

function getUserTasksKey() {
  const userDataStr = sessionStorage.getItem('loggedInUser');
  if (!userDataStr) return null;
  const userData = JSON.parse(userDataStr);
  return `tasks_${userData.email}`;
}

function loadUserTasks() {
  const userTasksKey = getUserTasksKey();
  if (!userTasksKey) return;
  const storedTasks = localStorage.getItem(userTasksKey);
  taskList = storedTasks ? JSON.parse(storedTasks) : [];
}

function saveTaskToLocalStorage() {
  const userTasksKey = getUserTasksKey();
  if (!userTasksKey) return;
  localStorage.setItem(userTasksKey, JSON.stringify(taskList));
}

function startTask() {
  const name = document.getElementById("taskName").value.trim();
  const tag = document.getElementById("taskTag").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!name) {
    alert("Please enter a task name!");
    return;
  }

  const task = {
    taskName: name,
    taskTag: tag,
    description: description,
    startDate: new Date().toISOString(),
    duration: 0,
    sessions: [],
    completed: false
  };

  taskList.push(task);
  saveTaskToLocalStorage();

  const newIndex = taskList.length - 1;
  localStorage.setItem("currentTaskIndex", newIndex);

  window.location.href = "timer.html?taskIndex=" + newIndex;
}

function renderTaskTable() {
  const taskTableBody = document.getElementById("taskTableBody");
  const showMoreBtn = document.getElementById("showMoreBtn");

  if (!taskTableBody || !showMoreBtn) return;

  taskTableBody.innerHTML = "";

  const visibleLimit = 5;
  taskList.forEach((task, index) => {
    const row = document.createElement("tr");
    row.id = `taskRow-${index}`;

    const startDateFormatted = task.startDate ? new Date(task.startDate).toLocaleString() : "--/--/----";
    const completedTag = task.completed ? `<span class="completed-tag">Completed ✓</span>` : "";
    const actionBtnLabel = task.completed ? "📝 Details" : "🕒 Resume";
    const actionBtnHandler = task.completed ? `viewTaskDetails(${index})` : `resumeTask(${index})`;
    const durationDisplay = formatDuration(task.duration);

    row.innerHTML = `
      <td class="taskNameCell" id="taskNameCell-${index}">
        ${task.taskName || "-"} ${completedTag}
      </td>
      <td>${startDateFormatted}</td>
      <td>${durationDisplay}</td>
      <td>
        <div class="more" id="actionBtns-${index}">
          <button class="resume" onclick="${actionBtnHandler}">${actionBtnLabel}</button>
          <button class="edit" onclick="toggleEditButtons(${index})">✏️ Edit</button>
          <button class="delete" onclick="deleteTask(${index})">🗑️ Delete</button>
        </div>
      </td>
    `;

    if (index >= visibleLimit) row.classList.add("hidden-row");
    taskTableBody.appendChild(row);
  });

  if (taskList.length > visibleLimit) {
    showMoreBtn.style.display = "block";
    showMoreBtn.textContent = "Show More";
  } else {
    showMoreBtn.style.display = "none";
  }
}

function toggleEditButtons(index) {
  const btnContainer = document.getElementById(`actionBtns-${index}`);
  const nameCell = document.getElementById(`taskNameCell-${index}`);
  if (!btnContainer || !nameCell) return;

  const isEditing = btnContainer.querySelector(".save");
  if (isEditing) {
    nameCell.textContent = taskList[index].taskName || "-";
    btnContainer.innerHTML = `
      <button class="resume" onclick="resumeTask(${index})">🕒 Resume</button>
      <button class="edit" onclick="toggleEditButtons(${index})">✏️ Edit</button>
      <button class="delete" onclick="deleteTask(${index})">🗑️ Delete</button>
    `;
  } else {
    nameCell.innerHTML = `<input type="text" id="editTaskName-${index}" value="${taskList[index].taskName || ""}" />`;
    btnContainer.innerHTML = `
      <button class="save" onclick="saveTask(${index})">💾 Save</button>
      <button class="cancel" onclick="toggleEditButtons(${index})">⛔ Cancel</button>
    `;
  }
}

function saveTask(index) {
  const editedNameInput = document.getElementById(`editTaskName-${index}`);
  if (!editedNameInput) return;
  const newName = editedNameInput.value.trim();
  if (newName) {
    taskList[index].taskName = newName;
    saveTaskToLocalStorage();
  }
  renderTaskTable();
}

function viewTaskDetails(index) {
  sessionStorage.setItem("viewTaskIndex", index);
  sessionStorage.setItem("viewOnlyMode", "true");
  window.location.href = "timer.html";
}

function resumeTask(index) {
  window.location.href = `timer.html?taskIndex=${index}`;
}

function deleteTask(index) {
  if (index >= 0 && index < taskList.length) {
    taskList.splice(index, 1);
    saveTaskToLocalStorage();
    renderTaskTable();
  }
}

function searchTasks() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const resultsDiv = document.getElementById("searchResults");
  resultsDiv.innerHTML = "";

  const filtered = taskList.filter(task =>
    task.taskName.toLowerCase().includes(query) ||
    task.taskTag.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    resultsDiv.innerHTML = "<p>Oops!..No matching tasks found.</p>";
    return;
  }

  filtered.forEach((task, i) => {
    const resultId = `search-result-${i}`;
    const div = document.createElement("div");
    div.classList.add("search-result");
    div.id = resultId;
    div.innerHTML = `
      <strong>📑 ${task.taskName}</strong><br>
      📌 ${task.taskTag}<br>
      🕒 ${formatDuration(task.duration)}<br>
      <button class="resume" onclick="resumeTask(${i})">▶️ Resume</button>
      <button class="clear" onclick="removeSearchResult('${resultId}')">❌</button>
    `;
    resultsDiv.appendChild(div);
  });
}

function removeSearchResult(resultId) {
  const el = document.getElementById(resultId);
  if (el) el.remove();
}

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

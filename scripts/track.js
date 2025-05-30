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
  const userDataStr = sessionStorage.getItem('loggedInUser');
  if (!userDataStr) return;

  const user = JSON.parse(userDataStr);
  const userTasksKey = `tasks_${user.email}`;
  const tasks = JSON.parse(localStorage.getItem(userTasksKey)) || [];

  const tableBody = document.getElementById("taskTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const visibleLimit = 5;
  tasks.forEach((task, index) => {
    const row = document.createElement("tr");
    row.id = `taskRow-${index}`;

    const completedTag = task.completed ? `<span class="completed-tag">Completed ✓</span>` : "";
    const actionBtnLabel = task.completed ? "📝 Details" : "🕒 Resume";
    const actionBtnHandler = task.completed ? `viewTaskDetails(${index})` : `resumeTask(${index})`;

    const startDate = task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : "--/--/----";

    row.innerHTML = `
      <td class="taskNameCell" id="taskNameCell-${index}">
        ${task.taskName || "-"} ${completedTag}
      </td>
      <td>${startDate}</td>
      <td>${task.totalDuration || "00:00:00"}</td>
      <td>
        <div class="more" id="actionBtns-${index}"> 
          <button class="resume" onclick="${actionBtnHandler}">${actionBtnLabel}</button>
          <button class="edit" onclick="toggleEditButtons(${index})">✏️ Edit</button>
          <button class="delete" onclick="deleteTask(${index})">🗑️ Delete</button>
        </div>
      </td>
    `;

    if (index >= visibleLimit) row.classList.add("hidden-row");
    tableBody.appendChild(row);
  });

  const showMoreBtn = document.getElementById("showMoreBtn");
  if (showMoreBtn) {
    if (tasks.length > visibleLimit) {
      showMoreBtn.style.display = "block";
      showMoreBtn.textContent = "Show More";
    } else {
      showMoreBtn.style.display = "none";
    }
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
      <button class="clear" onclick="removeSearchResult('${resultId}')">
         <svg height="30" preserveAspectRatio="none" viewBox="0 0 64 64" width="30" xmlns="http://www.w3.org/2000/svg"><path d="m12.458008 20.291992h39.083984v39.583008h-39.083984z" fill="#fff"/><path d="m55.7714844 14.652832h-2.8564453v-3.277832c0-1.0454102-.8476563-1.8930664-1.8935547-1.8930664h-9.0634766v-5.3569336c0-1.1044922-.8955078-2-2-2h-15.9160156c-1.1044922 0-2 .8955078-2 2v5.3569336h-9.0629883c-1.0454102 0-1.8930664.8476563-1.8930664 1.8930664v3.277832h-2.8574219c-1.1816406 0-2.1391602.9575195-2.1391602 2.1391602v7.1245117c0 1.1816406.9575195 2.1391602 2.1391602 2.1391602h2.2294922v33.8193359c0 1.1044922.8955078 2 2 2h39.0839844c1.1044922 0 2-.8955078 2-2v-33.8193359h2.2294922c1.1816406 0 2.1396484-.9575195 2.1396484-2.1391602v-7.1245117c0-1.1816406-.9580078-2.1391602-2.1396484-2.1391602zm-29.7294922-8.527832h11.9160156v3.3569336h-11.9160156zm23.5 51.75h-35.0839844v-31.8193359h35.0839844z" fill="#182985"/><path d="m22.125 51.1513672c-1.0043945 0-1.8183594-.8144531-1.8183594-1.8183594v-17.3330078c0-1.0043945.8139648-1.8183594 1.8183594-1.8183594s1.8183594.8139649 1.8183594 1.8183594v17.3330078c0 1.0039063-.8139649 1.8183594-1.8183594 1.8183594z" fill="#e80000"/><path d="m41.875 51.1513672c-1.0039063 0-1.8183594-.8144531-1.8183594-1.8183594v-17.3330078c0-1.0043945.8144531-1.8183594 1.8183594-1.8183594s1.8183594.8139649 1.8183594 1.8183594v17.3330078c0 1.0039063-.8144531 1.8183594-1.8183594 1.8183594z" fill="#e80000"/><path d="m32 51.1513672c-1.0043945 0-1.8183594-.8144531-1.8183594-1.8183594v-17.3330078c0-1.0043945.8139648-1.8183594 1.8183594-1.8183594 1.0039063 0 1.8183594.8139648 1.8183594 1.8183594v17.3330078c0 1.0039063-.8144531 1.8183594-1.8183594 1.8183594z" fill="#e80000"/><g fill="#182985"><path d="m22.125 51.1513672c-1.0043945 0-1.8183594-.8144531-1.8183594-1.8183594v-17.3330078c0-1.0043945.8139648-1.8183594 1.8183594-1.8183594s1.8183594.8139649 1.8183594 1.8183594v17.3330078c0 1.0039063-.8139649 1.8183594-1.8183594 1.8183594z"/><path d="m41.875 51.1513672c-1.0039063 0-1.8183594-.8144531-1.8183594-1.8183594v-17.3330078c0-1.0043945.8144531-1.8183594 1.8183594-1.8183594s1.8183594.8139649 1.8183594 1.8183594v17.3330078c0 1.0039063-.8144531 1.8183594-1.8183594 1.8183594z"/><path d="m32 51.1513672c-1.0043945 0-1.8183594-.8144531-1.8183594-1.8183594v-17.3330078c0-1.0043945.8139648-1.8183594 1.8183594-1.8183594 1.0039063 0 1.8183594.8139648 1.8183594 1.8183594v17.3330078c0 1.0039063-.8144531 1.8183594-1.8183594 1.8183594z"/></g></svg>
        </button>
    `;
    resultsDiv.appendChild(div);
  });
}

function removeSearchResult(resultId) {
  const el = document.getElementById(resultId);
  if (el) el.remove();
}

function viewTaskDetails(index) {
  window.location.href = `timer.html?taskIndex=${index}`;
}

function resetTask() {
  if (confirm("Are you sure? Do you want to reset all the tasks?")) {
      localStorage.removeItem("tasks");
      taskList = [];
      document.querySelector("#tasktable tbody").innerHTML = "";
      document.getElementById("activeTasks").innerHTML = "";
      for (const id in taskTimers) clearInterval(taskTimers[id].interval);
      taskTimers = {};
    }
}

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}


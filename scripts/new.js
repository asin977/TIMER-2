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

    // Extract only the date part (YYYY-MM-DD) from ISO string
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

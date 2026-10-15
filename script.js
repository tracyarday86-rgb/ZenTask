// Select DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const priorityInput = document.getElementById('priority-input');

const todoList = document.getElementById('todo-list');
const inprogressList = document.getElementById('inprogress-list');
const doneList = document.getElementById('done-list');

// Load tasks from localStorage or start with an empty array
let tasks = JSON.parse(localStorage.getItem('zen_tasks')) || [];

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem('zen_tasks', JSON.stringify(tasks));
}

// Function to render all tasks onto the board
function renderTasks() {
    // Clear current columns
    todoList.innerHTML = '';
    inprogressList.innerHTML = '';
    doneList.innerHTML = '';

    updateAnalytics();

    tasks.forEach((task, index) => {
        // Create the task card element
        const card = document.createElement('div');
        card.classList.add('task-card');
        card.id = `task-card-${index}`;

        // Determine priority class for styling
        let priorityClass = 'priority-medium';
        if (task.priority === 'High') priorityClass = 'priority-high';
        if (task.priority === 'Low') priorityClass = 'priority-low';

        card.innerHTML = `
            <div class="task-title">${escapeHTML(task.text)}</div>
            <div class="task-footer">
                <span class="priority-badge ${priorityClass}">${task.priority}</span>
                <div class="task-actions">
                    <select class="status-select" onchange="changeStatus(${index}, this.value)">
                        <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
                        <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
                    </select>
                    <button class="edit-btn" onclick="editTask(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteTask(${index})">🗑️</button>
                </div>
            </div>
        `;

        // Append card to the correct column list
        if (task.status === 'To Do') {
            todoList.appendChild(card);
        } else if (task.status === 'In Progress') {
            inprogressList.appendChild(card);
        } else if (task.status === 'Done') {
            doneList.appendChild(card);
        }
    });
}

// Function to add a new task
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const newTask = {
        text: taskInput.value.trim(),
        priority: priorityInput.value,
        status: 'To Do' // New tasks always start in 'To Do'
    };

    if (newTask.text !== '') {
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = ''; // Reset input field
    }
});

// Function to change task status (Move between columns)
function changeStatus(index, newStatus) {
    tasks[index].status = newStatus;
    saveTasks();
    renderTasks();
}

// Function to delete a task
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

function editTask(index) {
    const card = document.getElementById(`task-card-${index}`);
    const title = card.querySelector('.task-title');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-task-input';
    input.value = tasks[index].text;
    input.setAttribute('aria-label', 'Edit task');
    title.replaceWith(input);

    const editButton = card.querySelector('.edit-btn');
    editButton.textContent = 'Save';
    editButton.onclick = () => saveTaskEdit(index);

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'cancel-edit-btn';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = cancelTaskEdit;
    editButton.after(cancelButton);
    input.focus();
}

function saveTaskEdit(index) {
    const input = document.querySelector(`#task-card-${index} .edit-task-input`);
    const updatedText = input.value.trim();
    if (updatedText === '') {
        input.focus();
        return;
    }

    tasks[index].text = updatedText;
    saveTasks();
    renderTasks();
}

function cancelTaskEdit() {
    renderTasks();
}

const clearConfirmation = document.getElementById('clear-confirmation');

document.getElementById('clear-tasks-btn').addEventListener('click', function() {
    if (tasks.length > 0) {
        clearConfirmation.hidden = false;
    }
});

document.getElementById('cancel-clear-btn').addEventListener('click', function() {
    clearConfirmation.hidden = true;
});

document.getElementById('confirm-clear-btn').addEventListener('click', function() {
    if (tasks.length === 0) {
        clearConfirmation.hidden = true;
        return;
    }

    tasks = [];
    saveTasks();
    renderTasks();
    clearConfirmation.hidden = true;
});

// Security helper to prevent HTML injection in task titles
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Initial render when page loads
renderTasks();
// --- Dark Mode Logic ---
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Check for saved theme preference
const savedTheme = localStorage.getItem('zen_theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.textContent = '☀️ Light Mode';
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('zen_theme', 'dark');
        themeToggleBtn.textContent = '☀️ Light Mode';
    } else {
        localStorage.setItem('zen_theme', 'light');
        themeToggleBtn.textContent = '🌙 Dark Mode';
    }
});
// Function to update Dashboard Analytics
function updateAnalytics() {
    const total = tasks.length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    
    // Calculate percentage
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Update numbers on the screen
    document.getElementById('total-tasks-count').textContent = total;
    document.getElementById('inprogress-tasks-count').textContent = inProgress;
    document.getElementById('completed-tasks-count').textContent = completed;
    
    // Update progress bar and text
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercentText = document.getElementById('progress-percent-text');
    
    if (progressBarFill && progressPercentText) {
        progressBarFill.style.width = percentage + '%';
        progressPercentText.textContent = percentage + '%';
    }
}
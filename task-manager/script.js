// ===== STATE MANAGEMENT =====
const state = {
    tasks: [],
    currentFilter: 'all'
};

// ===== DOM ELEMENTS =====
const elements = {
    themeToggle: document.getElementById('themeToggle'),
    taskInput: document.getElementById('taskInput'),
    dueDate: document.getElementById('dueDate'),
    taskTime: document.getElementById('taskTime'),
    taskCategory: document.getElementById('taskCategory'),
    taskPriority: document.getElementById('taskPriority'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    tasksList: document.getElementById('tasks'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    totalTasksEl: document.getElementById('totalTasks'),
    completedTasksEl: document.getElementById('completedTasks'),
    completionRateEl: document.getElementById('completionRate'),
    dueTodayEl: document.getElementById('dueToday'),
    reminderModal: document.getElementById('reminderModal'),
    reminderList: document.getElementById('reminderList'),
    closeModal: document.querySelector('.close-modal'),
    toastContainer: document.getElementById('toastContainer')
};

// ===== TOAST NOTIFICATION SYSTEM =====
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    });
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    loadTasks();
    setupEventListeners();
    setupDragAndDrop();
    setupNotificationPermission();
    
    // Set default due date to today
    const today = new Date().toISOString().split('T')[0];
    elements.dueDate.value = today;
    
    // Check for reminders every minute
    checkDueDateReminders();
    setInterval(checkDueDateReminders, 60000);
});

// ===== THEME MANAGEMENT =====
function loadThemePreference() {
    const savedMode = localStorage.getItem('darkMode');
    
    // Default to dark mode if no preference saved
    if (savedMode === null) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
        elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        showToast('Light mode activated', 'info');
    } else {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        showToast('Dark mode activated', 'info');
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    elements.themeToggle.addEventListener('click', toggleDarkMode);
    elements.addTaskBtn.addEventListener('click', addTask);
    elements.taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());
    
    elements.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => filterTasks(btn.dataset.filter));
    });
    
    elements.closeModal.addEventListener('click', () => {
        elements.reminderModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === elements.reminderModal) {
            elements.reminderModal.style.display = 'none';
        }
    });
}

// ===== TASK CRUD OPERATIONS =====
function addTask() {
    const text = elements.taskInput.value.trim();
    if (!text) {
        showToast('Please enter a task description', 'warning');
        return;
    }

    const task = {
        id: Date.now().toString(),
        text: text,
        dueDate: elements.dueDate.value,
        dueTime: elements.taskTime.value || null,
        category: elements.taskCategory.value,
        priority: elements.taskPriority.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    state.tasks.push(task);
    saveTasks();
    renderTasks();
    
    elements.taskInput.value = '';
    elements.taskTime.value = '';
    
    showToast('Task added successfully', 'success');
}

function toggleTaskComplete(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.style.transform = 'scale(0.98)';
            setTimeout(() => {
                taskElement.style.transform = '';
            }, 300);
        }
        
        if (task.completed) {
            showToast('Task completed! 🎉', 'success');
        }
    }
}

function deleteTask(taskId) {
    const taskIndex = state.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const taskElement = document.querySelector(`[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.style.transform = 'translateX(100%)';
            taskElement.style.opacity = '0';
            
            setTimeout(() => {
                state.tasks.splice(taskIndex, 1);
                saveTasks();
                renderTasks();
                showToast('Task deleted', 'warning');
            }, 300);
        } else {
            state.tasks.splice(taskIndex, 1);
            saveTasks();
            renderTasks();
            showToast('Task deleted', 'warning');
        }
    }
}

// ===== TASK RENDERING =====
function renderTasks() {
    let filteredTasks = state.tasks;
    
    if (state.currentFilter !== 'all') {
        filteredTasks = state.tasks.filter(task => task.category === state.currentFilter);
    }
    
    if (filteredTasks.length === 0) {
        if (state.tasks.length === 0) {
            elements.tasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h3>No tasks yet</h3>
                    <p>Add your first task 🚀</p>
                </div>
            `;
        } else {
            elements.tasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-filter"></i>
                    <h3>No tasks in this category</h3>
                    <p>Try a different filter</p>
                </div>
            `;
        }
        updateStats();
        return;
    }
    
    elements.tasksList.innerHTML = filteredTasks.map(task => createTaskHTML(task)).join('');
    
    // Add event listeners to new elements
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = e.target.closest('li').dataset.id;
            toggleTaskComplete(taskId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.closest('li').dataset.id;
            deleteTask(taskId);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskItem = e.target.closest('li');
            enableTaskEditing(taskItem);
        });
    });
    
    updateStats();
}

function createTaskHTML(task) {
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
    }) : '';
    
    const isDueToday = task.dueDate === new Date().toISOString().split('T')[0];
    
    return `
        <li data-id="${task.id}" class="${task.completed ? 'completed' : ''} priority-${task.priority}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-text">
                    <span class="task-priority priority-${task.priority}"></span>
                    ${task.text}
                </div>
                <div class="task-meta">
                    <span class="task-category ${task.category}">${task.category}</span>
                    ${task.dueDate ? `
                        <span class="task-due">
                            <i class="far fa-calendar"></i>
                            ${dueDate}
                            ${task.dueTime ? `at ${formatTime(task.dueTime)}` : ''}
                            ${isDueToday ? '<span style="color: var(--accent); margin-left: 4px;">(Today)</span>' : ''}
                        </span>
                    ` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn"><i class="fas fa-pencil-alt"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        </li>
    `;
}

// ===== TASK EDITING =====
function enableTaskEditing(taskItem) {
    const taskId = taskItem.dataset.id;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const textEl = taskItem.querySelector('.task-text');
    const originalText = task.text;
    
    textEl.contentEditable = true;
    textEl.focus();
    
    const editControls = document.createElement('div');
    editControls.className = 'edit-controls';
    editControls.innerHTML = `
        <button class="save-edit"><i class="fas fa-check"></i> Save</button>
        <button class="cancel-edit"><i class="fas fa-times"></i> Cancel</button>
    `;
    
    textEl.after(editControls);
    
    editControls.querySelector('.save-edit').addEventListener('click', () => {
        const newText = textEl.textContent.trim();
        if (newText) {
            task.text = newText;
            saveTasks();
            renderTasks();
            showToast('Task updated', 'success');
        }
    });
    
    editControls.querySelector('.cancel-edit').addEventListener('click', () => {
        textEl.textContent = originalText;
        textEl.contentEditable = false;
        editControls.remove();
    });
}

// ===== FILTERING =====
function filterTasks(category) {
    state.currentFilter = category;
    
    elements.filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });
    
    renderTasks();
}

// ===== STATS UPDATE =====
function updateStats() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const today = new Date().toISOString().split('T')[0];
    const dueToday = state.tasks.filter(t => t.dueDate === today && !t.completed).length;
    
    elements.totalTasksEl.textContent = total;
    elements.completedTasksEl.textContent = completed;
    elements.completionRateEl.textContent = total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%';
    elements.dueTodayEl.textContent = dueToday;
}

// ===== LOCAL STORAGE =====
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        try {
            state.tasks = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to parse tasks:', e);
            state.tasks = [];
        }
    } else {
        state.tasks = [];
    }
    
    renderTasks();
}

// ===== DRAG AND DROP =====
function setupDragAndDrop() {
    new Sortable(elements.tasksList, {
        animation: 200,
        ghostClass: 'dragging',
        onEnd: function() {
            const taskElements = document.querySelectorAll('#tasks li');
            const newOrder = [];
            
            taskElements.forEach(el => {
                const taskId = el.dataset.id;
                const task = state.tasks.find(t => t.id === taskId);
                if (task) newOrder.push(task);
            });
            
            state.tasks = newOrder;
            saveTasks();
            showToast('Task order updated', 'info');
        }
    });
}

// ===== NOTIFICATIONS & REMINDERS =====
function setupNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function checkDueDateReminders() {
    const today = new Date().toISOString().split('T')[0];
    const upcomingTasks = state.tasks.filter(task => 
        !task.completed && 
        task.dueDate && 
        task.dueDate === today
    );
    
    if (upcomingTasks.length > 0) {
        showReminderModal(upcomingTasks);
        
        if (Notification.permission === 'granted') {
            upcomingTasks.forEach(task => {
                new Notification('Task Due Today! 📋', {
                    body: `${task.text} - Due ${task.dueTime ? formatTime(task.dueTime) : 'today'}`,
                    icon: '/icon.png'
                });
            });
        }
    }
}

function showReminderModal(tasks) {
    elements.reminderList.innerHTML = tasks
        .sort((a, b) => {
            if (a.dueTime && b.dueTime) {
                return a.dueTime.localeCompare(b.dueTime);
            }
            return 0;
        })
        .map(task => `
            <li>
                <span>${task.text}</span>
                <span class="reminder-due">
                    ${task.dueTime ? formatTime(task.dueTime) : 'All day'}
                </span>
            </li>
        `).join('');
    
    elements.reminderModal.style.display = 'flex';
}

// ===== HELPER FUNCTIONS =====
function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}
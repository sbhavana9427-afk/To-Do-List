// ====== DOM ELEMENTS ======
const themeToggle = document.getElementById('theme-toggle');
const clockDisplay = document.getElementById('clock');
const dateDisplay = document.getElementById('date');

const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');
const clearTasksBtn = document.getElementById('clear-tasks-btn');

const tasksCompletedCount = document.getElementById('tasks-completed-count');
const tasksTotalCount = document.getElementById('tasks-total-count');
const progressBar = document.getElementById('progress-bar');
const progressPercentageText = document.getElementById('progress-percentage-text');

const timerDisplayMin = document.getElementById('minutes');
const timerDisplaySec = document.getElementById('seconds');
const workModeBtn = document.getElementById('work-mode-btn');
const breakModeBtn = document.getElementById('break-mode-btn');
const startTimerBtn = document.getElementById('start-timer-btn');
const pauseTimerBtn = document.getElementById('pause-timer-btn');
const resetTimerBtn = document.getElementById('reset-timer-btn');

const notesArea = document.getElementById('notes-area');
const notesStatus = document.getElementById('notes-status');

const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');

// ====== STATE Variables ======
let tasks = JSON.parse(localStorage.getItem('student_tasks')) || [];
let isDarkMode = JSON.parse(localStorage.getItem('student_dark_mode')) || false;
let notes = localStorage.getItem('student_notes') || '';

// Pomodoro State
let pomodoroTime = 25 * 60; // 25 minutes in seconds
let currentMode = 'work'; // 'work' or 'break'
let timerInterval = null;
let isTimerRunning = false;

// Quotes Array
const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "Procrastination is the thief of time.", author: "Edward Young" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
];


// ====== INITIALIZATION ======
function init() {
    // Apply Dark Mode
    if (isDarkMode) {
        document.body.classList.add('dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }

    // Set Random Quote
    setRandomQuote();

    // Init Clock
    updateClock();
    setInterval(updateClock, 1000);

    // Init Notes
    notesArea.value = notes;

    // Render Tasks
    renderTasks();
    updateProgress();
    
    // Init Timer Display
    updateTimerDisplay();
}

// ====== CLOCK & DATE ======
function updateClock() {
    const now = new Date();
    
    // Time
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    
    // Date
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString('en-US', options);
}

// ====== DARK MODE ======
themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark');
    
    if (isDarkMode) {
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
    
    localStorage.setItem('student_dark_mode', JSON.stringify(isDarkMode));
});

// ====== QUOTES ======
function setRandomQuote() {
    const min = 0;
    const max = quotes.length - 1;
    const randomIndex = Math.floor(Math.random() * (max - min + 1)) + min;
    const selectedQuote = quotes[randomIndex];
    
    quoteText.textContent = `"${selectedQuote.text}"`;
    quoteAuthor.textContent = `- ${selectedQuote.author}`;
}

// ====== TO-DO LIST ======
function renderTasks() {
    todoList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="todo-item-left">
                <div class="checkbox" onclick="toggleTask(${task.id})">
                    <i class="fa-solid fa-check"></i>
                </div>
                <span class="todo-text">${task.text}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        todoList.appendChild(li);
    });
}

function addTask() {
    const text = todoInput.value.trim();
    if (text === '') {
        alert('Please enter a task.');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };
    
    tasks.push(newTask);
    saveTasks();
    todoInput.value = '';
    renderTasks();
    updateProgress();
}

// Attach to window object to be called from inline onclick handlers
window.toggleTask = function(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
    updateProgress();
};

window.deleteTask = function(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateProgress();
};

clearTasksBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all tasks?')) {
        tasks = [];
        saveTasks();
        renderTasks();
        updateProgress();
    }
});

addTodoBtn.addEventListener('click', addTask);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

function saveTasks() {
    localStorage.setItem('student_tasks', JSON.stringify(tasks));
}

// ====== PROGRESS TRACKER ======
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    
    tasksTotalCount.textContent = total;
    tasksCompletedCount.textContent = completed;
    
    let percentage = 0;
    if (total > 0) {
        percentage = Math.round((completed / total) * 100);
    }
    
    progressBar.style.width = `${percentage}%`;
    progressPercentageText.textContent = percentage;
}

// ====== POMODORO TIMER ======
function updateTimerDisplay() {
    let minutes = Math.floor(pomodoroTime / 60);
    let seconds = pomodoroTime % 60;
    
    timerDisplayMin.textContent = minutes < 10 ? '0' + minutes : minutes;
    timerDisplaySec.textContent = seconds < 10 ? '0' + seconds : seconds;
}

function switchMode(mode) {
    if (isTimerRunning) return; // Don't switch if running
    
    currentMode = mode;
    if (mode === 'work') {
        pomodoroTime = 25 * 60;
        workModeBtn.classList.add('active');
        breakModeBtn.classList.remove('active');
    } else {
        pomodoroTime = 5 * 60;
        breakModeBtn.classList.add('active');
        workModeBtn.classList.remove('active');
    }
    updateTimerDisplay();
}

workModeBtn.addEventListener('click', () => switchMode('work'));
breakModeBtn.addEventListener('click', () => switchMode('break'));

startTimerBtn.addEventListener('click', () => {
    if (!isTimerRunning) {
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            if (pomodoroTime > 0) {
                pomodoroTime--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                isTimerRunning = false;
                alert(`${currentMode === 'work' ? 'Work session' : 'Break'} complete!`);
                // Auto switch and reset
                switchMode(currentMode === 'work' ? 'break' : 'work');
            }
        }, 1000);
    }
});

pauseTimerBtn.addEventListener('click', () => {
    isTimerRunning = false;
    clearInterval(timerInterval);
});

resetTimerBtn.addEventListener('click', () => {
    isTimerRunning = false;
    clearInterval(timerInterval);
    switchMode(currentMode); // Reset current mode's time
});


// ====== NOTES ======
let notesTimeout;
notesArea.addEventListener('input', () => {
    notesStatus.textContent = 'Saving...';
    clearTimeout(notesTimeout);
    
    notesTimeout = setTimeout(() => {
        localStorage.setItem('student_notes', notesArea.value);
        notesStatus.textContent = 'Saved automatically';
    }, 1000);
});

// Run Initialization
init();

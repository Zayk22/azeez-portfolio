// DOM Elements
const elements = {
    progressBar: document.getElementById('progressBar'),
    currentQSpan: document.getElementById('currentQ'),
    totalQsSpan: document.getElementById('totalQs'),
    startScreen: document.getElementById('startScreen'),
    quizContainer: document.getElementById('quizContainer'),
    resultsScreen: document.getElementById('resultsScreen'),
    startBtn: document.getElementById('startBtn'),
    questionEl: document.getElementById('question'),
    optionsEl: document.getElementById('options'),
    feedbackEl: document.getElementById('feedback'),
    timeEl: document.getElementById('time'),
    scoreEl: document.getElementById('score'),
    scoreForm: document.getElementById('scoreForm'),
    initialsInput: document.getElementById('initials'),
    highScoresList: document.getElementById('highScoresList'),
    restartBtn: document.getElementById('restartBtn'),
    timerDisplay: document.getElementById('timerDisplay'),
    performanceMessage: document.getElementById('performanceMessage')
};

// Quiz State
let currentQuestion = 0;
let score = 0;
let timeLeft = 60;
let timer;
let answerSelected = false;

// Questions Array
const questions = [
    {
        question: "What does 'DOM' stand for?",
        options: [
            "Document Object Model", 
            "Digital Orientation Method",
            "Data Object Management"
        ],
        answer: 0
    },
    {
        question: "Which operator returns true if two values are equal in value and type?",
        options: [
            "==",
            "===",
            "="
        ],
        answer: 1
    },
    {
        question: "What does 'JSON' stand for?",
        options: [
            "JavaScript Object Notation",
            "JavaScript Oriented Networking",
            "JavaScript Operator Namespace"
        ],
        answer: 0
    },
    {
        question: "Which method adds an element to the end of an array?",
        options: [
            "array.push()",
            "array.pop()",
            "array.shift()"
        ],
        answer: 0
    },
    {
        question: "What is the correct way to declare a constant in JavaScript?",
        options: [
            "let constantName;",
            "var constantName;",
            "const constantName;"
        ],
        answer: 2
    },
    {
        question: "Which HTML tag is used to link a JavaScript file?",
        options: [
            "<script>",
            "<javascript>",
            "<js>"
        ],
        answer: 0
    },
    {
        question: "What will 'console.log(typeof null)' output?",
        options: [
            "object",
            "null",
            "undefined"
        ],
        answer: 0
    },
    {
        question: "Which method converts a string to lowercase?",
        options: [
            "string.toLowerCase()",
            "string.toLower()",
            "string.lowerCase()"
        ],
        answer: 0
    },
    {
        question: "What does the 'this' keyword refer to in a method?",
        options: [
            "The function itself",
            "The object that owns the method",
            "The global object"
        ],
        answer: 1
    },
    {
        question: "Which array method creates a new array with filtered elements?",
        options: [
            "array.filter()",
            "array.map()",
            "array.reduce()"
        ],
        answer: 0
    },
    {
        question: "What does CSS stand for?",
        options: [
            "Cascading Style Sheets",
            "Computer Style Sheets",
            "Creative Style Sheets"
        ],
        answer: 0
    },
    {
        question: "Which symbol is used for single-line comments in JavaScript?",
        options: [
            "//",
            "/*",
            "#"
        ],
        answer: 0
    },
    {
        question: "What does the 'querySelector()' method return?",
        options: [
            "An array of elements",
            "The first matching element",
            "All matching elements"
        ],
        answer: 1
    },
    {
        question: "Which event occurs when a user clicks an element?",
        options: [
            "onhover",
            "onclick",
            "onchange"
        ],
        answer: 1
    },
    {
        question: "What is the correct syntax for an arrow function?",
        options: [
            "function => {}",
            "() => {}",
            "() -> {}"
        ],
        answer: 1
    },
    {
        question: "Which method parses a JSON string into an object?",
        options: [
            "JSON.parse()",
            "JSON.stringify()",
            "JSON.toObject()"
        ],
        answer: 0
    },
    {
        question: "What does 'NaN' stand for?",
        options: [
            "Not a Number",
            "Null and None",
            "New Assignment"
        ],
        answer: 0
    },
    {
        question: "Which loop is best for iterating through an array?",
        options: [
            "for...in",
            "for...of",
            "while"
        ],
        answer: 1
    },
    {
        question: "What does 'API' stand for?",
        options: [
            "Application Programming Interface",
            "Automated Programming Instruction",
            "Advanced Program Interaction"
        ],
        answer: 0
    },
    {
        question: "Which method adds an element to the beginning of an array?",
        options: [
            "array.push()",
            "array.unshift()",
            "array.shift()"
        ],
        answer: 1
    }
];

// Initialize Application
function initApp() {
    elements.totalQsSpan.textContent = questions.length;
    loadHighScores();
    
    // Event Listeners
    elements.startBtn.addEventListener('click', startQuiz);
    elements.scoreForm.addEventListener('submit', saveScore);
    elements.restartBtn.addEventListener('click', restartQuiz);
    
    // Portfolio button
    document.getElementById('portfolioBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('#', '_blank'); // Replace with actual portfolio URL
    });
}

// Start Quiz
function startQuiz() {
    // Reset state
    currentQuestion = 0;
    score = 0;
    timeLeft = 60;
    answerSelected = false;
    
    // Update UI
    elements.startScreen.style.display = 'none';
    elements.quizContainer.style.display = 'block';
    elements.resultsScreen.style.display = 'none';
    elements.timeEl.textContent = timeLeft;
    elements.timerDisplay.classList.remove('warning');
    
    // Clear any existing timer
    if (timer) clearInterval(timer);
    
    // Start timer
    timer = setInterval(() => {
        timeLeft--;
        elements.timeEl.textContent = timeLeft;
        
        // Timer warning effect
        if (timeLeft <= 10) {
            elements.timerDisplay.classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            endQuiz();
        }
    }, 1000);
    
    loadQuestion();
}

// Load Question
function loadQuestion() {
    const question = questions[currentQuestion];
    elements.questionEl.textContent = question.question;
    elements.optionsEl.innerHTML = '';
    answerSelected = false;
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option-btn');
        button.dataset.index = index;
        button.addEventListener('click', () => selectAnswer(index));
        elements.optionsEl.appendChild(button);
    });
    
    // Update progress
    elements.currentQSpan.textContent = currentQuestion + 1;
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    elements.progressBar.style.width = `${progress}%`;
    
    // Add slide animation
    elements.quizContainer.style.animation = 'none';
    elements.quizContainer.offsetHeight;
    elements.quizContainer.style.animation = 'fadeIn 0.5s ease-out';
}

// Select Answer
function selectAnswer(selectedIndex) {
    if (answerSelected) return;
    answerSelected = true;
    
    const question = questions[currentQuestion];
    const options = document.querySelectorAll('.option-btn');
    const isCorrect = selectedIndex === question.answer;
    
    // Handle correct/incorrect
    if (isCorrect) {
        score++;
        elements.feedbackEl.innerHTML = '<i class="fas fa-check-circle"></i> Correct!';
        elements.feedbackEl.style.color = '#4caf50';
    } else {
        timeLeft = Math.max(0, timeLeft - 10);
        elements.feedbackEl.innerHTML = '<i class="fas fa-times-circle"></i> Incorrect!';
        elements.feedbackEl.style.color = '#f44336';
    }
    
    // Visual feedback for options
    options.forEach((option, index) => {
        option.disabled = true;
        
        if (index === question.answer) {
            option.classList.add('correct-highlight');
        }
        
        if (index === selectedIndex) {
            option.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
    });
    
    // Move to next question
    setTimeout(() => {
        currentQuestion++;
        
        if (currentQuestion < questions.length) {
            loadQuestion();
            elements.feedbackEl.innerHTML = '';
        } else {
            endQuiz();
        }
    }, 1500);
}

// End Quiz
function endQuiz() {
    clearInterval(timer);
    elements.quizContainer.style.display = 'none';
    elements.resultsScreen.style.display = 'block';
    elements.scoreEl.textContent = score;
    
    // Set performance message
    let message = '';
    if (score <= 5) message = 'Beginner - Keep Learning! 🌱';
    else if (score <= 10) message = 'Intermediate - Good Progress! 📚';
    else if (score <= 15) message = 'Advanced - Great Knowledge! ⭐';
    else message = 'Pro - JavaScript Master! 👑';
    
    elements.performanceMessage.textContent = message;
}

// Save Score
function saveScore(e) {
    e.preventDefault();
    const initials = elements.initialsInput.value.trim().toUpperCase();
    if (!initials || initials.length !== 3) return;
    
    const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    scores.push({ initials, score, date: new Date().toLocaleDateString() });
    scores.sort((a, b) => b.score - a.score);
    
    // Keep only top 5
    const topScores = scores.slice(0, 5);
    localStorage.setItem('quizScores', JSON.stringify(topScores));
    
    loadHighScores();
    elements.initialsInput.value = '';
}

// Load High Scores
function loadHighScores() {
    const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    elements.highScoresList.innerHTML = scores
        .map((entry, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
            return `<li>${medal} ${entry.initials} - ${entry.score}/20 <span class="score-date">${entry.date || ''}</span></li>`;
        })
        .join('');
    
    // Add counter for list styling
    elements.highScoresList.style.counterReset = 'item';
}

// Restart Quiz
function restartQuiz() {
    elements.resultsScreen.style.display = 'none';
    elements.startScreen.style.display = 'block';
    elements.feedbackEl.innerHTML = '';
    elements.timerDisplay.classList.remove('warning');
    
    // Reset any lingering timer
    if (timer) clearInterval(timer);
}

// Initialize the app
initApp();
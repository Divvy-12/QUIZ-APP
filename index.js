const namePopup = document.querySelector('.name-popup');
const configPopup = document.querySelector('.config-popup');
const startBtn = document.querySelector('.start-quiz-btn');
const quizPopup = document.querySelector('.quiz-popup');
const timerDisplay = document.querySelector('.timer-duration');
const nextQuestionBtn = document.querySelector('.next-question-btn');
const questionStatus = document.querySelector('.question-status');
const answerOptions = document.querySelector('.answer-options');
const quizContainer = document.querySelector('.quiz-popup');
const configContainer = document.querySelector('.config-popup');
const resultContainer = document.querySelector('.result-popup');
const usernameInput = document.querySelector('.username-input');
const welcomeMessage = document.querySelector('.welcome-message');
const continueBtn = document.querySelector('.continue-btn');
const questionText = document.querySelector('.question-text');
const nameError = document.querySelector('.name-error');


let username = '';
let totalQuizTime = 15;
let timer = null;
let quizCategory = 'programming';
let numberOfQuestions = 10;
let currentQuestion = null;
let correctAnswersCount = 0;
let disableSelection = false;
let questionsIndexHistory = [];

// Time Limit Calculation
const getTimeLimit = () => {
  if (numberOfQuestions === 5) return 8;
  if (numberOfQuestions === 10) return 15;
  if (numberOfQuestions === 15) return 20;
  if (numberOfQuestions === 20) return 25;
  if (numberOfQuestions === 25) return 30;
  return 15;
};

// Validate Name Input
// Validate Name Input (Corrected)
const validateName = () => {
  username = usernameInput.value.trim();

  if (!username) {
    nameError.textContent = "Please enter your name.";
    return false;
  }

  if (username.length < 3) {
    nameError.textContent = "Name must be at least 3 characters.";
    return false;
  }

  if (username.length > 50) {
    nameError.textContent = "Name must not exceed 50 characters.";
    return false;
  }

  const namePattern = /^[a-zA-Z0-9_]+$/;
  if (!namePattern.test(username)) {
    nameError.textContent = "Name can only contain letters, numbers, and underscores.";
    return false;
  }

  if (/^\d+$/.test(username)) {
    nameError.textContent = "Name cannot be only numbers.";
    return false;
  }

  nameError.textContent = ""; // Valid input
  return true;
};



const showCategorySelection = () => {
  if (!validateName()) return;

  // Store the name and show welcome message
  localStorage.setItem('username', username);
  welcomeMessage.textContent = `Welcome ${username}, ready to test your knowledge in different categories?`;

  namePopup.classList.remove('active');
  configPopup.classList.add('active');
};

// Start Quiz
const startQuiz = () => {
 
  const selectedCategory = configPopup.querySelector('.category-option.active');
  const selectedQuestionCount = configPopup.querySelector('.question-option.active');

  quizCategory = selectedCategory ? selectedCategory.textContent.trim().toLowerCase() : 'programming';
  numberOfQuestions = selectedQuestionCount ? parseInt(selectedQuestionCount.textContent) : 10;

  

  configPopup.classList.remove('active');
  quizPopup.classList.add('active');

  renderQuestion();
};

// Render Quiz Question
const renderQuestion = () => {
  currentQuestion = getRandomQuestion();
  if (!currentQuestion) {
    showQuizResult();
    return;
  }

  disableSelection = false;
  nextQuestionBtn.style.visibility = 'hidden';

  totalQuizTime = getTimeLimit();
  clearInterval(timer);
  timerDisplay.textContent = `${totalQuizTime}s`;
  timer = setInterval(() => {
    totalQuizTime--;
    timerDisplay.textContent = `${totalQuizTime}s`;
    if (totalQuizTime <= 0) {
      clearInterval(timer);
      disableSelection = true;
      highlightCorrectAnswer();
      answerOptions.querySelectorAll('.answer-option').forEach(opt => opt.style.pointerEvents = 'none');
      nextQuestionBtn.style.visibility = 'visible';
    }
  }, 1000);

  questionText.textContent = currentQuestion.question;
  questionStatus.innerHTML = `<b>${questionsIndexHistory.length}</b> of <b>${numberOfQuestions}</b> Questions`;
  answerOptions.innerHTML = '';

  currentQuestion.options.forEach((option, index) => {
    const li = document.createElement("li");
    li.classList.add('answer-option');
    li.textContent = option;
    answerOptions.appendChild(li);
    li.addEventListener("click", () => handleAnswer(li, index));
  });
};

// Get Random Question
const getRandomQuestion = () => {
  const categoryData = questions.find(q => q.category.toLowerCase() === quizCategory.toLowerCase());
  if (!categoryData) return null;

  const categoryQuestions = categoryData.questions;
  if (questionsIndexHistory.length >= Math.min(numberOfQuestions, categoryQuestions.length)) {
    return null;
  }

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * categoryQuestions.length);
  } while (questionsIndexHistory.includes(randomIndex));

  questionsIndexHistory.push(randomIndex);
  return categoryQuestions[randomIndex];
};

// Handle Answer Selection
const handleAnswer = (option, answerIndex) => {
  if (disableSelection) return;
  disableSelection = true;
  clearInterval(timer);

  const isCorrect = currentQuestion.correctAnswer === answerIndex;
  option.classList.add(isCorrect ? "correct" : "incorrect");

  if (isCorrect) {
    correctAnswersCount++;
  } else {
    highlightCorrectAnswer();
  }

  const iconHTML = `<span class="material-symbols-rounded">${isCorrect ? "check_circle" : "cancel"}</span>`;
  option.insertAdjacentHTML("beforeend", iconHTML);
  answerOptions.querySelectorAll('.answer-option').forEach(opt => opt.style.pointerEvents = 'none');
  nextQuestionBtn.style.visibility = 'visible';
};

// Highlight Correct Answer
const highlightCorrectAnswer = () => {
  const correctOption = answerOptions.querySelectorAll(".answer-option")[currentQuestion.correctAnswer];
  correctOption.classList.add("correct");
  const iconHTML = `<span class="material-symbols-rounded">check_circle</span>`;
  correctOption.insertAdjacentHTML("beforeend", iconHTML);
};

// Show Result
const showQuizResult = () => {
  clearInterval(timer);
  quizPopup.classList.remove("active");
  resultContainer.classList.add("active");

  const percentage = (correctAnswersCount / numberOfQuestions) * 100;
  let feedback = '';

  if (percentage === 100) {
    feedback = "Perfect! You're a genius!";
  } else if (percentage >= 80) {
    feedback = "Great job! You really know your stuff.";
  } else if (percentage >= 50) {
    feedback = "Not bad, but there's room for improvement.";
  } else {
    feedback = "Keep practicing and you'll get better!";
  }

  const resultText =
    `<b>${username}</b>, you answered <b>${correctAnswersCount}</b> out of <b>${numberOfQuestions}</b> questions in the <b>${quizCategory}</b> category.<br/>
     ${feedback}`;

  resultContainer.querySelector(".result-message").innerHTML = resultText;
  localStorage.setItem("lastQuizResult", JSON.stringify({
    username,
    category: quizCategory,
    score: correctAnswersCount,
    total: numberOfQuestions
  }));
};

// Reset Quiz
const resetQuiz = () => {
  clearInterval(timer);
  correctAnswersCount = 0;
  questionsIndexHistory = [];
  namePopup.classList.add('active');
  resultContainer.classList.remove("active");
};

// Event Listeners
configContainer.querySelectorAll(".category-option, .question-option").forEach(option => {
  option.addEventListener("click", () => {
    const currentActive = option.parentNode.querySelector(".active");
    if (currentActive) currentActive.classList.remove("active");
    option.classList.add("active");
  });
});


continueBtn.addEventListener("click", showCategorySelection);  
startBtn.addEventListener("click", startQuiz);
nextQuestionBtn.addEventListener("click", renderQuestion);
resultContainer.querySelector(".try-again-btn").addEventListener("click", resetQuiz);



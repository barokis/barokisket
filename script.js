/*const questions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Paris", "Berlin", "Rome"],
    correctAnswers: [1, 2]
  },
  {
    question: "Which planet is closest to the Sun?",
    options: ["Venus", "Mercury", "Mars", "Jupiter"],
    correctAnswers: [1]
  },
  // Add more questions here...
];*/

const allQuestions = []
let questions = []
let review = false;

let currentQuestion = 0;
let score = 0;
let userAnswers = [];

function showQuestion() {
  const questionElement = document.getElementById("question");
  const optionsElement = document.getElementById("options");
  const questionListElement = document.getElementById("question-list");
  const image = document.getElementById("image");
  const explanations_title = document.getElementById("explanations-title");
  const explanations = document.getElementById("explanations");

  questionElement.textContent = questions[currentQuestion].question;
  explanations_title.textContent = questions[currentQuestion].explanations_title;
  explanations.innerHTML = "";
  optionsElement.innerHTML = "";
  image.innerHTML = `<img src='${questions[currentQuestion].image_url}'>`

  for (let i = 0; i < questions[currentQuestion].options.length; i++) {
    const option = questions[currentQuestion].options[i];
    const optionElement = document.createElement("label");
    optionElement.innerHTML = `
        <input type="checkbox" name="answer" value="${i}" ${userAnswers[currentQuestion] && userAnswers[currentQuestion].includes(i) ? "checked" : ""
      } ${review ? "disabled" : ""}>
        ${option}
      `;
      if(review == true) {
        if (questions[currentQuestion].correctAnswers.includes(i)) {
          optionElement.classList.add("correct");
        } else {
          optionElement.classList.add("wrong");
        }
      }
    optionsElement.appendChild(optionElement);
  }
  if(review == true) {
    explanations.innerHTML = questions[currentQuestion].explanation1 + questions[currentQuestion].explanation2;
  }

  // Update question list
  questionListElement.innerHTML = "";
  for (let i = 0; i < questions.length; i++) {
    const circle = document.createElement("div");
    circle.classList.add("circle");
    if (i === currentQuestion) {
      circle.classList.add("active");
    }
    if(review == true) {
      if (questions[i].correct) {
        circle.classList.add("correct");
      } else {
        circle.classList.add("wrong");
      }
    }
    circle.textContent = i+1
    circle.setAttribute("onclick", `goToQuestion(${i})`);
    questionListElement.appendChild(circle);
  }
}

function startQuiz() {
  const startPage = document.getElementById("start-page");
  const questionPage = document.getElementById("question-page");

  startPage.style.display = "none";
  questionPage.style.display = "block";

  fetch("klausimai.json")
    .then(response => response.json())
    .then(quests => {
      allQuestions.push(...quests);
      for(q of allQuestions) {
        if(q.id.endsWith('kb') && q.image_url != '')
          q.image_url = `https://www.ketbilietai.lt${q.image_url}`
      }
      questions = allQuestions.sort(() => .5 - Math.random()).slice(0,30)
      showQuestion();
    })
}

function checkAnswer() {
  const selectedOptions = document.querySelectorAll('input[name="answer"]:checked');
  const userAnswerIndexes = Array.from(selectedOptions).map((input) => parseInt(input.value, 10));
  userAnswers[currentQuestion] = userAnswerIndexes;
}

function nextQuestion() {
  checkAnswer();

  currentQuestion++;

  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function goToQuestion(questionIndex) {
  checkAnswer();

  currentQuestion = questionIndex;
  showQuestion();
}

function showResult() {
  const questionPage = document.getElementById("question-page");
  const resultPage = document.getElementById("result-page");
  const scoreElement = document.getElementById("score");
  const totalQuestionsElement = document.getElementById("total-questions");
  const percentageElement = document.getElementById("percentage");

  resultPage.style.display = "block";
  questionPage.style.display = "none";

  const finalScore = calculateScore();
  scoreElement.textContent = finalScore;
  totalQuestionsElement.textContent = questions.length;
  percentageElement.textContent = `(${Math.round(finalScore*100/questions.length)}%)`;
}

function calculateScore() {
  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    const correctAnswers = questions[i].correctAnswers;
    const userAnswerIndexes = userAnswers[i] || [];

    if (correctAnswers.length === userAnswerIndexes.length && correctAnswers.every((index) => userAnswerIndexes.includes(index))) {
      score++;
      questions[i]['correct'] = true;
    } else {
      questions[i]['correct'] = false;
    }
  }
  return score;
}

function reviewAnswers() {
  review = true;
  const questionPage = document.getElementById("question-page");
  const resultPage = document.getElementById("result-page");

  //resultPage.style.display = "none";
  questionPage.style.display = "block";
  currentQuestion = 0;
  showQuestion();
}

function restartQuiz() {
  review = false;
  const resultPage = document.getElementById("result-page");
  const startPage = document.getElementById("start-page");
  const questionPage = document.getElementById("question-page");
  const reviewQuestionsElement = document.getElementById("review-questions");

  reviewQuestionsElement.innerHTML = "";
  reviewQuestionsElement.style.display = "none";
  startPage.style.display = "none";
  resultPage.style.display = "none";
  questionPage.style.display = "block";
  userAnswers = [];
  currentQuestion = 0;
  questions = allQuestions.sort(() => .5 - Math.random()).slice(0,30);
  
  showQuestion();
}

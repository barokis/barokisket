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

let currentQuestion = 0;
let score = 0;
let userAnswers = [];

function showQuestion() {
  const questionElement = document.getElementById("question");
  const optionsElement = document.getElementById("options");
  const questionListElement = document.getElementById("question-list");
  const image = document.getElementById("image");
  const explanations = document.getElementById("explanations-title");

  questionElement.textContent = questions[currentQuestion].question;
  explanations.textContent = questions[currentQuestion].explanations_title;
  optionsElement.innerHTML = "";

  if(questions[currentQuestion].image == "1") {
    image.innerHTML = `<img src='img/${questions[currentQuestion].id}.jpg'>`
  }
  else if (questions[currentQuestion].image == "2") {
    image.innerHTML = `<img src='img/${questions[currentQuestion].id}.gif'>`
  }
  else {
    image.innerHTML = "";
  }

  for (let i = 0; i < questions[currentQuestion].options.length; i++) {
    const option = questions[currentQuestion].options[i];
    const optionElement = document.createElement("label");
    optionElement.innerHTML = `
        <input type="checkbox" name="answer" value="${i}" ${userAnswers[currentQuestion] && userAnswers[currentQuestion].includes(i) ? "checked" : ""
      } ${currentQuestion >= questions.length ? "disabled" : ""}>
        ${option}
      `;
    optionsElement.appendChild(optionElement);
  }

  // Update question list
  questionListElement.innerHTML = "";
  for (let i = 0; i < questions.length; i++) {
    const circle = document.createElement("div");
    circle.classList.add("circle");
    if (i === currentQuestion) {
      circle.classList.add("active");
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

  fetch("klausimai2.xml")
    .then(response => response.text())
    .then(xmlString => {
      // Create a new DOMParser
      const parser = new DOMParser();

      // Parse the XML string
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");

      // Define the XPath expression to retrieve items
      const xpathExpression = "/root/item";

      // Evaluate the XPath expression
      const items = xmlDoc.evaluate(xpathExpression, xmlDoc, null, XPathResult.ANY_TYPE, null);

      // Iterate through the items
      let itemNode = items.iterateNext();
      while (itemNode) {
        // Access the item attributes and elements
        const id = itemNode.getAttribute("id");
        const question = itemNode.querySelector("question").textContent;
        const correctAnswers = itemNode.querySelector("question").getAttribute("correct_answers").split(",").map(x => x-1);
        const image = itemNode.querySelector("question").getAttribute("image");
        const explanation = itemNode.querySelector("question").getAttribute("explanations_title");

        const answerNodes = itemNode.querySelectorAll("answers item");
        const answerArray = Array.from(answerNodes).map((node) => node.textContent);

        //console.log(`Item ${id}:`);
        //console.log(`Question: ${question}`);
        //console.log(`Answers: ${answerArray.join(", ")}`);
        //console.log(`Correct answers: ${correctAnswers}`);
        //console.log("------");

        const item = {
          question: question,
          id: id,
          options: answerArray,
          image: image,
          correctAnswers: correctAnswers,
          explanations_title: explanation
        }
        allQuestions.push(item);

        itemNode = items.iterateNext();
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

  resultPage.style.display = "block";
  questionPage.style.display = "none";

  const finalScore = calculateScore();
  scoreElement.textContent = finalScore;
  totalQuestionsElement.textContent = questions.length;
}

function calculateScore() {
  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    const correctAnswers = questions[i].correctAnswers;
    const userAnswerIndexes = userAnswers[i] || [];

    if (correctAnswers.length === userAnswerIndexes.length && correctAnswers.every((index) => userAnswerIndexes.includes(index))) {
      score++;
    }
  }
  return score;
}

function reviewAnswers() {
  const questionPage = document.getElementById("question-page");
  const resultPage = document.getElementById("result-page");
  const reviewQuestionsElement = document.getElementById("review-questions");

  questionPage.style.display = "none";
  resultPage.style.display = "block";

  reviewQuestionsElement.innerHTML = "";
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const userAnswerIndexes = userAnswers[i] || [];

    const reviewQuestionElement = document.createElement("div");
    reviewQuestionElement.classList.add("review-question");

    const questionHeader = document.createElement("h3");
    questionHeader.textContent = question.question;
    reviewQuestionElement.appendChild(questionHeader);
    //IMAGE
    if(questions[i].image != "0") {
      const image = document.createElement("img");
      image.setAttribute('src', `img/${questions[i].id}.${questions[i].image == "1" ? "jpg" : "gif"}`);
      reviewQuestionElement.appendChild(image);
    }
    const explanationsTitle = document.createElement("b");
    explanationsTitle.textContent = question.explanations_title;
    reviewQuestionElement.appendChild(explanationsTitle);
    const optionsList = document.createElement("ul");
    for (let j = 0; j < question.options.length; j++) {
      const option = question.options[j];
      const optionItem = document.createElement("li");
      optionItem.textContent = option;
      if (userAnswerIndexes.includes(j)) {
        optionItem.classList.add("selected");
      }
      if (question.correctAnswers.includes(j)) {
        optionItem.classList.add("correct");
      }
      optionsList.appendChild(optionItem);
    }
    reviewQuestionElement.appendChild(optionsList);

    reviewQuestionsElement.appendChild(reviewQuestionElement);
  }

  reviewQuestionsElement.style.display = "block";
}

function restartQuiz() {
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

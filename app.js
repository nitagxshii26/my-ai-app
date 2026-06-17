// app.js — AI Q&A App

const questionInput = document.getElementById("question-input");
const askButton = document.getElementById("ask-button");
const answerArea = document.getElementById("answer-area");

askButton.addEventListener("click", async () => {
  const question = questionInput.value.trim();

  if (!question) {
    answerArea.textContent = "Please type a question first.";
    return;
  }

  answerArea.textContent = "Thinking...";

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();

    if (data.answer) {
      answerArea.textContent = data.answer;
    } else {
      answerArea.textContent = "Something went wrong, please try again.";
    }
  } catch (error) {
    console.error("API error:", error);
    answerArea.textContent = "Something went wrong, please try again.";
  }
});

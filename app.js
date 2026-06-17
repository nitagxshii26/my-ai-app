/**
 * My AI App — client-side logic.
 *
 * Sends the user's question to OpenRouter and displays the AI-generated answer.
 */

(function () {
  "use strict";

  // ── Configuration ────────────────────────────────
  const API_URL = "/api/ask";

  // ── DOM references ──────────────────────────────
  const questionInput = document.getElementById("question-input");
  const askButton = document.getElementById("ask-button");
  const answerArea = document.getElementById("answer-area");

  // ── Helpers ─────────────────────────────────────
  /**
   * Set the answer area to the "Thinking…" loading state.
   */
  function showThinking() {
    answerArea.innerHTML = '<p class="thinking-text">Thinking…</p>';
  }

  /**
   * Display the AI answer in the answer area.
   * @param {string} text
   */
  function showAnswer(text) {
    answerArea.innerHTML = '<p class="answer-text">' + escapeHtml(text) + "</p>";
  }

  /**
   * Display a friendly error message.
   */
  function showError() {
    answerArea.innerHTML =
      '<p class="error-text">Something went wrong, please try again.</p>';
  }

  /**
   * Escape HTML special characters so they render as text rather than markup.
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ── API call ────────────────────────────────────
  /**
   * Send the user's question to OpenRouter and update the UI.
   * @param {string} question
   */
  async function askAI(question) {
    askButton.disabled = true;
    showThinking();

    try {
      var response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question }),
      });

      if (!response.ok) {
        throw new Error("API responded with status " + response.status);
      }

      var data = await response.json();
      showAnswer(data.answer);
    } catch (error) {
      console.error("OpenRouter request failed:", error);
      showError();
    } finally {
      askButton.disabled = false;
    }
  }

  // ── Event listeners ──────────────────────────────
  askButton.addEventListener("click", function () {
    var question = questionInput.value.trim();
    if (question.length === 0) return; // ignore empty input
    askAI(question);
  });

  // Allow Enter to submit (Shift+Enter for newline)
  questionInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askButton.click();
    }
  });
})();

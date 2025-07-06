// js/utils.js

export function displayVoteMessage(voteMessageElement, text, isError = false) {
  if (!voteMessageElement) return;
  voteMessageElement.textContent = text;
  voteMessageElement.classList.remove("hidden");
  if (isError) {
    voteMessageElement.style.backgroundColor = "#ffe0e0";
    voteMessageElement.style.color = "#dc3545";
    voteMessageElement.style.border = "1px solid #dc3545";
  } else {
    voteMessageElement.style.backgroundColor = "#e0ffe0";
    // FIX IS HERE: Changed 'voteRMessageElement' to 'voteMessageElement'
    voteMessageElement.style.color = "#28a745";
    voteMessageElement.style.border = "1px solid #28a745";
  }
}

export function clearVoteMessage(voteMessageElement) {
  if (!voteMessageElement) return;
  voteMessageElement.textContent = "";
  voteMessageElement.classList.add("hidden");
  voteMessageElement.style.cssText = "";
}

const messageElement = document.getElementById("message");

export function displayMainMessage(text, isError = false) {
  if (messageElement) {
    messageElement.textContent = text;
    messageElement.classList.remove("hidden");
    if (isError) {
      messageElement.style.backgroundColor = "#ffe0e0";
      messageElement.style.color = "#dc3545";
      messageElement.style.border = "1px solid #dc3545";
    } else {
      messageElement.style.backgroundColor = "#e0ffe0";
      messageElement.style.color = "#28a745";
      messageElement.style.border = "1px solid #28a745";
    }
  }
}

export function clearMainMessage() {
  if (messageElement) {
    messageElement.textContent = "";
    messageElement.classList.add("hidden");
    messageElement.style.cssText = "";
  }
}

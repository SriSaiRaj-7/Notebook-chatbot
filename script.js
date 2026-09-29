const chatForm = document.querySelector("#chat-form");
const messageInput = document.querySelector("#message-input");
const messageList = document.querySelector("#message-list");
const conversation = document.querySelector("#conversation");
const fileInput = document.querySelector("#file-input");
const documentList = document.querySelector("#document-list");
const uploadZone = document.querySelector("#upload-zone");
const docCount = document.querySelector("#doc-count");
const contextCount = document.querySelector("#context-count");
const sendButton = chatForm.querySelector("button[type='submit']");
const sidebarToggle = document.querySelector("#sidebar-toggle");
const mobileBackdrop = document.querySelector("#mobile-backdrop");
const selectAllButton = document.querySelector("#select-all");

function updateDocumentCounts() {
  const items = [...documentList.querySelectorAll(".document-item")];
  const selectedCount = items.filter((item) => item.querySelector("input").checked).length;
  docCount.textContent = items.length;
  contextCount.textContent = `${selectedCount} source${selectedCount === 1 ? "" : "s"} selected`;
  selectAllButton.textContent = selectedCount === items.length ? "Deselect all" : "Select all";
}

function addDocument(file) {
  if (!file.name.toLowerCase().endsWith(".pdf")) return;

  const item = document.createElement("li");
  item.className = "document-item";

  const label = document.createElement("label");
  label.className = "document-row";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = true;
  checkbox.addEventListener("change", updateDocumentCounts);

  const icon = document.createElement("span");
  icon.className = "pdf-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "PDF";

  const info = document.createElement("span");
  info.className = "document-info";
  const name = document.createElement("span");
  name.className = "document-name";
  name.textContent = file.name;
  const details = document.createElement("small");
  details.textContent = "Ready to use";
  info.append(name, details);

  const selectionDot = document.createElement("span");
  selectionDot.className = "selection-dot";
  selectionDot.setAttribute("aria-hidden", "true");

  label.append(checkbox, icon, info, selectionDot);
  item.append(label);
  documentList.append(item);
  updateDocumentCounts();
}

fileInput.addEventListener("change", (event) => {
  [...event.target.files].forEach(addDocument);
  event.target.value = "";
});

uploadZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

["dragenter", "dragover"].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadZone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadZone.classList.remove("is-dragging");
  });
});

uploadZone.addEventListener("drop", (event) => {
  [...event.dataTransfer.files].forEach(addDocument);
});

documentList.addEventListener("change", (event) => {
  if (event.target.matches("input[type='checkbox']")) updateDocumentCounts();
});

selectAllButton.addEventListener("click", () => {
  const items = [...documentList.querySelectorAll(".document-item")];
  const shouldSelect = items.some((item) => !item.querySelector("input").checked);
  items.forEach((item) => { item.querySelector("input").checked = shouldSelect; });
  updateDocumentCounts();
});

function appendUserMessage(text) {
  const article = document.createElement("article");
  article.className = "message user-message";
  const content = document.createElement("div");
  content.className = "message-content";
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  content.append(paragraph);
  article.append(content);
  messageList.append(article);
  return article;
}

function appendAssistantMessage(text) {
  const article = document.createElement("article");
  article.className = "message assistant-message";

  const avatar = document.createElement("div");
  avatar.className = "assistant-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = "✳";

  const content = document.createElement("div");
  content.className = "message-content";
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  content.append(paragraph);
  article.append(avatar, content);
  messageList.append(article);
  return article;
}

function scrollToLatest() {
  conversation.scrollTop = conversation.scrollHeight;
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text || sendButton.disabled) return;

  appendUserMessage(text);
  messageInput.value = "";
  messageInput.style.height = "auto";

  const pending = document.createElement("article");
  pending.className = "message assistant-message";
  pending.innerHTML = '<div class="assistant-avatar" aria-hidden="true">✳</div><div class="message-content"><div class="typing-indicator" aria-label="Thinking"><span></span><span></span><span></span></div></div>';
  messageList.append(pending);
  sendButton.disabled = true;
  scrollToLatest();

  // TODO: connect to FastAPI /chat endpoint
  window.setTimeout(() => {
    pending.remove();
    appendAssistantMessage("That is a thoughtful question. I would look for a few recurring ideas across your selected sources, then connect them to the details that feel most useful to you.");
    sendButton.disabled = false;
    messageInput.focus();
    scrollToLatest();
  }, 900);
});

messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 130)}px`;
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

// TODO: connect to FastAPI /upload endpoint
sidebarToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("sidebar-open");
  sidebarToggle.setAttribute("aria-expanded", String(isOpen));
  mobileBackdrop.hidden = !isOpen;
});

mobileBackdrop.addEventListener("click", () => {
  document.body.classList.remove("sidebar-open");
  sidebarToggle.setAttribute("aria-expanded", "false");
  mobileBackdrop.hidden = true;
});

document.querySelectorAll(".citation-chip, .source-card").forEach((citation) => {
  citation.addEventListener("click", () => {
    const filename = citation.dataset.source;
    document.querySelectorAll(".source-card").forEach((card) => {
      card.classList.toggle("is-highlighted", card.dataset.source === filename);
    });
  });
});

updateDocumentCounts();

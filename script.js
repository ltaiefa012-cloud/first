// DOM Elements
const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const filetInput = promptForm.querySelector("#file-input");
const fileUpoadWrapper = promptForm.querySelector(".file-upload-wrapper");
const themeToggle = document.querySelector("#theme-toggle-btn");

// Chat state
let typingInterval, controller;
const chatHistory = [];
const userData = { message: "", file: {} };

// ==========================================
// Utility Functions
// ==========================================

// Create message HTML element
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// Scroll chat to bottom
const scrollToBottom = () => container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

// Typing effect for bot messages
const typingEffect = (text, textElement, botMsgDIV) => {
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;

    typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            scrollToBottom();
        } else {
            clearInterval(typingInterval);
            botMsgDIV.classList.remove("loading");
            document.body.classList.remove("bot-responding");
        }
    }, 40);
}

// ==========================================
// Generate response from Python backend
// ==========================================
const generateResponse = async (botMsgDIV, userMessage) => {
    const textElement = botMsgDIV.querySelector(".message-text");
    controller = new AbortController();

    // Add user message to chat history
    chatHistory.push({ role: "user", message: userMessage });

    try {
        const response = await fetch("http://localhost:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Server error");

        const responseText = data.response; 
        typingEffect(responseText, textElement, botMsgDIV);

        chatHistory.push({ role: "model", message: responseText });

    } catch (error) {
        textElement.style.color = "#d62939";
        textElement.textContent = error.name === "AbortError" ? "Response generation stopped." : error.message;
        botMsgDIV.classList.remove("loading");
        document.body.classList.remove("bot-responding");
    } finally {
        userData.file = {};
    }
}

// Handle form submission
const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = promptInput.value.trim();
    if (!userMessage || document.body.classList.contains("bot-responding")) return;

    promptInput.value = "";
    userData.message = userMessage;
    document.body.classList.add("bot-responding", "chats-active");
    fileUpoadWrapper.classList.remove("active", "img-attached", "file-attached");

    // User message HTML
    const userMsgHTML = `
        <p class="message-text"></p>
        ${userData.file.data ? (userData.file.isImage ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" />` : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`) : ""}`;

    const userMsgDIV = createMsgElement(userMsgHTML, "user-message");
    userMsgDIV.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDIV);
    scrollToBottom();

    // Bot message
    setTimeout(() => {
        const botMsgHTML = `<img src="img/gemini-chatbot-logo.svg" class="avatar"><p class="message-text">Just a sec...</p>`;
        const botMsgDIV = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatsContainer.appendChild(botMsgDIV);
        scrollToBottom();
        generateResponse(botMsgDIV, userMessage); 
    }, 600);
}

// ==========================================
// File upload handling
// ==========================================
filetInput.addEventListener("change", () => {
    const file = filetInput.files[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
        filetInput.value = "";
        const base64String = e.target.result.split(",")[1];
        fileUpoadWrapper.querySelector(".file-preview").src = e.target.result;
        fileUpoadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached");
        userData.file = { fileName: file.name, data: base64String, mime_type: file.type, isImage };
    }
});

// Cancel file
document.querySelector("#cancel-file-btn").addEventListener("click", () => {
    userData.file = {};
    fileUpoadWrapper.classList.remove("active", "img-attached", "file-attached");
});

// Stop bot response
document.querySelector("#stop-response-btn").addEventListener("click", () => {
    userData.file = {};
    controller?.abort();
    clearInterval(typingInterval);
    chatsContainer.querySelector(".bot-message.loading")?.classList.remove("loading");
    document.body.classList.remove("bot-responding");
});

// Delete all chats
document.querySelector("#delete-chats-btn").addEventListener("click", () => {
    chatHistory.length = 0;
    chatsContainer.innerHTML = "";
    document.body.classList.remove("bot-responding", "chats-active");
});

// Suggestions
document.querySelectorAll(".suggestions-item").forEach(item => {
    item.addEventListener("click", () => {
        promptInput.value = item.querySelector(".text").textContent;
        promptForm.dispatchEvent(new Event("submit"));
    });
});

// Mobile controls toggle
document.addEventListener("click", ({ target }) => {
    const wrapper = document.querySelector(".prompt-wrapper");
    const shouldHide = target.classList.contains("prompt-input") || (wrapper.classList.contains("hide-controls") && (target.id === "add-file-btn" || target.id === "stop-response-btn"));
    wrapper.classList.toggle("hide-controls", shouldHide);
});

// Theme toggle
themeToggle.addEventListener("click", () => {
    const isLightTheme = document.body.classList.toggle("light-theme");
    localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
    themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";
});

// Initial theme
const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
document.body.classList.toggle("light-theme", isLightTheme);
themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";

// Event listeners
promptForm.addEventListener("submit", handleFormSubmit);
promptForm.querySelector("#add-file-btn").addEventListener("click", () => filetInput.click());


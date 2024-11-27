const socket = io();
let name;
let language;
let preferredLanguage;
let textarea = document.querySelector('#textarea');
let messageArea = document.querySelector('.message__area');
const languageSelect = document.getElementById('language'); // Dropdown to select language

// Prompt user for name and language
do {
    name = prompt('Please enter your name: ');
} while (!name);

do {
    preferredLanguage = prompt(
        'Please enter your preferred language code (e.g., "hi-IN" for Hindi, "gu-IN" for Gujrati, "kn-IN" for kannada , "te-IN" for telugu): '
    );
} while (!preferredLanguage);

// Send user preferences to the server
socket.emit('setUserPreferences', {
    name: name,
    lang: preferredLanguage,
});

// Listen for Enter keypress
textarea.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        sendMessage(e.target.value);
    }
});

function sendMessage(message) {
    let lang = preferredLanguage; // Use the user's selected language
    let msg = {
        user: name,
        message: message.trim(),
        lang: lang,
    };

    // Append to the message area
    // appendMessage(msg, 'incoming');
    textarea.value = '';
    scrollToBottom();

    // Send message to the server
    socket.emit('message', msg);
}

function appendMessage(msg, type) {
    let mainDiv = document.createElement('div');
    let className = type;
    mainDiv.classList.add(className, 'message');

    let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
    `;
    mainDiv.innerHTML = markup;
    messageArea.appendChild(mainDiv);
}

// Receive messages
socket.on('message', (msg) => {
    appendMessage(msg, 'incoming');
    scrollToBottom();
});

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}
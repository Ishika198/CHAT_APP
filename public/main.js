import { language } from './language.js';

const BASE_URL = "https://api.mymemory.translated.net/get";

const dropdown = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromLang = document.querySelector(".from select");
const toLang = document.querySelector(".to select");
const inputText = document.querySelector(".input-text");
const outputText = document.querySelector(".output-text");
const msg = document.querySelector(".msg");

// Populate dropdowns with languages from the language.js file
for (let select of dropdown) {
    for (let [code, name] of Object.entries(language)) {
        let newOption = document.createElement("option");
        newOption.innerText = name;
        newOption.value = code;
        if (select.name === "from" && code === "en-GB") {
            newOption.selected = "selected"; // Default to English
        } else if (select.name === "to" && code === "es-ES") {
            newOption.selected = "selected"; // Default to Spanish
        }
        select.append(newOption);
    }
}

// Translation Functionality
const translateText = async () => {
    let text = inputText.value.trim();
    if (!text) {
        msg.innerText = "Please enter text to translate.";
        return;
    }

    const langPair = `${fromLang.value.split('-')[0]}|${toLang.value.split('-')[0]}`; // Convert to short language code
    const URL = `${BASE_URL}?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    try {
        msg.innerText = "Translating...";
        let response = await fetch(URL);
        let data = await response.json();

        if (data && data.responseData.translatedText) {
            outputText.value = data.responseData.translatedText;
            msg.innerText = `Translated successfully from ${language[fromLang.value]} to ${language[toLang.value]}`;
        } else {
            msg.innerText = "Translation not found. Please try again.";
        }
    } catch (error) {
        console.error("Error during translation:", error);
        msg.innerText = "Error fetching the translation. Please try again.";
    }
};

// Add event listener to the "Translate" button
btn.addEventListener("click", (eve) => {
    eve.preventDefault();
    translateText();
});

// Load initial translation on page load
window.addEvent

    const languageDropdown = document.getElementById('language');
    for (const [code, langName] of Object.entries(language)) {
        const option = document.createElement('option');
        option.value = code;
        option.text = langName;
        if (code === 'en-GB') option.selected = true; // Default to English
        languageDropdown.appendChild(option);
    }

    // Update textarea placeholder based on selected language
    languageDropdown.addEventListener('change', (e) => {
        const selectedLang = language[e.target.value];
        const textarea = document.getElementById('textarea');
        textarea.placeholder = `Write a message in ${selectedLang}...`;
    });

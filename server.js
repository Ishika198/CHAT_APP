const express = require('express');
const app = express();
const http = require('http').createServer(app);
const axios = require('axios'); // Import axios for API requests
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Store user preferences (name and language)
const userPreferences = {};

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Save user preferences (name and language)
    socket.on('setUserPreferences', (prefs) => {
        if (prefs && prefs.name && prefs.lang) {
            userPreferences[socket.id] = {
                name: prefs.name,
                preferredLang: prefs.lang,
            };
            console.log(`${prefs.name} connected with language ${prefs.lang}`);
        } else {
            console.warn(`Invalid user preferences received from ${socket.id}:`, prefs);
            socket.emit('error', { message: 'Invalid preferences received. Please reconnect.' });
        }
    });

    // Handle incoming messages
    socket.on('message', async (msg) => {
        const { message, lang, user } = msg;
        const senderPreferences = userPreferences[socket.id];

        if (!senderPreferences) {
            console.error('Sender preferences not found');
            return;
        }

        // Translate and send the message to all connected clients
        for (const [socketId, receiverPrefs] of Object.entries(userPreferences)) {
            if (!receiverPrefs) {
                console.error(`Receiver preferences missing for socket: ${socketId}`);
                continue;
            }
            try {
                const recipientLang = receiverPrefs.preferredLang;

                // Skip translation if the recipient language is the same as the sender's language
                let translatedMessage = message;

                if (lang !== recipientLang) {
                    const response = await axios.get('https://api.mymemory.translated.net/get', {
                        params: {
                            q: message, // Text to translate
                            langpair: `${lang}|${recipientLang}`, // Translate sender's language to recipient's preferred language
                        },
                    });

                    translatedMessage = response.data.responseData.translatedText;
                }

                // Send the translated message to the recipient
                io.to(socketId).emit('message', {
                    user: senderPreferences.name,
                    message: translatedMessage,
                    original: message, // Include original message
                });
            } catch (error) {
                console.error(`Translation error for ${receiverPrefs.name}:`, error.message);
            }
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        const user = userPreferences[socket.id];
        if (user) {
            console.log(`${user.name} disconnected`);
            delete userPreferences[socket.id];
        }
    });
});

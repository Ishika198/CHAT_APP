app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', async (msg) => {
        const { message, lang, user } = msg;

        try {
            // Translate message
            const response = await axios.get('https://api.mymemory.translated.net/get', {
                params: {
                    q: message, // Text to translate
                    langpair: `en|${lang}` // From English to the selected language
                }
            });

            const translatedText = response.data.responseData.translatedText;

            // Construct the translated message
            const translatedMsg = {
                user,
                message: translatedText, // Translated text
                original: message        // Original text (optional, for reference)
            };

            // Broadcast the translated message to all clients
            socket.broadcast.emit('message', translatedMsg);
        } catch (error) {
            console.error('Translation error:', error.message);

            // Handle the error gracefully (optional feedback to sender)
            socket.emit('error', { message: 'Translation failed' });
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});
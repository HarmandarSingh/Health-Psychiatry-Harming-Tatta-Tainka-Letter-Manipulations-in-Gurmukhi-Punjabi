// Array of Gurmukhi characters and their names
const gurmukhiAlphabet = [
    { character: 'ਕ', name: 'Kakaa' },
    { character: 'ਖ', name: 'Khakhaa' },
    { character: 'ਗ', name: 'Gagaa' },
    { character: 'ਘ', name: 'Ghaghaa' },
    { character: 'ਙ', name: 'Nganngaa' },
    { character: 'ਚ', name: 'Chachaa' },
    { character: 'ਛ', name: 'Chhachhaa' },
    { character: 'ਜ', name: 'Jajaa' },
    { character: 'ਝ', name: 'Jhajaa' },
    { character: 'ਞ', name: 'Nhanjha' },
    // This is the updated line for the Tatta/Tainka letter
    { character: 'ਟ', name: 'Tatta' },
    { character: 'ਠ', name: 'Thathaa' },
    { character: 'ਡ', name: 'Daddaa' },
    { character: 'ਢ', name: 'Dhaddaa' },
    { character: 'ਣ', name: 'Nnaana' },
    { character: 'ਤ', name: 'Tattaa' },
    { character: 'ਥ', name: 'Thathaa' },
    { character: 'ਦ', name: 'Daddaa' },
    { character: 'ਧ', name: 'Dhaddaa' },
    { character: 'ਨ', name: 'Nannaa' },
    { character: 'ਪ', name: 'Pappaa' },
    { character: 'ਫ', name: 'Phapphaa' },
    { character: 'ਬ', name: 'Babbaa' },
    { character: 'ਭ', name: 'Bhabbhaa' },
    { character: 'ਮ', name: 'Mammaa' },
    { character: 'ਯ', name: 'Yayyaa' },
    { character: 'ਰ', name: 'Raraa' },
    { character: 'ਲ', name: 'Lallaa' },
    { character: 'ਵ', name: 'Vavvaa' },
    { character: 'ੜ', name: 'Rharhaa' }
];

// Get elements from the DOM
const characterDisplay = document.getElementById('character-display');
const nameDisplay = document.getElementById('name-display');
const speakButton = document.getElementById('speak-button');
const nextButton = document.getElementById('next-button');
const recordButton = document.getElementById('record-button');
const stopButton = document.getElementById('stop-button');
const playButton = document.getElementById('play-button');
const keyboardContainer = document.querySelector('.keyboard-container');

let currentIndex = 0;
let mediaRecorder;
let audioChunks = [];
let audioBlob;

// Function to update the flashcard with a specific character
function updateCard(characterIndex) {
    const currentCard = gurmukhiAlphabet[characterIndex];
    
    characterDisplay.textContent = currentCard.character;
    nameDisplay.textContent = currentCard.name;

    // Reset recording state
    audioChunks = [];
    audioBlob = null;
    playButton.disabled = true;
}

// Event listener for the "Speak" button (Computer voice)
speakButton.addEventListener('click', () => {
    const textToSpeak = nameDisplay.textContent;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    window.speechSynthesis.speak(utterance);
});

// Event listener for the "Next" button
nextButton.addEventListener('click', () => {
    currentIndex++;
    if (currentIndex >= gurmukhiAlphabet.length) {
        currentIndex = 0;
    }
    updateCard(currentIndex);
});

// Event listener for keyboard clicks
keyboardContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('key')) {
        const clickedCharacter = event.target.textContent;
        // Find the index of the clicked character in the alphabet array
        const newIndex = gurmukhiAlphabet.findIndex(
            card => card.character === clickedCharacter
        );
        if (newIndex !== -1) {
            currentIndex = newIndex;
            updateCard(currentIndex);
        }
    }
});

// Recording logic using MediaRecorder API
recordButton.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording.');
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        audioChunks = [];
        
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            playButton.disabled = false;
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        recordButton.disabled = true;
        stopButton.disabled = false;
        playButton.disabled = true;

    } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access your microphone. Please ensure you have given permission.');
    }
});

stopButton.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        recordButton.disabled = false;
        stopButton.disabled = true;
    }
});

playButton.addEventListener('click', () => {
    if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    }
});

// Initial call to set up the first card when the page loads
updateCard(currentIndex);
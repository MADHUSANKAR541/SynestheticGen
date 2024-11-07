let audioContext;
let analyser;
let dataArray;
let isRunning = false;
let recognition;
let selectedLanguage = 'en-US'; // Default language

function setup() {
    createCanvas(windowWidth * 0.8, windowHeight * 0.5).parent('visualization'); 
    background(0);

    noFill();
    strokeWeight(2);
    stroke(255);

    // Create a SpeechRecognition instance
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = selectedLanguage;

        recognition.onresult = (event) => {
            const transcript = event.results[event.resultIndex][0].transcript;
            displayText(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            displayText('⚠️ Error recognizing speech.');
        };
    } else {
        console.warn('Speech recognition not supported in this browser.');
    }

    document.getElementById('start').addEventListener('click', startAudio);
    document.getElementById('stop').addEventListener('click', stopAudio);

    // Language selection
    document.getElementById('language').addEventListener('change', (event) => {
        selectedLanguage = event.target.value;
        if (recognition) {
            recognition.lang = selectedLanguage;
        }
    });
}

function startAudio() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio input.');
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 2048;
            dataArray = new Uint8Array(analyser.fftSize);
            isRunning = true;

            if (recognition) {
                recognition.start();
                displayText('🎤 Listening...');
            }
        })
        .catch(err => console.error('Error accessing audio input:', err));
}

function draw() {
    if (isRunning && audioContext) {
        background(0, 25);

        analyser.getByteTimeDomainData(dataArray);

        stroke(255, 255, 255, 150);

        beginShape();
        for (let i = 0; i < dataArray.length; i++) {
            let x = map(i, 0, dataArray.length, width * 0.1, width * 0.9); 
            let y = map(dataArray[i], 0, 255, height * 0.4, height * 0.6); 
            vertex(x, y);
        }
        endShape();
    }
}
function displayText(text) {
    let textElement = document.getElementById('recognizedText');
    if (!textElement) {
        textElement = document.createElement('p');
        textElement.id = 'recognizedText';
        textElement.style.color = 'white';
        textElement.style.fontSize = '24px';
        textElement.style.position = 'absolute';
        textElement.style.bottom = '10px';
        textElement.style.left = '10px';
        textElement.style.background = 'rgba(0, 0, 0, 0.5)';
        textElement.style.padding = '10px';
        textElement.style.borderRadius = '5px';
        document.body.appendChild(textElement);
    }
    textElement.textContent = text;
}


function stopAudio() {
    if (audioContext) {
        audioContext.close();
        audioContext = null;
        isRunning = false;

        if (recognition) {
            recognition.stop();
            displayText('🔴 Microphone turned off.');
        }
    }
}



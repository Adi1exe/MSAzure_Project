let selectedVoice = "en-US-JennyNeural";
let isRecording = false;
let selectedFile = null;
let currentInputMethod = 'mic'; 

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.getElementById('light-icon').classList.toggle('active');
    document.getElementById('dark-icon').classList.toggle('active');
    
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('light-icon').classList.remove('active');
        document.getElementById('dark-icon').classList.add('active');
    }
    
    setupDragAndDrop();
});

function setupDragAndDrop() {
    const dropZone = document.getElementById('drop-zone');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        }, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function switchInputMethod(method) {
    currentInputMethod = method;
    
    document.getElementById('mic-toggle').classList.toggle('active', method === 'mic');
    document.getElementById('file-toggle').classList.toggle('active', method === 'file');
    
    document.getElementById('mic-section').style.display = method === 'mic' ? 'block' : 'none';
    document.getElementById('file-section').style.display = method === 'file' ? 'block' : 'none';
    
    const output = document.getElementById('output');
    output.textContent = 'Your transcribed text will appear here...';
    output.classList.add('empty');
    
    document.getElementById('stt-status').innerHTML = '';
    
    if (method === 'mic' && selectedFile) {
        removeFile();
    }
}

function selectVoice(element) {
    document.querySelectorAll('.voice-option').forEach(opt => {
        opt.classList.remove('active');
    });
    
    element.classList.add('active');
    selectedVoice = element.dataset.voice;
}

async function textToSpeech() {
    const text = document.getElementById('tts-text').value.trim();
    const statusDiv = document.getElementById('tts-status');
    
    if (!text) {
        showStatus(statusDiv, 'Please enter some text', 'error');
        return;
    }

    try {
        const response = await fetch('/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                voice: selectedVoice
            })
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            showStatus(statusDiv, 'Speech played successfully!', 'success');
        } else {
            showStatus(statusDiv, 'Failed to play speech', 'error');
        }
    } catch (error) {
        showStatus(statusDiv, 'Error: ' + error.message, 'error');
    }
}

async function startRecording() {
    if (isRecording) return;
    
    isRecording = true;
    const visualizer = document.getElementById('visualizer');
    const output = document.getElementById('output');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    
    visualizer.classList.add('recording');
    output.textContent = 'Listening...';
    output.classList.remove('empty');
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-flex';
    stopBtn.disabled = false;

    try {
        const response = await fetch('/speech-to-text', {
            method: 'POST'
        });

        const data = await response.json();
        
        if (data.status === 'success' && data.transcript) {
            output.textContent = data.transcript;
        } else if (data.status === 'no_match') {
            output.textContent = 'No speech detected. Please try again.';
            output.classList.add('empty');
        } else {
            output.textContent = 'Error recognizing speech. Please try again.';
            output.classList.add('empty');
        }
    } catch (error) {
        output.textContent = 'Error: ' + error.message;
        output.classList.add('empty');
    } finally {
        stopRecording();
    }
}

function stopRecording() {
    isRecording = false;
    const visualizer = document.getElementById('visualizer');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    
    visualizer.classList.remove('recording');
    startBtn.style.display = 'inline-flex';
    stopBtn.style.display = 'none';
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['wav', 'mp3', 'ogg', 'm4a', 'flac', 'wma', 'aac'];
    
    if (!allowedExtensions.includes(fileExtension)) {
        const statusDiv = document.getElementById('stt-status');
        showStatus(statusDiv, 'Invalid file type. Supported: WAV, MP3, OGG, M4A, FLAC, WMA, AAC', 'error');
        return;
    }
    
    const maxSize = 16 * 1024 * 1024; // 16MB in bytes
    if (file.size > maxSize) {
        const statusDiv = document.getElementById('stt-status');
        showStatus(statusDiv, 'File too large. Maximum size is 16MB.', 'error');
        return;
    }
    
    selectedFile = file;
    
    document.getElementById('drop-zone').style.display = 'none';
    document.getElementById('file-info').style.display = 'flex';
    document.getElementById('upload-btn').style.display = 'inline-flex';
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = formatFileSize(file.size);
    
    const output = document.getElementById('output');
    output.textContent = 'Click "Transcribe Audio" to process this file...';
    output.classList.add('empty');
}

function removeFile() {
    selectedFile = null;
    
    document.getElementById('audio-file-input').value = '';
    
    document.getElementById('drop-zone').style.display = 'block';
    document.getElementById('file-info').style.display = 'none';
    document.getElementById('upload-btn').style.display = 'none';
    
    const output = document.getElementById('output');
    output.textContent = 'Your transcribed text will appear here...';
    output.classList.add('empty');
}

async function uploadAudioFile() {
    if (!selectedFile) return;
    
    const output = document.getElementById('output');
    const statusDiv = document.getElementById('stt-status');
    const uploadBtn = document.getElementById('upload-btn');
    
    output.textContent = 'Processing audio file...';
    output.classList.remove('empty');
    uploadBtn.disabled = true;
    
    const formData = new FormData();
    formData.append('audio_file', selectedFile);
    
    try {
        const response = await fetch('/upload-audio', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.status === 'success' && data.transcript) {
            output.textContent = data.transcript;
            showStatus(statusDiv, `Successfully transcribed: ${data.filename}`, 'success');
        } else if (data.status === 'no_match') {
            output.textContent = 'No speech detected in the audio file.';
            output.classList.add('empty');
            showStatus(statusDiv, data.message || 'No speech detected', 'error');
        } else {
            output.textContent = 'Error transcribing audio file.';
            output.classList.add('empty');
            showStatus(statusDiv, data.message || 'Transcription failed', 'error');
        }
    } catch (error) {
        output.textContent = 'Error: ' + error.message;
        output.classList.add('empty');
        showStatus(statusDiv, 'Error: ' + error.message, 'error');
    } finally {
        uploadBtn.disabled = false;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function showStatus(element, message, type) {
    element.innerHTML = `<div class="status-message ${type}">${message}</div>`;
    
    setTimeout(() => {
        element.innerHTML = '';
    }, 3000);
}

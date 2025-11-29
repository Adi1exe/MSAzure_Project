from flask import Flask, render_template, request, jsonify
import azure.cognitiveservices.speech as speechsdk
import os
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION")

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'ogg', 'm4a', 'flac', 'wma', 'aac'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/text-to-speech", methods=["POST"])
def text_to_speech():
    data = request.get_json()
    text = data.get("text")
    voice = data.get("voice", "en-US-JennyNeural")  
    
    speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, region=SPEECH_REGION)
    speech_config.speech_synthesis_voice_name = voice
    
    audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=True)
    synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
    
    result = synthesizer.speak_text_async(text).get()
    
    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        return jsonify({"status": "success", "message": "Speech output played"})
    else:
        return jsonify({"status": "error", "message": "Speech synthesis failed"}), 500

@app.route("/speech-to-text", methods=["POST"])
def speech_to_text():
    """Convert speech from microphone to text using Azure Speech Service"""
    
    speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, region=SPEECH_REGION)
    
    
    audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
    recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
    
    
    result = recognizer.recognize_once_async().get()
    
    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        return jsonify({"status": "success", "transcript": result.text})
    elif result.reason == speechsdk.ResultReason.NoMatch:
        return jsonify({"status": "no_match", "transcript": ""})
    else:
        return jsonify({"status": "error", "transcript": ""}), 500

@app.route("/upload-audio", methods=["POST"])
def upload_audio():
    """Upload audio file and convert to text using Azure Speech Service"""
    
    if 'audio_file' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400
    
    file = request.files['audio_file']
    
    
    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400
    
    
    if not allowed_file(file.filename):
        return jsonify({
            "status": "error", 
            "message": f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS).upper()}"
        }), 400
    
    filepath = None
    try:
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        
        speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, region=SPEECH_REGION)
        
        
        audio_config = speechsdk.audio.AudioConfig(filename=filepath)
        recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        
        
        result = recognizer.recognize_once_async().get()
        
        
        transcript = result.text
        reason = result.reason
        
        
        del recognizer
        del audio_config
        
        
        import time
        time.sleep(0.1)
        
        
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except PermissionError:
            
            time.sleep(0.5)
            if os.path.exists(filepath):
                os.remove(filepath)
        
        
        if reason == speechsdk.ResultReason.RecognizedSpeech:
            return jsonify({
                "status": "success", 
                "transcript": transcript,
                "filename": filename
            })
        elif reason == speechsdk.ResultReason.NoMatch:
            return jsonify({
                "status": "no_match", 
                "transcript": "",
                "message": "No speech detected in audio file"
            })
        else:
            return jsonify({
                "status": "error", 
                "transcript": "",
                "message": "Recognition failed"
            }), 500
            
    except Exception as e:
        
        if filepath and os.path.exists(filepath):
            try:
                import time
                time.sleep(0.5)
                os.remove(filepath)
            except:
                pass  
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    
    if not SPEECH_KEY or not SPEECH_REGION:
        print("ERROR: Please set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in your .env file")
        exit(1)
    
    app.run(debug=True)

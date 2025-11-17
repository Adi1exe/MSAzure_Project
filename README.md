# 🎙️ Text-to-Speech (T2S) & Speech-to-Text (S2T) Web App (Microsoft Azure + Flask)

This project is a simple yet powerful **Flask-based web application** that allows users to:

- Convert **Text → Speech** using **Microsoft Azure Cognitive Services**  
  - Supports **Male** and **Female** voices  
- Convert **Speech → Text**  
  - Either by **recording using a microphone**
  - Or by **uploading an audio file** (WAV/MP3/etc.)

It provides a clean and interactive UI where users can quickly generate audio or get transcription results.

---

## 🚀 Features

### 🔊 Text-to-Speech (T2S)
- Enter any text
- Choose Male/Female voice
- Download or play the generated audio instantly

### 🎤 Speech-to-Text (S2T)
- Record audio directly from the browser
- Upload an audio file
- View transcribed text in real-time

### 🌐 Powered by Microsoft Azure
- Uses Azure **Speech Services** (Speech SDK)
- Fast, reliable, production-grade speech processing

---

## 🛠️ Tech Stack

- **Backend:** Python, Flask  
- **Frontend:** HTML, CSS, JavaScript  
- **Speech Engine:** Microsoft Azure Cognitive Services (Speech Service)  
- **Environment Variables:** `.env`  
- **Other Tools:** Azure Speech SDK for Python  

---

## 📦 Installation & Setup

Follow the steps below to get the project running locally:

---

### **1️⃣ Get Azure Speech Credentials**
1. Go to the **Azure Portal**
2. Search for **Speech Services**
3. Create a resource  
4. Get your:  
   - **API Key**  
   - **Region**  
5. Keep these ready for the next step  

---

### **2️⃣ Add Credentials to `.env`**
Inside your project folder, you will find an existing `.env` file.

Add your Azure details:

```
API_KEY = "YOUR_API_KEY"
REGION = "REGION"
```


Save the file.

---

### **3️⃣ Install Dependencies**
Run:
```
pip install -r requirements.txt
```


---

### **4️⃣ Start the Flask App**

Your application should now be running on:

```
http://127.0.0.1:5000
```

---
## 🧪 How It Works (Internally)

### Text → Speech
1. User enters text  
2. Flask backend sends text to Azure Speech API  
3. Azure returns speech audio  
4. Audio file is played/downloaded  

### Speech → Text
1. User records/upload audio  
2. Flask sends audio stream to Azure Speech-to-Text API  
3. Azure returns the transcription  
4. Text appears on the screen  

---
## ⚠️ Requirements
- Python 3.8+
- Valid Azure Speech API Key
- Internet connection (Azure API calls)

---

## 🔮 Future Enhancements
- Add language selection for T2S & S2T  
- Add voice styles (cheerful, angry, whisper, etc.)  
- Add download logs  
- Improve UI with animations  
- Add dark/light mode toggle  

---

## 🤝 Contributing

Pull requests are welcome!  
For major changes, please open an issue first to discuss.

---

## 📜 License
This project is open-source and available for use and modification.

---

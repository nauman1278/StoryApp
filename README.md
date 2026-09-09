# Story Video Generator

A local-first web application for creating English/Hindi language-learning story videos from scripts, scene images, and AI-generated voiceovers.

## Prerequisites

- **Node.js**: v18 or higher recommended.
- **FFmpeg & FFprobe**: Must be installed and available in your system's PATH.
- **SQLite**: No extra installation needed (uses `better-sqlite3`).

## Environment Variables

Copy `.env.example` to `.env` in the `server` directory and fill in the values:

```
PORT=5000
ELEVENLABS_API_KEY=your_api_key_here
```

## Installation

Run the following at the root of the project to install all dependencies for both the server and client:

```bash
npm install
```

## Running the Application

To start both the frontend and backend concurrently, run:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## Workflow

1. **Create Project**: Click "New Project", enter a title, and select your visual style (Cinematic or Vintage).
2. **Story Editor**: Paste your full story script. Click "Split into Scenes" to automatically divide the text.
3. **Generate Prompts**: In the Story Editor, click "Generate All Image Prompts". The system will inject character locks and style locks.
4. **Generate Images**: Copy the prompts into your external AI image generator (e.g., Google Flow).
5. **Upload Images**: (Endpoint built, UI coming soon) Upload images back to their respective scenes.
6. **Voice Studio**: Choose between Mock, Edge TTS, or ElevenLabs, preview voices, and generate per-scene narration.
7. **Render Video**: Click render. The system will create exact-duration clips with perfectly synchronized audio (and automatic text overlay in Vintage mode), then concatenate them into a final MP4.

## Output Directory

All generated artifacts, audio files, scene clips, and final videos are safely organized by project name inside the `output/` directory at the root of this repository.

// Add type definition for import.meta.env
interface ImportMetaEnv {
  VITE_API_BASE_URL: string;
  VITE_WS_BASE_URL?: string;
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// API base URLs
// For existing APIs (Twilio, Deepgram, etc.)
export const REMOTE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-faby.onrender.com';
export const REMOTE_WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 
  (REMOTE_API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://'));

// For notes server (deployed on Render)
export const NOTES_API_BASE_URL = 'https://shared-notes-server.onrender.com';
export const NOTES_WS_BASE_URL = NOTES_API_BASE_URL.replace('https://', 'wss://');

// For local development (comment out when using the deployed server)
// export const NOTES_API_BASE_URL = 'http://localhost:5000';
// export const NOTES_WS_BASE_URL = 'ws://localhost:5000';

// API endpoints
export const API_ENDPOINTS = {
  // Twilio endpoints (use remote server)
  TWILIO_TOKEN: `${REMOTE_API_BASE_URL}/api/twilio/token`,
  
  // Deepgram endpoints (use remote server)
  DEEPGRAM_TOKEN: `${REMOTE_API_BASE_URL}/api/deepgram/token`,
  DEEPGRAM_STREAM: `${REMOTE_API_BASE_URL}/api/deepgram/stream`,
  DEEPGRAM_WS: (roomId: string, identity: string, sessionId?: string) => 
    `${REMOTE_WS_BASE_URL}/deepgram?room=${roomId}&identity=${identity}${sessionId ? `&session=${sessionId}` : ''}`,
  
  // Transcript endpoints (use remote server)
  TRANSCRIPTS: (roomId: string) => `${REMOTE_API_BASE_URL}/api/transcripts/${roomId}`,
  TRANSCRIPT_WS: (roomId: string) => `${REMOTE_WS_BASE_URL}/transcripts?room=${roomId}`,
  
  // Notes endpoints (use deployed notes server)
  NOTES: (roomId: string) => `${NOTES_API_BASE_URL}/api/notes/${roomId}`,
  NOTES_WS: (roomId: string) => `${NOTES_WS_BASE_URL}/notes?room=${roomId}`,
  
  // AssemblyAI endpoints (use remote server)
  ASSEMBLY_TOKEN: `${REMOTE_API_BASE_URL}/api/assembly/token`,
  ASSEMBLY_TRANSCRIBE: `${REMOTE_API_BASE_URL}/api/assembly/transcribe`,
  ASSEMBLY_TRANSCRIPT: (transcriptId: string) => `${REMOTE_API_BASE_URL}/api/assembly/transcript/${transcriptId}`
}; 
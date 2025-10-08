import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ✅ CODE-002 : La validation Supabase se fait automatiquement dans client.ts
// Dès que le client est importé, la configuration est validée

createRoot(document.getElementById("root")!).render(<App />);

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { validateConfig, isUsingEnvVars } from './lib/config.ts'

// Validation de la configuration au démarrage
try {
  validateConfig();
  isUsingEnvVars();
} catch (error) {
  console.error('❌ Erreur de configuration:', error);
  // L'application peut continuer avec les valeurs par défaut
}

createRoot(document.getElementById("root")!).render(<App />);

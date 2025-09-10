import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './frontend/NoteTaskApp'; // Assuming NoteTaskApp.tsx exports App

// Get the root element from the HTML
const rootElement = document.getElementById('root');

if (rootElement) {
  // Create a root
  const root = ReactDOM.createRoot(rootElement);

  // Initial render
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element. Ensure your HTML has <div id="root"></div>.');
}
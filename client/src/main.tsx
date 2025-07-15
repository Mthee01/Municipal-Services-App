import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found");
  }
  
  console.log("Starting React app...");
  createRoot(root).render(<App />);
  console.log("React app rendered successfully");
} catch (error) {
  console.error("Error starting React app:", error);
  
  // Fallback: show error message
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; text-align: center; color: red;">
        <h2>Application Error</h2>
        <p>Failed to start the application. Please check the console for details.</p>
        <p>Error: ${error}</p>
      </div>
    `;
  }
}

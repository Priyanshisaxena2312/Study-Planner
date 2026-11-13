import React from "react";
import { createRoot } from "react-dom/client";
import { StudyProvider } from "./context/StudyContext";
import App from "./App";
import "./styles.css";
import "./pages.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StudyProvider>
      <App />
    </StudyProvider>
  </React.StrictMode>
);

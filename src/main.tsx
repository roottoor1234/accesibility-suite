import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { useFocusNotObscured } from "./hooks/useFocusNotObscured";

function AppWithA11y() {
  useFocusNotObscured();
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AccessibilityProvider>
        <AppWithA11y />
      </AccessibilityProvider>
    </BrowserRouter>
  </StrictMode>
);

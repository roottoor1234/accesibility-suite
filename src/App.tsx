import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { LandingPage } from "./pages/LandingPage";
import { DemoPage } from "./pages/DemoPage";
import { AdminPage } from "./pages/AdminPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </>
  );
}

export default App;

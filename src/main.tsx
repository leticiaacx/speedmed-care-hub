import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { MedicationProvider } from "@/contexts/MedicationContext";

createRoot(document.getElementById("root")!).render(
    <MedicationProvider>
        <App />
    </MedicationProvider>
);
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.tsx";
import { AuthProvider } from "./app/context/AuthContext.tsx";
import { TicketProvider } from "./app/context/TicketContext.tsx";
import "./styles/index.css";

// Hemos eliminado la función enableMocking() 
// porque ahora nos conectamos al backend real en Java.

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <TicketProvider>
        <App />
      </TicketProvider>
    </AuthProvider>
  </BrowserRouter>
);
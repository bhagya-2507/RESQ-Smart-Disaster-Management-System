import { useState } from "react";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import Loading from "./components/common/Loading";

function App() {
  const [starting, setStarting] = useState(true);

  return (
    <BrowserRouter>
      <AuthProvider>
        {starting ? (
          <Loading onComplete={() => setStarting(false)} />
        ) : (
          <AppRoutes />
        )}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
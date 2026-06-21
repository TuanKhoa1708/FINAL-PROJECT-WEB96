import { useState } from "react";
import AppRoutes from "./routes/AppRoutes";

function App() {
   const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

  return <AppRoutes user={user} setUser={setUser} />;
}

export default App;
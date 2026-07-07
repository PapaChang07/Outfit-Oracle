import { useEffect, useState } from "react";
import GenerateOutfitPage from "./pages/GenerateOutfitPage";
import api from "./services/api";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    api
      .get("/api/health")
      .then((response) => {
        setMessage(response.data.status);
      })
      .catch((error) => {
        console.error(error);
        setMessage("Backend not connected");
      });
  }, []);


  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Outfit Oracle</h1>
      <p style={{ fontSize: "0.9rem" }}>Backend status: {message}</p>
      <GenerateOutfitPage />
    </div>
  );
}

export default App;
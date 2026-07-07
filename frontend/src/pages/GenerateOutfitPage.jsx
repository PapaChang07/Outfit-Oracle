import { useState } from "react";
import api from "../services/api";

function GenerateOutfitPage() {
  const [form, setForm] = useState({
    occasion: "",
    temperature: "",
    weather: "",
    vibe: "",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await api.post("/api/outfits/generate", form);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong generating the outfit.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input
        placeholder="Occasion"
        value={form.occasion}
        onChange={(e) => setForm({ ...form, occasion: e.target.value })}
      />
      <input
        placeholder="Temperature"
        value={form.temperature}
        onChange={(e) => setForm({ ...form, temperature: e.target.value })}
      />
      <input
        placeholder="Weather"
        value={form.weather}
        onChange={(e) => setForm({ ...form, weather: e.target.value })}
      />
      <input
        placeholder="Vibe"
        value={form.vibe}
        onChange={(e) => setForm({ ...form, vibe: e.target.value })}
      />

      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate"}
      </button>

      {error && <p>{error}</p>}

      {result && (
        <div>
          <h2>Recommended Outfit</h2>
          <p>Top: {result.outfit?.top}</p>
          <p>Bottom: {result.outfit?.bottom}</p>
          <p>Shoes: {result.outfit?.shoes}</p>
          <p>Outerwear: {result.outfit?.outerwear}</p>
          <p>Explanation: {result.explanation}</p>
        </div>
      )}
    </div>
  );
}

export default GenerateOutfitPage;
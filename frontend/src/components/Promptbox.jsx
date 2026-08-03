import { useState } from "react";

const PromptBox = ({ onGenerate, loading }) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    onGenerate(prompt);
  };

  return (
    <div className="prompt-box">
      <input
        type="text"
        placeholder="Enter your prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>
    </div>
  );
};

export default PromptBox;
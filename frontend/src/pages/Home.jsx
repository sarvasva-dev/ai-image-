import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateImage, getHistory } from "../api/api";

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [steps, setSteps] = useState(20);
  const [cfg, setCfg] = useState(7.5);
  const [dimensions, setDimensions] = useState({ width: 512, height: 512 }); // Square default
  
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch generation history on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyData = await getHistory();
        // Sort history by ID descending (newest first)
        const sorted = historyData.sort((a, b) => b.id - a.id);
        setImages(sorted);
        if (sorted.length > 0) {
          setSelectedImage(sorted[0]);
        }
      } catch (err) {
        console.error("[AI Studio] Failed to fetch history:", err);
      }
    };
    fetchHistory();
  }, []);

  // Helper to safely format image URLs
  const getFullUrl = (img) => {
    if (!img) return "";
    const path = img.image_url || img.path || "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    let baseUrl = "http://127.0.0.1:8000";
    if (envUrl && envUrl.trim() !== "") {
      baseUrl = envUrl.trim().replace(/\/$/, "");
      if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
        baseUrl = `https://${baseUrl}`;
      }
    }
    const leadingSlash = path.startsWith("/") ? "" : "/";
    return `${baseUrl}${leadingSlash}${path}`;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      const data = await generateImage({
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim(),
        steps: parseInt(steps),
        cfg: parseFloat(cfg),
        width: dimensions.width,
        height: dimensions.height,
      });

      console.log("[AI Studio] Image Generated Successfully:", data);

      setImages((prev) => [data, ...prev]);
      setSelectedImage(data);
    } catch (err) {
      console.error("[AI Studio] Generation failed:", err);
      const serverMsg = err.response?.data?.detail || err.message || "Server or network error";
      alert(`Image generation failed: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const dimensionPresets = [
    { label: "Square (512x512)", width: 512, height: 512 },
    { label: "Portrait (512x768)", width: 512, height: 768 },
    { label: "Landscape (768x512)", width: 768, height: 512 },
  ];

  return (
    <div className="home-container">
      {/* Top Title Header */}
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">✨</span>
          <div>
            <h1 className="title">AETHERIA</h1>
            <p className="subtitle">AI Creative Image Studio</p>
          </div>
        </div>
      </header>

      {/* Main Grid Dashboard */}
      <div className="dashboard-grid">
        {/* Left Side: Creative Panel Controls */}
        <aside className="glass-card">
          <h2 className="sidebar-title">
            <span>⚙️</span> Control Studio
          </h2>

          {/* Prompt Area */}
          <div className="setting-group">
            <label className="setting-label">Creative Prompt</label>
            <textarea
              className="textarea-input"
              placeholder="Describe what you want to visualize in vivid detail..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Negative Prompt */}
          <div className="setting-group">
            <label className="setting-label">Negative Prompt (Exclude)</label>
            <input
              type="text"
              className="text-input"
              placeholder="e.g. blurry, low quality, distorted..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Preset Aspect Ratios */}
          <div className="setting-group">
            <label className="setting-label">Aspect Ratio Preset</label>
            <div className="select-grid">
              {dimensionPresets.map((preset) => {
                const isActive =
                  dimensions.width === preset.width &&
                  dimensions.height === preset.height;
                return (
                  <button
                    key={preset.label}
                    className={`select-btn ${isActive ? "active" : ""}`}
                    onClick={() =>
                      setDimensions({ width: preset.width, height: preset.height })
                    }
                    disabled={loading}
                  >
                    {preset.label.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step Count Slider */}
          <div className="setting-group">
            <label className="setting-label">Generation Steps</label>
            <div className="slider-container">
              <input
                type="range"
                className="slider-input"
                min="10"
                max="50"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                disabled={loading}
              />
              <span className="slider-val">{steps}</span>
            </div>
          </div>

          {/* CFG Scale Slider */}
          <div className="setting-group">
            <label className="setting-label">Guidance Scale (CFG)</label>
            <div className="slider-container">
              <input
                type="range"
                className="slider-input"
                min="1"
                max="20"
                step="0.5"
                value={cfg}
                onChange={(e) => setCfg(e.target.value)}
                disabled={loading}
              />
              <span className="slider-val">{cfg}</span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
          >
            <span>{loading ? "⚡ Generating..." : "🎨 Synthesize Masterpiece"}</span>
          </button>
        </aside>

        {/* Right Side: Showcase View & Gallery */}
        <main className="workspace-pane">
          {/* Main Showcase Panel */}
          <div className="glass-card preview-wrapper has-image">
            <AnimatePresence mode="wait">
              {loading ? (
                /* Loading State Overlay */
                <motion.div
                  key="loading"
                  className="loading-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="spinner-outer">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                  </div>
                  <h3 className="loading-text">Synthesizing Creative Neurons</h3>
                  <p className="loading-subtext">Rendering your masterpiece...</p>
                </motion.div>
              ) : selectedImage ? (
                /* Show Main Showcase Image */
                <motion.div
                  key={selectedImage.id}
                  className="image-display"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={getFullUrl(selectedImage)} alt="Masterpiece" />

                  {selectedImage.prompt && (
                    <div className="prompt-overlay">
                      Prompt: <span>{selectedImage.prompt}</span>
                    </div>
                  )}

                  <div className="image-actions">
                    <a
                      href={getFullUrl(selectedImage)}
                      className="btn-secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                      download={`masterpiece-${selectedImage.id}.png`}
                    >
                      ⬇ Download Artwork
                    </a>
                  </div>
                </motion.div>
              ) : (
                /* Empty Studio State */
                <div className="empty-state">
                  <div className="empty-icon">🎨</div>
                  <h3>Aetheria Canvas Empty</h3>
                  <p className="empty-text">
                    Enter a creative description on the control panel to begin your journey.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* History Gallery */}
          {images.length > 0 && (
            <section className="glass-card">
              <h3 className="history-section-title">
                <span>🖼️</span> Generated Masterpieces
              </h3>
              <div className="history-grid">
                {images.map((img) => {
                  const isActive = selectedImage?.id === img.id;
                  return (
                    <motion.div
                      key={img.id}
                      className={`history-item ${isActive ? "active" : ""}`}
                      onClick={() => setSelectedImage(img)}
                      whileHover={{ scale: 1.05 }}
                    >
                      <img src={getFullUrl(img)} alt={img.prompt} />
                      <div className="history-tooltip">{img.prompt}</div>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
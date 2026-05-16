import { useState, useRef, useCallback, useEffect } from "react";
import type { CreatePostPayload } from "../../../services/wallApi";

interface CreatePostProps {
  onPost: (entry: CreatePostPayload) => void | Promise<void>;
  disabled?: boolean;
}

type TabType = "post" | "poll";

const categories = [
  "General",
  "Leadership",
  "Reflection",
  "Challenge",
  "Aspiration",
  "Gratitude",
  "Milestone",
];

export default function CreatePost({ onPost, disabled = false }: CreatePostProps) {
  const [activeTab, setActiveTab] = useState<TabType>("post");
  const [text, setText] = useState("");
  const [rows, setRows] = useState(4);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSketch, setShowSketch] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#D4AF37");
  const [brushSize, setBrushSize] = useState(3);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [category, setCategory] = useState("Reflection");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [customWord, setCustomWord] = useState("");
  const categoryRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const colors = [
    { value: "#D4AF37", label: "Gold" },
    { value: "#1F2937", label: "Dark" },
    { value: "#3B82F6", label: "Blue" },
    { value: "#EF4444", label: "Red" },
    { value: "#10B981", label: "Green" },
    { value: "#8B5CF6", label: "Purple" },
  ];

  useEffect(() => {
    if (showSketch && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FAFAF9";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [showSketch]);

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.stroke();
  }, [isDrawing, brushColor, brushSize]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.beginPath();
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#FAFAF9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const lineCount = e.target.value.split("\n").length;
    setRows(Math.max(4, Math.min(12, lineCount)));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setShowSketch(false);
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canvasToBlob = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resolve(null);
        return;
      }
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });

  const handlePost = async () => {
    if (disabled) return;
    if (activeTab === "post" && !text.trim() && !showSketch && !imageFile) return;
    if (activeTab === "poll" && (!pollQuestion.trim() || pollOptions.some((o) => !o.trim()))) return;

    const pollData =
      activeTab === "poll"
        ? pollOptions.map((opt) => ({
            label: opt,
            shortLabel: opt,
            votes: 0,
          }))
        : undefined;

    let sketchBlob: Blob | null = null;
    if (showSketch) {
      sketchBlob = await canvasToBlob();
    }

    await onPost({
      text: activeTab === "post" ? text.trim() : pollQuestion.trim(),
      word: customWord.trim() || category,
      tag: category,
      tab: activeTab,
      hasSketch: showSketch,
      pollOptions: pollData,
      imageFile,
      sketchBlob,
    });

    setText("");
    setRows(4);
    setPollQuestion("");
    setPollOptions(["", ""]);
    setShowSketch(false);
    setCustomWord("");
    setCategory("Reflection");
    clearCanvas();
    clearImage();
  };

  const isSendDisabled =
    disabled ||
    (activeTab === "post"
      ? !text.trim() && !showSketch && !imageFile
      : !pollQuestion.trim() || pollOptions.some((o) => !o.trim()));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm focus-within:shadow-lg focus-within:border-amber-300/60 transition-all duration-300">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-5 pt-3">
        <button
          onClick={() => {
            setActiveTab("post");
            setShowSketch(false);
          }}
          className={`px-4 py-2.5 text-sm font-sans font-medium tracking-wide transition-all cursor-pointer border-b-2 rounded-t-lg ${
            activeTab === "post"
              ? "text-amber-700 border-amber-500 bg-amber-50/50"
              : "text-gray-400 border-transparent hover:text-gray-600"
          }`}
        >
          <span className="flex items-center gap-2">
            <i className="ri-edit-line text-base"></i>
            Post
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("poll");
            setShowSketch(false);
          }}
          className={`px-4 py-2.5 text-sm font-sans font-medium tracking-wide transition-all cursor-pointer border-b-2 rounded-t-lg ${
            activeTab === "poll"
              ? "text-amber-700 border-amber-500 bg-amber-50/50"
              : "text-gray-400 border-transparent hover:text-gray-600"
          }`}
        >
          <span className="flex items-center gap-2">
            <i className="ri-survey-line text-base"></i>
            Poll
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {activeTab === "post" && (
          <>
            {/* Large rounded textarea with icons */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                placeholder="What’s on your mind as you think about Refex 2030? A thought. A reflection. A bold aspiration. Anything.
                "
                rows={rows}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 pr-20 text-base font-sans text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
              />

              {/* Right-side corner icons inside input area */}
              <div className="absolute bottom-3.5 right-3.5 flex items-center gap-2">
                <button
                  onClick={() => setShowSketch((s) => !s)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                    showSketch
                      ? "bg-amber-100 text-amber-700 border border-amber-300"
                      : "bg-gray-100 text-gray-400 hover:text-amber-700 hover:bg-amber-50 border border-transparent"
                  }`}
                  title="Sketch"
                >
                  <i className="ri-brush-line text-sm"></i>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer border ${
                    imageFile
                      ? "bg-amber-100 text-amber-700 border-amber-300"
                      : "bg-gray-100 text-gray-400 hover:text-amber-700 hover:bg-amber-50 border-transparent"
                  }`}
                  title="Upload image"
                >
                  <i className="ri-image-add-line text-sm"></i>
                </button>
              </div>
            </div>

            {imagePreview && (
              <div className="mt-4 relative animate-fade-in">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="w-full max-h-64 object-cover rounded-xl border border-gray-200"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 text-gray-500 hover:text-red-500 shadow cursor-pointer"
                  title="Remove image"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
            )}

            {/* Sketch canvas */}
            {showSketch && (
              <div className="mt-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setBrushColor(c.value)}
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${
                        brushColor === c.value ? "border-gray-400 scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                  <span className="text-xs font-sans text-gray-400 ml-1">Size</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-20 accent-amber-600"
                  />
                  <button
                    onClick={clearCanvas}
                    className="ml-auto px-3 py-1 bg-gray-100 text-gray-500 text-xs font-sans rounded-md hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  className="w-full h-56 bg-stone-50 border border-gray-200 rounded-xl cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
            )}
          </>
        )}

        {activeTab === "poll" && (
          <div className="space-y-3 animate-fade-in">
            {/* Question input */}
            <input
              type="text"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base font-sans text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
            />

            {/* Poll options */}
            <div className="space-y-2.5">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...pollOptions];
                      newOpts[i] = e.target.value;
                      setPollOptions(newOpts);
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-sans text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
                  />
                  {pollOptions.length > 2 && (
                    <button
                      onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Remove option"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add option */}
            <button
              onClick={() => setPollOptions([...pollOptions, ""])}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition-colors cursor-pointer px-1 py-1"
            >
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                <i className="ri-add-line text-xs text-gray-400"></i>
              </div>
              Add option
            </button>
          </div>
        )}

        {/* Bottom bar — One word + Tag + Send */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-3 border-t border-gray-100 gap-3">
          <div className="flex items-center gap-6 md:gap-10">
            {/* One word input */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-sans text-gray-500 whitespace-nowrap">One word</span>
            <input
                type="text"
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                placeholder="your word"
                className="bg-transparent border-b-2 border-amber-300 focus:border-amber-500 outline-none text-sm font-sans text-gray-800 placeholder-gray-400 px-1 py-1 w-28 sm:w-36 md:w-44 transition-colors"
              />
            </div>

            {/* Tag dropdown */}
            <div className="relative flex items-center gap-2" ref={categoryRef}>
              <span className="text-sm font-sans text-gray-500 whitespace-nowrap">Tag:</span>
              <button
                onClick={() => setShowCategoryDropdown((s) => !s)}
                className="flex items-center gap-1.5 text-sm font-sans text-gray-700 hover:text-amber-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>{category}</span>
                <i className={`ri-arrow-down-s-line text-xs text-gray-400 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`}></i>
              </button>

              {showCategoryDropdown && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1.5 animate-scale-in">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-sans transition-colors cursor-pointer ${
                        category === cat
                          ? "text-amber-700 bg-amber-50"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Send button */}
          <button
            onClick={handlePost}
            disabled={isSendDisabled}
            className={`px-7 py-2.5 rounded-xl font-sans font-semibold text-sm tracking-wide transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 ${
              isSendDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            <span className="flex items-center gap-2">
              {disabled ? "Saving..." : "Send"}
              <i className={disabled ? "ri-loader-4-line animate-spin text-sm" : "ri-send-plane-fill text-sm"}></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";

interface TypeWriterProps {
  lines: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
  className?: string;
}

export default function TypeWriter({
  lines,
  typingSpeed = 60,
  deletingSpeed = 30,
  pauseTime = 2000,
  className = "",
}: TypeWriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Typing / deleting logic
  useEffect(() => {
    if (lines.length === 0) return;

    const currentLine = lines[lineIndex];

    if (isDeleting) {
      if (displayText === "") {
        setIsDeleting(false);
        setIsTyping(true);
        setLineIndex((prev) => (prev + 1) % lines.length);
      } else {
        const timeout = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, deletingSpeed);
        return () => clearTimeout(timeout);
      }
    } else if (isTyping) {
      if (displayText === currentLine) {
        setIsTyping(false);
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setDisplayText((prev) => currentLine.slice(0, prev.length + 1));
        }, typingSpeed + Math.random() * 30); // slight randomness for realism
        return () => clearTimeout(timeout);
      }
    }
  }, [displayText, isDeleting, isTyping, lineIndex, lines, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className={className}>
      {displayText}
      {/* <span
        className={`inline-block w-[3px] h-[1em] ml-0.5 align-middle transition-opacity duration-75 ${
          showCursor ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "currentColor" }}
      /> */}
    </span>
  );
}
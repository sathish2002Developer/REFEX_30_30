import { useState } from "react";
import type { WallLiker } from "../../../mocks/wallData";

interface ParticipantsBarProps {
  participants: WallLiker[];
  total: number;
  modalTitle: string;
  trailingIcon?: string;
  className?: string;
  /** LinkedIn-style pill before avatars (emoji + count) */
  reactionPill?: { emoji: string; count: number };
}

function formatNames(participants: WallLiker[], total: number): string {
  if (total === 0) return "";
  if (total === 1) return participants[0]?.name || "1 person";
  if (total === 2) return `${participants[0]?.name} and ${participants[1]?.name}`;
  return `${participants[0]?.name} and ${total - 1} others`;
}

export default function ParticipantsBar({
  participants,
  total,
  modalTitle,
  trailingIcon,
  className = "",
  reactionPill,
}: ParticipantsBarProps) {
  const [showModal, setShowModal] = useState(false);

  if (total === 0 || participants.length === 0) return null;

  const displayed = participants.slice(0, 5);
  const overflow = total - displayed.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2.5 min-w-0 text-left group cursor-pointer ${className}`}
      >
        {reactionPill && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs shrink-0 shadow-sm">
            <span className="leading-none">{reactionPill.emoji}</span>
            <span className="font-sans text-gray-600 font-medium tabular-nums">
              {reactionPill.count}
            </span>
          </span>
        )}

        <div className="flex items-center -space-x-2 shrink-0">
          {displayed.map((person, i) => (
            <div
              key={person.id}
              className="w-7 h-7 rounded-full bg-amber-50 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-amber-800 shadow-sm"
              style={{ zIndex: displayed.length - i }}
              title={person.name}
            >
              {person.initials}
            </div>
          ))}
          {overflow > 0 && (
            <div
              className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-semibold text-gray-600 shadow-sm"
              style={{ zIndex: 0 }}
            >
              +{overflow}
            </div>
          )}
        </div>

        <span className="text-xs font-sans text-amber-900/85 group-hover:text-amber-700 transition-colors truncate leading-snug">
          {formatNames(participants, total)}
        </span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
            onClick={() => setShowModal(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[70vh] flex flex-col overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-sans font-semibold text-gray-900">{modalTitle}</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <ul className="overflow-y-auto p-2">
              {participants.map((person) => (
                <li
                  key={person.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800 text-xs font-semibold shrink-0">
                    {person.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-sans font-medium text-gray-900 truncate">
                      {person.name}
                    </p>
                    <p className="text-xs font-sans text-gray-500 truncate">{person.role}</p>
                  </div>
                  {trailingIcon && (
                    <span className="text-lg shrink-0" aria-hidden>
                      {trailingIcon}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

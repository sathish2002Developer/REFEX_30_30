import type { WallLiker } from "../../../mocks/wallData";
import ParticipantsBar from "./ParticipantsBar";

interface LikersBarProps {
  likers: WallLiker[];
  totalLikes: number;
}

export default function LikersBar({ likers, totalLikes }: LikersBarProps) {
  return (
    <ParticipantsBar
      participants={likers}
      total={totalLikes}
      modalTitle={`Reactions · ${totalLikes}`}
      trailingIcon="❤️"
      reactionPill={{ emoji: "❤️", count: totalLikes }}
      className="w-full"
    />
  );
}

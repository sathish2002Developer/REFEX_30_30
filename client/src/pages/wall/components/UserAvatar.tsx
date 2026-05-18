import { useEffect, useState } from "react";
import { getWallAvatarUrl, type WallAvatarSource } from "../../../utils/wallAvatar";

interface UserAvatarProps {
  avatarUrl?: WallAvatarSource;
  initials: string;
  className?: string;
}

export default function UserAvatar({ avatarUrl, initials, className = "w-7 h-7" }: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = getWallAvatarUrl(avatarUrl);
  const base = `${className} rounded-full shrink-0 overflow-hidden`;

  useEffect(() => {
    setImgFailed(false);
  }, [src]);

  if (src && !imgFailed) {
    return (
      <img
        key={src}
        src={src}
        alt=""
        onError={() => setImgFailed(true)}
        className={`${base} object-cover bg-amber-50 border border-amber-200`}
      />
    );
  }

  return (
    <div
      className={`${base} bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-semibold`}
    >
      <span className="text-xs leading-none">{initials}</span>
    </div>
  );
}

"use client";
import { usePlayingState } from "@/hooks/useIsPlaying";
import Image from "next/image";

export default function Switch() {
  const isPlaying = usePlayingState((state) => state.isPlaying);
  const toggleIsPlaying = usePlayingState((state) => state.toggle);

  const handleTheatreMode = () => {
    toggleIsPlaying();
  };

  return (
    <div
      className={`w-14 h-4 smallScreenSwitch brightness-55 border border-white rounded-xl justify-center
            ${isPlaying ? "bg-golden" : "bg-dark"}
        `}
    >
      <div
        className={`flex relative bottom-1 z-10 w-6 h-6 border rounded-full hover:cursor-pointer transition-transform duration-300 place-content-center
                    ${
                      isPlaying
                        ? "translate-x-[40px] bg-dark-golden border border-green-100"
                        : "-translate-x-1 bg-white border border-green-100"
                    }
                `}
        onClick={handleTheatreMode}
      >
        <Image
          src="/blacksun.svg"
          alt="switch"
          width={20}
          height={20}
          className=""
        />
      </div>
    </div>
  );
}

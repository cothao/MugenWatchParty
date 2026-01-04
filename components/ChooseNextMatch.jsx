import { useState } from "react";

export default function ChooseNextMatch({ characters }) {
  const [matchType, setMatchType] = useState("1v1");
const createEmptySlots = (count) => Array(count).fill(null);


const [activeSlot, setActiveSlot] = useState(null);
// shape: { side: "left" | "right", index: number }

const matchTypes = [
  { id: "1v1", label: "1v1", leftCount: 1, rightCount: 1 },
  { id: "2v2", label: "2v2", leftCount: 2, rightCount: 2 },
  { id: "2v1", label: "2v1", leftCount: 2, rightCount: 1 },
];

const currentMatchConfig = matchTypes.find((m) => m.id === matchType);
const [selectedLeft, setSelectedLeft] = useState(
  createEmptySlots(currentMatchConfig.leftCount)
);
const [selectedRight, setSelectedRight] = useState(
  createEmptySlots(currentMatchConfig.rightCount)
);

const handleMatchTypeChange = (newType) => {
  const config = matchTypes.find((m) => m.id === newType);
  setMatchType(newType);
  setSelectedLeft(createEmptySlots(config.leftCount));
  setSelectedRight(createEmptySlots(config.rightCount));
  setActiveSlot(null);
};


const isReadyToStart =
  selectedLeft.every(Boolean) &&
  selectedRight.every(Boolean);

const assignToActiveSlot = (character) => {
  if (!activeSlot) return;

  const { side, index } = activeSlot;

  // Prevent duplicates
  const alreadyUsed =
    selectedLeft.some((c) => c?.id === character.id) ||
    selectedRight.some((c) => c?.id === character.id);

  if (alreadyUsed) return;

  if (side === "left") {
    setSelectedLeft((prev) => {
      const next = [...prev];
      next[index] = character;
      return next;
    });
  } else {
    setSelectedRight((prev) => {
      const next = [...prev];
      next[index] = character;
      return next;
    });
  }

  setActiveSlot(null); // auto-clear after assignment
};


const renderTeamSlots = (team, maxSlots, isLeft = true) => {
  return Array.from({ length: maxSlots }).map((_, i) => {
    const character = team[i];
    const isActive =
      activeSlot?.side === (isLeft ? "left" : "right") &&
      activeSlot?.index === i;

    return (
      <button
        key={i}
        onClick={() =>
          setActiveSlot({
            side: isLeft ? "left" : "right",
            index: i,
          })
        }
        className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${
          isLeft
            ? "border-primary"
            : "border-accent"
        } ${
          isActive
            ? "ring-4 ring-yellow-400"
            : "opacity-90"
        }
        `}
      >
        {character ? (
          <div className="text-center">
            <img
              src={character.portrait}
              alt={character.name}
              className="w-20 h-20 object-cover rounded mb-2"
            />
            <div className="text-sm font-bold">{character.name}</div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            Click to select
          </div>
        )}
      </button>
    );
  });
};


  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {matchTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleMatchTypeChange(type.id)}
            className={`px-6 py-3 rounded-lg font-bold ${
              matchType === type.id
                ? "bg-primary text-white"
                : "bg-secondary"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8"
        style={{ gridTemplateColumns: `repeat(2, 1fr) auto repeat(2, 1fr)` }}
      >
        {renderTeamSlots(selectedLeft, currentMatchConfig.leftCount, true)}

        <div className="flex flex-col items-center justify-center">
          <div className="text-3xl font-black">VS</div>
          <button
            disabled={!isReadyToStart}
            className="mt-4 px-6 py-3 bg-success text-white rounded disabled:opacity-50"
          >
            Start Match
          </button>
        </div>

        {renderTeamSlots(selectedRight, currentMatchConfig.rightCount, false)}
      </div>

      <div className="grid grid-cols-16 md:grid-cols-16 lg:grid-cols-16 gap-3">
        {characters.map((char) => {

          return (
            <div key={char.id} className="space-y-2">
<button
  onClick={() => assignToActiveSlot(char)}
  disabled={!activeSlot}
  className={`w-full aspect-square border-2 rounded transition-all ${
    activeSlot
      ? "hover:scale-105 border-border"
      : "opacity-40 cursor-not-allowed"
  }`}
>
  <img
    src={char.portrait}
    alt={char.name}
    className="w-full h-full object-cover rounded"
  />
</button>


              <p className="text-xs text-center font-semibold">{char.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

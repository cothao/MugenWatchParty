"use client";

import { useState } from "react";

export default function ChooseNextMatch({ characters }) {
  const [matchType, setMatchType] = useState("1v1");

  const createEmptySlots = (count) => Array(count).fill(null);

  const [activeSlot, setActiveSlot] = useState(null);

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
    selectedLeft.every(Boolean) && selectedRight.every(Boolean);

  const assignToActiveSlot = (character) => {
    if (!activeSlot) return;

    const { side, index } = activeSlot;

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

    setActiveSlot(null);
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
            setActiveSlot({ side: isLeft ? "left" : "right", index: i })
          }
          className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${
            isLeft ? "border-primary" : "border-accent"
          } ${isActive ? "ring-4 ring-yellow-400" : "opacity-90"}`}
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
            <div className="text-muted-foreground text-sm">Click to select</div>
          )}
        </button>
      );
    });
  };

const handleStartMatch = async () => {
  const Team1 = selectedLeft.filter(Boolean).map((c) => c.CharacterName);
  const Team2 = selectedRight.filter(Boolean).map((c) => c.CharacterName);

  if (!Team1.length || !Team2.length) return;

  try {
    const res = await fetch(
      "https://n53zmhw1m0.execute-api.us-east-1.amazonaws.com/dev",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Team1,
          Team2,
          MatchType: matchType,
        }),
      }
    );

    const data = await res.json();
    console.log("Match queued:", data);

    // Reset team selections after successful submit
    const config = matchTypes.find((m) => m.id === matchType);
    setSelectedLeft(createEmptySlots(config.leftCount));
    setSelectedRight(createEmptySlots(config.rightCount));
    setActiveSlot(null);
  } catch (err) {
    console.error("Failed to queue match:", err);
  }
};



  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {matchTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleMatchTypeChange(type.id)}
            className={`px-6 py-3 rounded-lg font-bold ${
              matchType === type.id ? "bg-primary text-white" : "bg-secondary"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div
        className="grid gap-8"
        style={{ gridTemplateColumns: `repeat(2, 1fr) auto repeat(2, 1fr)` }}
      >
        {renderTeamSlots(selectedLeft, currentMatchConfig.leftCount, true)}

        <div className="flex flex-col items-center justify-center">
          <div className="text-3xl font-black">VS</div>
          <button
            disabled={!isReadyToStart}
            onClick={handleStartMatch}
            className={`mt-4 px-6 py-3 rounded font-bold transition-colors ${
              isReadyToStart
                ? "bg-[hsl(var(--success))] text-white hover:bg-[hsl(var(--success))]/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            Start Match
          </button>

        </div>

        {renderTeamSlots(selectedRight, currentMatchConfig.rightCount, false)}
      </div>

      <div className="grid grid-cols-16 md:grid-cols-16 lg:grid-cols-16 gap-3">
        {characters.map((char) => (
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
        ))}
      </div>
    </div>
  );
}

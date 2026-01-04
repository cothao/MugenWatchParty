"use client";

import { useState } from 'react';
import BetCard from '../components/BetCard';
import StreamViewer from '../components/StreamViewer';
import CharacterStats from '../components/CharacterStats';
import MatchSection from '../components/MatchSection';



export default function Index() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [betAmount, setBetAmount] = useState('');

  const handleBetPlaced = (character, amount) => {
    setSelectedCharacter(character);
    setBetAmount(amount);
    // In a real app, this would send the bet to the server
    console.log(`Bet placed: ${amount} on ${character.name} at ${character.odds}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">⚔</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">MugenBets</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Live Streaming
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
<main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">

    {/* Left Sidebar */}
    <div className="lg:col-span-1 space-y-4">
      <h2 className="text-lg font-bold text-foreground mb-4">
        Available Bets
      </h2>

      {/* <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-card">
        {mockCharacters.map((character) => (
          <BetCard
            key={character.id}
            character={character}
            isSelected={selectedCharacter?.id === character.id}
            onBet={handleBetPlaced}
          />
        ))}
      </div> */}
    </div>

    {/* Center Stream */}
    <div className="lg:col-span-3">
      <StreamViewer selectedCharacter={selectedCharacter} />
    </div>

    {/* Right Stats */}
    <div className="lg:col-span-2">
      <h2 className="text-lg font-bold text-foreground mb-4">
        Character Stats
      </h2>

      <div className="max-h-[600px] overflow-y-auto border border-border rounded-lg">
        <CharacterStats />
      </div>
    </div>

  </div>
  <MatchSection />
</main>

    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BetCard from '../components/BetCard';
import StreamViewer from '../components/StreamViewer';
import CharacterStats from '../components/CharacterStats';
import MatchSection from '../components/MatchSection';
import LiveBets from '../components/LiveBets';



export default function Index() {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("user");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      setCurrentUser(parsed);
    } catch {
      setCurrentUser(stored);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("user");
      // clear local state
      setCurrentUser(null);
      // refresh main page
      window.location.reload();
    }
  };

  const handleBetPlaced = (character, amount) => {
    setSelectedCharacter(character);
    setBetAmount(amount);
    // In a real app, this would send the bet to the server
    console.log(`Bet placed: ${amount} on ${character.name} at ${character.odds}`);

    if (typeof window !== "undefined") {
      let username = null;
      if (currentUser) {
        username =
          currentUser.username ||
          currentUser.email ||
          (typeof currentUser === "string" ? currentUser : null);
      } else {
        try {
          const stored = window.localStorage.getItem("user");
          if (stored) {
            const parsed = JSON.parse(stored);
            username =
              parsed.username ||
              parsed.email ||
              (typeof parsed === "string" ? parsed : null);
          }
        } catch {
          // ignore
        }
      }

      if (!username) username = "Guest";

      window.localStorage.setItem(
        "currentBet",
        JSON.stringify({
          username,
          team: character.team || null,
          amount,
        })
      );
    }
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
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Live Streaming</span>
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <span>
                    Hello!{" "}
                    {currentUser.username ||
                      currentUser.email ||
                      currentUser}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-2 py-1 text-xs border border-border rounded hover:bg-muted"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-primary hover:underline">
                    Login
                  </Link>
                  <Link href="/create-user" className="text-primary hover:underline">
                    Create Account
                  </Link>
                </>
              )}
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

      <LiveBets
        selectedCharacter={selectedCharacter}
        onBet={handleBetPlaced}
      />
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

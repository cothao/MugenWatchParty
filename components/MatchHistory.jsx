"use client";

import { useState, useEffect, useRef } from "react";

function CharacterCell({ character }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded flex items-center justify-center text-sm border border-primary/20">
        <img src={character.portrait} alt={character.name} />
      </div>
      <span className="text-sm font-medium text-foreground">{character.name}</span>
    </div>
  );
}

function TeamDisplay({ team, isWinner }) {
  return (
    <div
      className={`space-y-2 p-3 rounded-lg ${
        isWinner
          ? "bg-success/10 border border-success/30"
          : "bg-card/50"
      }`}
    >
      {team.map((character, idx) => (
        <CharacterCell key={idx} character={character} />
      ))}
    </div>
  );
}

export default function MatchHistory() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  const sortMatches = (matchesArray) => {
    return matchesArray.sort(
      (a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)
    );
  };

  // Fetch initial matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(
          "https://z9wgtvrk3h.execute-api.us-east-1.amazonaws.com/dev"
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let data = await res.json();
        data = JSON.parse(data.body).matches;

        const formatted = data.map((match) => ({
          id: match.MatchID,
          matchType: match.MatchType,
          team1: match.Team1.map((name) => ({
            name,
            portrait: name + ".jpg",
          })),
          team2: match.Team2.map((name) => ({
            name,
            portrait: name + ".jpg",
          })),
          tierFought: match.TierFought,
          winningTeam: match.Winner,
          CreatedAt: match.CreatedAt, // keep this for sorting
        }));

        setMatches(sortMatches(formatted));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Setup WebSocket
  useEffect(() => {
    wsRef.current = new WebSocket(
      "wss://ypbp6hxepl.execute-api.us-east-1.amazonaws.com/production/"
    );

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    wsRef.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === "NEW_MATCH") {
          const match = msg.match;
          const formattedMatch = {
            id: match.MatchID,
            matchType: match.MatchType,
            team1: match.Team1.map((name) => ({
              name,
              portrait: name + ".jpg",
            })),
            team2: match.Team2.map((name) => ({
              name,
              portrait: name + ".jpg",
            })),
            tierFought: match.TierFought,
            winningTeam: match.Winner,
            CreatedAt: match.CreatedAt,
          };

          setMatches((prev) => sortMatches([formattedMatch, ...prev]));
        }
      } catch (err) {
        console.error("Invalid WS message:", event.data, err);
      }
    };

    return () => {
      wsRef.current.close();
    };
  }, []);

  if (loading) return <p>Loading match history...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-6 py-4 text-left font-semibold text-muted-foreground">
              Team 1
            </th>
            <th className="px-6 py-4 text-center font-semibold text-muted-foreground">
              Match Type
            </th>
            <th className="px-6 py-4 text-left font-semibold text-muted-foreground">
              Team 2
            </th>
            <th className="px-6 py-4 text-left font-semibold text-muted-foreground">
              Tier
            </th>
            <th className="px-6 py-4 text-left font-semibold text-muted-foreground">
              Winner
            </th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr
              key={match.id}
              className="border-b border-border hover:bg-secondary/5 transition-colors"
            >
              <td className="px-6 py-4">
                <TeamDisplay
                  team={match.team1}
                  isWinner={match.winningTeam === 1}
                />
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-block px-3 py-1 bg-secondary/30 text-foreground rounded font-bold text-sm">
                  {match.matchType}
                </span>
              </td>
              <td className="px-6 py-4">
                <TeamDisplay
                  team={match.team2}
                  isWinner={match.winningTeam === 2}
                />
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-3 py-1 rounded font-semibold text-xs uppercase tracking-wider ${
                    match.tierFought === "S"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : match.tierFought === "A"
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : match.tierFought === "B"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  {match.tierFought}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-success font-bold">
                    Team {match.winningTeam}
                  </span>
                  <span className="text-success font-semibold text-lg">✓</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

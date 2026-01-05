"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import BetCard from "./BetCard";
import { useCharacters } from "../hooks/useCharacters";
import { useReconnectingWebSocket } from "../hooks/useReconnectingWebSocket";

const WS_URL = "wss://h0j6o23mx2.execute-api.us-east-1.amazonaws.com/production";
const INITIAL_API_URL = "https://t0nsl0w8se.execute-api.us-east-1.amazonaws.com/dev";
const BET_API_URL = "https://q79g1rui2a.execute-api.us-east-1.amazonaws.com/dev";

export default function LiveBets({ selectedCharacter, onBet }) {
  const { characters, loading, error } = useCharacters();
  const [latestMatch, setLatestMatch] = useState(null);
  const [bettingOpen, setBettingOpen] = useState(false);
  const prevBettingOpenRef = useRef(bettingOpen);

  // Initial REST fetch to get the latest existing queued match
  useEffect(() => {
    let cancelled = false;

    const fetchLatest = async () => {
      try {
        const res = await fetch(INITIAL_API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Handle Lambda proxy style: { statusCode, body: "{...}" }
        const body = json.body ? JSON.parse(json.body) : json;
        console.log(body);

        // New shape: { match: { ... } }
        const latest = body?.match;
        if (
          cancelled ||
          !latest ||
          (!latest.Team1 && !latest.Team2)
        ) {
          return;
        }

        setLatestMatch((current) => current ?? latest);
        setBettingOpen(true);
      } catch (err) {
        console.error("Failed to fetch initial latest match for LiveBets", err);
      }
    };

    fetchLatest();

    return () => {
      cancelled = true;
    };
  }, []);

  // WebSocket message handler (stable via useCallback)
  const handleWsMessage = useCallback(
    (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("LiveBets message", msg);

        // If record was deleted from currentmatch table, close betting but keep info
        if (msg?.type === "DELETED_RECORD") {
          setBettingOpen(false);
          // Optionally update latestMatch from deleted data if needed:
          // if (msg.data) setLatestMatch((prev) => prev ?? msg.data);
          return;
        }

        // First, detect "no current match" signals from the backend
        const noRecords =
          msg?.type === "NO_RECORDS" ||
          msg?.match === null ||
          (Array.isArray(msg?.matches) && msg.matches.length === 0) ||
          (Array.isArray(msg) && msg.length === 0);

        if (noRecords) {
          // Betting closed: keep latestMatch so portraits stay, just disallow betting
          setBettingOpen(false);
          return;
        }

        // Handle different envelope shapes from the backend
        let record = null;

        if (msg?.type === "NEW_RECORD" && msg.data) {
          // Shape: { type: 'NEW_RECORD', data: { Team1, Team2, ... } }
          record = msg.data;
        } else if (msg?.match) {
          // Shape: { match: { ... } }
          record = msg.match;
        } else if (msg?.Team1 || msg?.Team2) {
          // Raw match record
          record = msg;
        }

        if (record && (record.Team1 || record.Team2)) {
          // Betting open: we have a current match
          setLatestMatch(record);
          setBettingOpen(true);
        }
      } catch (e) {
        console.error("Failed to parse LiveBets message", event.data, e);
      }
    },
    [setLatestMatch, setBettingOpen]
  );

  // Use reconnecting WebSocket
  useReconnectingWebSocket(WS_URL, {
    onMessage: handleWsMessage,
    // Optional logging callbacks if you want:
    // onOpen: () => console.log("LiveBets WebSocket connected"),
    // onClose: (e) => console.log("LiveBets WebSocket disconnected", e.code, e.reason),
    // onError: (e) => console.error("LiveBets WebSocket error", e),
  });

  // When betting closes, submit the stored bet
  useEffect(() => {
    const prev = prevBettingOpenRef.current;
    prevBettingOpenRef.current = bettingOpen;

    // Only act on transition true -> false
    if (prev === true && bettingOpen === false && latestMatch) {
      if (typeof window === "undefined") return;
      const stored = window.localStorage.getItem("currentBet");
      if (!stored) return;

      let bet;
      try {
        bet = JSON.parse(stored);
      } catch {
        return;
      }
      if (!bet?.username || !bet?.team || !bet?.amount) return;

      (async () => {
        try {
          let res = await fetch(BET_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: bet.username,
              team: bet.team,
              amount: bet.amount,
            }),
          });
            res = await res.json();
          console.log("Bet submitted", res);
          // Clear bet after submitting
          window.localStorage.removeItem("currentBet");
        } catch (err) {
          console.error("Failed to submit bet", err);
        }
      })();
    }
  }, [bettingOpen, latestMatch]);

  // Map queued match team names to character objects for BetCard
  const betCharacters = useMemo(() => {
    if (!latestMatch) return [];

    const team1Names = Array.isArray(latestMatch.Team1)
      ? latestMatch.Team1
      : latestMatch.Team1
      ? [latestMatch.Team1]
      : [];
    const team2Names = Array.isArray(latestMatch.Team2)
      ? latestMatch.Team2
      : latestMatch.Team2
      ? [latestMatch.Team2]
      : [];

    const allNames = [...team1Names, ...team2Names];
    const uniqueNames = Array.from(new Set(allNames.filter(Boolean)));

    const findCharacter = (name) => {
      if (!Array.isArray(characters) || !characters.length) return null;
      return (
        characters.find(
          (c) =>
            c.CharacterName === name ||
            c.id === name ||
            c.name === name
        ) || null
      );
    };

    return uniqueNames
      .map((name) => {
        const base = findCharacter(name);
        const winRate =
          typeof base?.winRate === "number" && base.winRate > 0
            ? base.winRate
            : 0.5;
        const odds = Number((1 / winRate).toFixed(2));

        // Use the full array of character names for the team that this character belongs to
        const team = team1Names.includes(name)
          ? team1Names
          : team2Names.includes(name)
          ? team2Names
          : [];

        return {
          id: base?.id || base?.CharacterName || base?.name || name,
          name: base?.CharacterName || base?.name || name,
          tier: base?.tier ?? "N/A",
          portrait: base?.portrait || `${name}.jpg`,
          odds,
          team, // this is now an array of character names
        };
      })
      .filter(Boolean);
  }, [latestMatch, characters]);

  if (!latestMatch || !betCharacters.length) {
    return <p className="text-sm text-muted-foreground">No live bets yet. Waiting for next queued match…</p>;
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-card">
      {!bettingOpen && (
        <p className="text-xs text-muted-foreground">
          Betting closed for this match. Waiting for next betting phase…
        </p>
      )}
      {betCharacters.map((character) => (
        <div
          key={character.id}
          className={!bettingOpen ? "opacity-50 pointer-events-none" : ""}
        >
          <BetCard
            character={character}
            isSelected={selectedCharacter?.id === character.id}
            onBet={onBet}
          />
        </div>
      ))}
    </div>
  );
}

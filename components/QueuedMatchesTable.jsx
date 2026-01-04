"use client";

import { useEffect, useState } from "react";

const API_URL = "https://9xjt1j46rc.execute-api.us-east-1.amazonaws.com/dev";

export default function QueuedMatchesTable({ characters = [] }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMatches = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Handle Lambda proxy style: { statusCode, body: "{...}" }
        const body = json.body ? JSON.parse(json.body) : json;
        let list = Array.isArray(body.matches) ? body.matches : [];

        // Sort by CreatedAt so earliest is at the top
        list = [...list].sort((a, b) => {
          const aTime = a?.CreatedAt ? new Date(a.CreatedAt).getTime() : 0;
          const bTime = b?.CreatedAt ? new Date(b.CreatedAt).getTime() : 0;
          return aTime - bTime;
        });

        if (isMounted) {
          setMatches(list);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load queued matches", err);
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchMatches();

    const interval = setInterval(fetchMatches, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Loading queued matches…</p>;
  if (error) return <p className="text-sm text-destructive">Failed to load queued matches.</p>;
  if (!matches.length) return <p className="text-sm text-muted-foreground">No queued matches right now.</p>;

  const findCharacter = (name) => {
    if (!name) return null;
    return (
      characters.find(
        (c) =>
          c.CharacterName === name ||
          c.id === name ||
          c.name === name
      ) || null
    );
  };

  const renderTeamCell = (team) => {
    const names = Array.isArray(team)
      ? team
      : team
      ? [team]
      : [];

    if (!names.length) {
      return <span className="text-muted-foreground">-</span>;
    }

    return (
      <div className="flex flex-wrap gap-2 items-center">
        {names.map((name, idx) => {
          const character = findCharacter(name);
          const src = character?.portrait || `${name}.jpg`;

          return (
            <div
              key={`${name}-${idx}`}
              className="flex items-center gap-2 max-w-full"
            >
              <img
                src={src}
                alt={name}
                className="w-8 h-8 rounded object-cover border border-border shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="text-xs font-medium break-all">{name}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-h-[500px] overflow-y-auto border border-border rounded-lg">
      <table className="stats-table table-fixed w-full">
        <thead className="sticky top-0 z-10 bg-card">
          <tr>
            <th className="w-2/5">Team 1</th>
            <th className="w-2/5">Team 2</th>
            <th className="w-1/5 text-right">Type</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.MatchID}>
              <td className="text-sm align-top">{renderTeamCell(match.Team1)}</td>
              <td className="text-sm align-top">{renderTeamCell(match.Team2)}</td>
              <td className="text-sm text-right whitespace-nowrap align-top">
                {match.MatchType || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

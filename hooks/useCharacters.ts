import { useEffect, useState } from "react";

export function useCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // REST fetch
  useEffect(() => {
    fetch("https://5qapdy5k29.execute-api.us-east-1.amazonaws.com/dev")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const body = JSON.parse(json.body);

        const normalized = Object.keys(body.characters).map((name) => {
          const c = body.characters[name];
          return {
            id: name,
            CharacterName: c.CharacterName,
            portrait: `${c.CharacterName}.jpg`,
            tier: c.Tier ?? "N/A",
            wins: c.Wins ?? 0,
            losses: c.Losses ?? 0,
            winRate: c.WinRate ?? 0,
          };
        });

        setCharacters(normalized);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { characters, loading, error };
}

import { useEffect, useState } from "react";

function CharacterStats() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper functions
  const getTierColor = (tier) => {
    switch (tier) {
      case "S": return "tier-s";
      case "A": return "tier-a";
      case "B": return "tier-b";
      case "C": return "tier-c";
      default: return "tier-na";
    }
  };

  const getWinRateColor = (winRate) => {
    if (winRate >= 75) return "win-rate-positive";
    if (winRate >= 50) return "text-warning";
    return "win-rate-negative";
  };

  // Fetch initial stats
  useEffect(() => {
    fetch("https://5qapdy5k29.execute-api.us-east-1.amazonaws.com/dev")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((json) => {
        const body = JSON.parse(json.body);
        const characters = Object.keys(body.characters).map((CharacterName) => ({
          CharacterName,
          ...body.characters[CharacterName],
        }));
        console.log("Fetched character data:", characters);
        setData(characters);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching character data:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket(
      "wss://nhjft1ry2h.execute-api.us-east-1.amazonaws.com/production"
    );

    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket disconnected");

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "STATS_UPDATE") {
          // Convert object to array if needed
          const characters = msg.data.map((item) => ({
            CharacterName: item.CharacterName,
            Wins: item.Wins,
            Losses: item.Losses,
            WinRate: item.WinRate,
            Tier: item.Tier,
          }));
          setData(characters);
        }
      } catch (err) {
        console.error("Invalid WebSocket message:", event.data);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => ws.close(); // Clean up on unmount
  }, []);

  if (loading) return <p>Loading character stats...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
<table className="stats-table table-fixed w-full">
  <thead>
    <tr>
      <th className="w-2/3">Character</th>
      <th className="w-1/6 text-center">W-L</th>
      <th className="w-1/6 text-right">WR%</th>
    </tr>
  </thead>

  <tbody>
    {data.map((stat, index) => (
      <tr key={index}>
        <td className="align-top">
          <div className="flex items-start gap-2 min-w-0">

            {/* Tier Badge */}
            <span className={`tier-badge ${getTierColor(stat.Tier)} shrink-0`}>
              {stat.Tier || "N/A"}
            </span>
            {/* Portrait */}
            {stat.CharacterName && (
              <img
                src={stat.CharacterName + ".jpg"}
                alt={stat.CharacterName}
                className="w-10 h-10 rounded object-cover shrink-0"
              />
            )}

            {/* Character Name */}
            <span className="text-sm font-medium text-foreground break-all">
              {stat.CharacterName}
            </span>
          </div>
        </td>

        <td className="text-center text-sm whitespace-nowrap">
          <span className="text-[hsl(var(--success))]">{stat.Wins}</span>
          <span className="text-muted-foreground mx-1">-</span>
          <span className="text-error">{stat.Losses}</span>
        </td>

        <td
          className={`text-right text-sm font-bold whitespace-nowrap ${getWinRateColor(
            stat.WinRate
          )}`}
        >
          {typeof stat.WinRate === "number" ? `${stat.WinRate}%` : "N/A"}
        </td>
      </tr>
    ))}
  </tbody>
</table>

  );
}

export default CharacterStats;

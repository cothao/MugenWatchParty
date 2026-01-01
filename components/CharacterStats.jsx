import { useEffect, useState } from 'react';

function CharacterStats() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://5qapdy5k29.execute-api.us-east-1.amazonaws.com/dev")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Already returns JS object
      })
      .then((json) => {
        // Convert object of characters into array for easy mapping
        const characters = Object.keys(JSON.parse(json.body).characters).map((CharacterName) => ({
          CharacterName,
          ...JSON.parse(json.body).characters[CharacterName], // spread wins, losses, winRate, tier
        }));
        console.log(JSON.parse(json.body).characters);
        setData(characters);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching character data:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'S': return 'tier-s';
      case 'A': return 'tier-a';
      case 'B': return 'tier-b';
      case 'C': return 'tier-c';
      default: return 'tier-c';
    }
  };

  const getWinRateColor = (winRate) => {
    if (winRate >= 75) return 'win-rate-positive';
    if (winRate >= 50) return 'text-warning';
    return 'win-rate-negative';
  };

  if (loading) return <p>Loading character stats...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <table className="stats-table">
      <thead>
        <tr>
          <th className="w-1/2">Character</th>
          <th className="text-center">W-L</th>
          <th className="text-right">WR%</th>
        </tr>
      </thead>
      <tbody>
        {data.map((stat, index) => (
          <tr key={index}>
            <td>
              <div className="flex items-center gap-2">
                <span className={`tier-badge ${getTierColor(stat.tier)}`}>
                  {stat.Tier}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {stat.CharacterName}
                </span>
              </div>
            </td>
            <td className="text-center text-sm">
              <span className="text-success">{stat.Wins}</span>
              <span className="text-muted-foreground">-</span>
              <span className="text-error">{stat.Losses}</span>
            </td>
            <td className={`text-right text-sm font-bold ${getWinRateColor(stat.WinRate)}`}>
              {stat.WinRate}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CharacterStats;

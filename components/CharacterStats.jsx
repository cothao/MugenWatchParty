import { useEffect, useMemo, useState } from "react";

/* ---------------- Tier helpers ---------------- */

const TIER_ORDER = [
  "SSS", "SS", "S",
  "A+", "A", "A-",
  "B+", "B", "B-",
  "C+", "C", "C-",
  "D+", "D", "D-",
  "E",
  "N/A"
];

const normalizeTier = (tier) => {
  if (!tier) return "N/A";
  return tier.toUpperCase().trim();
};

const tierRank = (tier) => {
  const t = normalizeTier(tier);
  const idx = TIER_ORDER.indexOf(t);
  return idx === -1 ? TIER_ORDER.length : idx;
};

/* ---------------- Component ---------------- */

function CharacterStats() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔍 Filters
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("WINRATE");

  /* ---------- Styling helpers ---------- */

  const getTierColor = (tier) => {
    switch (normalizeTier(tier)) {
      case "SSS": return "tier-sss";
      case "SS": return "tier-ss";
      case "S": return "tier-s";
      case "A+": return "tier-ap";
      case "A": return "tier-a";
      case "A-": return "tier-am";
      case "B+": return "tier-bp";
      case "B": return "tier-b";
      case "B-": return "tier-bm";
      case "C+": return "tier-cp";
      case "C": return "tier-c";
      case "C-": return "tier-cm";
      case "D+": return "tier-dp";
      case "D": return "tier-d";
      case "D-": return "tier-dm";
      case "E+": return "tier-ep";
      case "E": return "tier-e";
      case "E-": return "tier-em";
      default: return "tier-na";
    }
  };

  const getWinRateColor = (winRate) => {
    if (winRate >= 75) return "win-rate-positive";
    if (winRate >= 50) return "text-warning";
    return "win-rate-negative";
  };

  /* ---------- Initial REST fetch ---------- */

  useEffect(() => {
    fetch("https://5qapdy5k29.execute-api.us-east-1.amazonaws.com/dev")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const body = JSON.parse(json.body);
        const characters = Object.keys(body.characters).map((CharacterName) => ({
          CharacterName,
          ...body.characters[CharacterName],
        }));
        setData(characters);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      });
  }, []);

  /* ---------- WebSocket updates ---------- */

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
          setData(msg.data);
        }
      } catch {
        console.error("Invalid WS message:", event.data);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    return () => ws.close();
  }, []);

  /* ---------- Filtered + sorted data ---------- */

  const filteredData = useMemo(() => {
    let result = [...data];

    // 🔍 Name search
    if (search) {
      result = result.filter((c) =>
        c.CharacterName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 🏷 Tier filter
    if (tierFilter !== "ALL") {
      result = result.filter(
        (c) => normalizeTier(c.Tier) === tierFilter
      );
    }

    // ↕ Sorting
    switch (sortBy) {
      case "NAME":
        result.sort((a, b) =>
          a.CharacterName.localeCompare(b.CharacterName)
        );
        break;
      case "WINS":
        result.sort((a, b) => (b.Wins ?? 0) - (a.Wins ?? 0));
        break;
      case "TIER":
        result.sort((a, b) => tierRank(a.Tier) - tierRank(b.Tier));
        break;
      case "WINRATE":
      default:
        result.sort((a, b) => (b.WinRate ?? 0) - (a.WinRate ?? 0));
        break;
    }

    return result;
  }, [data, search, tierFilter, sortBy]);

  /* ---------- Render ---------- */

  if (loading) return <p>Loading character stats...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="space-y-4">

      {/* 🔧 Controls */}
      <div className="flex flex-wrap gap-3 items-center sticky top-0 z-20 bg-background py-2">
        <input
          type="text"
          placeholder="Search characters…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded border border-border bg-card text-sm w-64"
        />

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 rounded border border-border bg-card text-sm"
        >
          <option value="ALL">All Tiers</option>
          {TIER_ORDER.map((tier) => (
            <option key={tier} value={tier}>{tier}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 rounded border border-border bg-card text-sm"
        >
          <option value="WINRATE">Sort: Win Rate</option>
          <option value="WINS">Sort: Wins</option>
          <option value="TIER">Sort: Tier</option>
          <option value="NAME">Sort: Name</option>
        </select>
      </div>

      {/* 📊 Table */}
      <table className="stats-table table-fixed w-full">
        <thead className="sticky top-[56px] z-10 bg-card">
          <tr>
            <th className="w-2/3">Character</th>
            <th className="w-1/6 text-center">W-L</th>
            <th className="w-1/6 text-right">WR%</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map((stat, index) => (
            <tr key={index}>
              <td className="align-top">
                <div className="flex items-start gap-2 min-w-0">
                  <span className={`tier-badge ${getTierColor(stat.Tier)} shrink-0`}>
                    {stat.Tier || "N/A"}
                  </span>

                  <img
                    src={`${stat.CharacterName}.jpg`}
                    alt={stat.CharacterName}
                    className="w-10 h-10 rounded object-cover shrink-0"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />

                  <span className="text-sm font-medium break-all">
                    {stat.CharacterName}
                  </span>
                </div>
              </td>

              <td className="text-center text-sm whitespace-nowrap">
                <span className="text-[hsl(var(--success))]">{stat.Wins ?? 0}</span>
                <span className="text-muted-foreground mx-1">-</span>
                <span className="text-error">{stat.Losses ?? 0}</span>
              </td>

              <td className={`text-right text-sm font-bold whitespace-nowrap ${getWinRateColor(stat.WinRate)}`}>
                {typeof stat.WinRate === "number" ? `${(stat.WinRate * 100).toFixed(2)}%` : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CharacterStats;

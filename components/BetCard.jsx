import { useState } from 'react';

export default function BetCard({ character, isSelected, onBet }) {
  const [betAmount, setBetAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePlaceBet = () => {
    if (betAmount && parseFloat(betAmount) > 0) {
      onBet(character, betAmount);
      setShowConfirm(true);
      setTimeout(() => {
        setShowConfirm(false);
        setBetAmount('');
      }, 2000);
    }
  };

  return (
    <div
      className={`bet-card transition-all text-xs ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
    >
      {/* Character Info */}
      <div className="mb-3 flex items-center gap-3">
        {character.portrait && (
          <img
            src={character.portrait}
            alt={character.name}
            className="w-10 h-10 rounded object-cover border border-border flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-[11px] truncate">
              {character.name}
            </span>
            <span className={`tier-badge tier-${character.tier.toLowerCase()}`}>
              {character.tier}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">Tier {character.tier}</div>
        </div>
      </div>

      {/* Odds Display */}
      <div className="mb-3 bg-secondary/10 rounded-lg p-2 border border-secondary/20">
        <div className="text-[10px] text-muted-foreground mb-1">Current Odds</div>
        <div className="odds-display text-sm">{character.odds}</div>
      </div>

      {/* Bet Input */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-muted-foreground mb-2">
          Bet Amount
        </label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder="$0.00"
          className="w-full px-3 py-2 bg-background border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          min="0"
          step="10"
        />
      </div>

      {/* Potential Winnings */}
      {betAmount && parseFloat(betAmount) > 0 && (
        <div className="mb-3 p-2 bg-success/10 border border-success/20 rounded text-[11px]">
          <div className="text-muted-foreground">Potential Win</div>
          <div className="text-[hsl(var(--success))] font-bold">
            ${(parseFloat(betAmount) * character.odds).toFixed(2)}
          </div>
        </div>
      )}

      {/* Bet Button */}
      <button
        onClick={handlePlaceBet}
        disabled={!betAmount || parseFloat(betAmount) <= 0}
        className="bet-button bet-button-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
      >
        {showConfirm ? '✓ Bet Placed!' : 'Place Bet'}
      </button>
    </div>
  );
}

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
      className={`bet-card transition-all ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
    >
      {/* Character Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="character-name-display">{character.name}</span>
          <span className={`tier-badge tier-${character.tier.toLowerCase()}`}>
            {character.tier}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">Tier {character.tier}</div>
      </div>

      {/* Odds Display */}
      <div className="mb-4 bg-secondary/10 rounded-lg p-3 border border-secondary/20">
        <div className="text-xs text-muted-foreground mb-1">Current Odds</div>
        <div className="odds-display">{character.odds}</div>
      </div>

      {/* Bet Input */}
      <div className="mb-4">
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
        <div className="mb-4 p-2 bg-success/10 border border-success/20 rounded text-xs">
          <div className="text-muted-foreground">Potential Win</div>
          <div className="text-success font-bold">
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

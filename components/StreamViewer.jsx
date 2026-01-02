import TwitchEmbed from './TwitchEmbed';

export default function StreamViewer({ selectedCharacter }) {
  return (
    <div className="space-y-4">
      {/* Stream Container */}
      {/* <div className="stream-placeholder">
        <div className="text-center">
          <div className="text-4xl mb-2">🎮</div>
          <div className="text-muted-foreground">
            <p className="font-semibold mb-1">Mugen Tournament Stream</p>
            <p className="text-sm">Stream player placeholder</p>
          </div>
        </div>
      </div> */}

      {/* Live Info */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span className="font-semibold text-foreground">LIVE NOW</span>
        </div>
        <TwitchEmbed channel="collinthao" />
        <p className="text-sm text-muted-foreground mb-3">
          Watch fighters battle in real-time Mugen matches. Place your bets and test your prediction skills!
        </p>

        {/* Selected Bet Info */}
        {selectedCharacter && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="text-sm font-semibold text-primary mb-1">
              Your Active Bet
            </div>
            <div className="text-foreground">
              You've backed <span className="font-bold">{selectedCharacter.name}</span> at odds of{' '}
              <span className="font-bold text-primary">{selectedCharacter.odds}</span>
            </div>
          </div>
        )}

        {/* Match Info */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Viewers</div>
              <div className="text-lg font-bold text-foreground">2,847</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Total Pool</div>
              <div className="text-lg font-bold text-[hsl(var(--success))]">$12,453</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

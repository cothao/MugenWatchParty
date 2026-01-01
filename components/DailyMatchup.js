'use client';

import { useState, useEffect } from 'react';
import { cn, formatNumber } from '../lib/utils';

// Trophy icon component
const Trophy = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20.5C20.78 4 21 4.22 21 4.5S20.78 5 20.5 5H19V8C19 10.21 17.21 12 15 12H14V14.5H16C16.55 14.5 17 14.95 17 15.5S16.55 16.5 16 16.5H8C7.45 16.5 7 16.05 7 15.5S7.45 14.5 8 14.5H10V12H9C6.79 12 5 10.21 5 8V5H3.5C3.22 5 3 4.78 3 4.5S3.22 4 3.5 4H7ZM9 5V10H15V5H9Z"/>
  </svg>
);

export function DailyMatchup({ matchup }) {
  const { player1, player2, showWinner = false } = matchup;

  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  // Add data validation and logging
  console.log('DailyMatchup received matchup:', matchup);

  // Handle the new API data structure with validation
  const safePlayer1 = player1 || { name: 'No Player', steps: 0, team: 'red', playerNumber: 0 };
  const safePlayer2 = player2 || { name: 'No Player', steps: 0, team: 'blue', playerNumber: 0 };
  
  const safeSteps1 = typeof safePlayer1.steps === 'number' ? safePlayer1.steps : 0;
  const safeSteps2 = typeof safePlayer2.steps === 'number' ? safePlayer2.steps : 0;
  
  const isPlayer1Winner = safeSteps1 > safeSteps2;
  const isPlayer2Winner = safeSteps2 > safeSteps1;
  const isTie = safeSteps1 === safeSteps2;

  console.log('DailyMatchup processed:', { player1: safePlayer1, player2: safePlayer2, isPlayer1Winner, isPlayer2Winner, isTie });

  useEffect(() => {
    setMounted(true);
    setFormattedDate(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  const getWinnerText = () => {
    if (!showWinner) return null;
    
    if (safePlayer1.steps > safePlayer2.steps) {
      return `🏆 ${safePlayer1.name} WINS!`;
    } else if (safePlayer2.steps > safePlayer1.steps) {
      return `🏆 ${safePlayer2.name} WINS!`;
    } else {
      return "🤝 IT'S A TIE!";
    }
  };

  return (
    <div className={cn(
      'relative rounded-3xl bg-card-80 backdrop-blur-sm border border-border-50 p-6 overflow-hidden'
    )}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-electric/5 to-purple-400/5"></div>
      <div className="absolute top-4 right-4 opacity-10">
        <span className="text-6xl animate-sparkle">⚡</span>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-electric to-purple-400 bg-clip-text text-transparent mb-2">
            TODAY'S MATCHUP
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {mounted ? formattedDate : 'Loading...'}
          </p>
          {/* Add debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-500 mt-1">
              Red: {safeSteps1} vs Blue: {safeSteps2} (Players: {safePlayer1.playerNumber} vs {safePlayer2.playerNumber})
            </p>
          )}
        </div>

        {/* VS Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          {/* Player 1 */}
          <div className="flex-1 text-center">
            <div className="relative group">
              {/* Large Team Member Image */}
              <div className={cn(
                'relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 rounded-3xl overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-105',
                isPlayer1Winner && 'ring-4 ring-team-red ring-offset-4 ring-offset-background'
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-orange-600"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-black text-white text-shadow">
                    {safePlayer1.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                {/* Flame Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-500/30 to-transparent animate-battle-pulse"></div>
              </div>
              
              {isPlayer1Winner && (
                <div className="absolute -top-2 -right-2 bg-team-red text-team-red-foreground rounded-full p-2 shadow-lg animate-bounce">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">{safePlayer1.name}</h3>
            <div className="inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-team-red-light/10 text-team-red border border-team-red/20">
              🔥 Fire Walkers
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-team-red">
                {formatNumber(safeSteps1)}
              </div>
              <div className="text-sm text-muted-foreground font-medium mt-1">
                Steps Today
              </div>
            </div>
          </div>

          {/* VS Badge */}
          <div className="px-4 lg:px-8 order-first lg:order-none">
            <div className="bg-gradient-to-r from-electric to-purple-400 text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center font-black text-xl sm:text-2xl shadow-lg animate-pulse">
              ⚡
            </div>
          </div>

          {/* Player 2 */}
          <div className="flex-1 text-center">
            <div className="relative group">
              {/* Large Team Member Image */}
              <div className={cn(
                'relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 rounded-3xl overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-105',
                isPlayer2Winner && 'ring-4 ring-team-blue ring-offset-4 ring-offset-background'
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-black text-white text-shadow">
                    {safePlayer2.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                {/* Lightning Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/30 to-transparent animate-battle-pulse"></div>
              </div>
              
              {isPlayer2Winner && (
                <div className="absolute -top-2 -right-2 bg-team-blue text-team-blue-foreground rounded-full p-2 shadow-lg animate-bounce">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2">{safePlayer2.name}</h3>
            <div className="inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-team-blue-light/10 text-team-blue border border-team-blue/20">
              ⛈️ Storm Striders
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-team-blue">
                {formatNumber(safeSteps2)}
              </div>
              <div className="text-sm text-muted-foreground font-medium mt-1">
                Steps Today
              </div>
            </div>
          </div>
        </div>

        {/* Winner announcement - only show in last 5 minutes */}
        {showWinner && (
          <div className="mt-6 text-center">
            <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl p-4 border border-yellow-400/30">
              <div className="text-xl sm:text-2xl font-black text-yellow-400 animate-pulse">
                {getWinnerText()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Final results at midnight!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
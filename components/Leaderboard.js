'use client';

import { useState, useEffect } from 'react';
import { cn, formatNumber } from '../lib/utils';

// Trophy icon for rankings
const Trophy = ({ className, rank }) => {
  const getColor = () => {
    switch (rank) {
      case 1: return 'text-yellow-400'; // Gold
      case 2: return 'text-gray-400';   // Silver
      case 3: return 'text-amber-600';  // Bronze
      default: return 'text-muted-foreground';
    }
  };

  return (
    <svg className={cn(className, getColor())} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20.5C20.78 4 21 4.22 21 4.5S20.78 5 20.5 5H19V8C19 10.21 17.21 12 15 12H14V14.5H16C16.55 14.5 17 14.95 17 15.5S16.55 16.5 16 16.5H8C7.45 16.5 7 16.05 7 15.5S7.45 14.5 8 14.5H10V12H9C6.79 12 5 10.21 5 8V5H3.5C3.22 5 3 4.78 3 4.5S3.22 4 3.5 4H7ZM9 5V10H15V5H9Z"/>
    </svg>
  );
};

// Crown icon for team winners
const Crown = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 5L7 7L12 2L17 7L21 5L19 16H5ZM12 18C13.1 18 14 18.9 14 20S13.1 22 12 22 10 21.1 10 20 10.9 18 12 18Z"/>
  </svg>
);

// Player card component
function PlayerCard({ player, rank, teamColor, isTopPlayer = false }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse bg-card-40 rounded-xl p-4 h-20"></div>
    );
  }

  const getRankBadge = () => {
    if (rank <= 3) {
      return (
        <div className="flex items-center space-x-1">
          <Trophy className="w-4 h-4" rank={rank} />
          <span className="text-xs font-bold">{rank}</span>
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
        <span className="text-xs font-bold text-muted-foreground">{rank}</span>
      </div>
    );
  };

  const teamColorClasses = teamColor === 'red' 
    ? 'border-team-red/20 bg-team-red-light/5' 
    : 'border-team-blue/20 bg-team-blue-light/5';

  const avatarClasses = teamColor === 'red'
    ? 'bg-gradient-to-br from-red-500 to-orange-600'
    : 'bg-gradient-to-br from-blue-500 to-cyan-600';

  return (
    <div className={cn(
      'relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 group',
      teamColorClasses,
      isTopPlayer && 'ring-2 ring-electric ring-offset-2 ring-offset-background shadow-lg'
    )}>
      {isTopPlayer && (
        <div className="absolute -top-2 -right-2 z-10">
          <Crown className="w-6 h-6 text-yellow-400 animate-bounce" />
        </div>
      )}
      
      <div className="flex items-center space-x-3">
        {/* Rank */}
        <div className="flex-shrink-0">
          {getRankBadge()}
        </div>

        {/* Avatar */}
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg',
          avatarClasses
        )}>
          {player.name.split(' ').map(n => n[0]).join('')}
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground truncate group-hover:text-electric transition-colors">
            {player.name}
          </h4>
          <div className="flex items-center space-x-2">
            <span className={cn(
              'text-lg font-black',
              teamColor === 'red' ? 'text-team-red' : 'text-team-blue'
            )}>
              {formatNumber(player.totalSteps)}
            </span>
            <span className="text-xs text-muted-foreground">total</span>
          </div>
        </div>

        {/* Today's steps badge */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Today</div>
          <div className="text-sm font-semibold">
            {formatNumber(player.todaySteps)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Leaderboard({ teams, className }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn('w-full animate-pulse', className)}>
        <div className="bg-card-40 rounded-3xl p-8 h-96"></div>
      </div>
    );
  }

  // Validate teams data
  if (!teams || teams.length < 2) {
    return (
      <div className={cn('w-full', className)}>
        <div className="text-center p-8">
          <div className="text-muted-foreground">No team data available</div>
        </div>
      </div>
    );
  }

  // Sort players by total steps for main leaderboard
  const [teamRed, teamBlue] = teams;
  
  const sortedRedPlayers = [...(teamRed.members || [])].sort((a, b) => (b.totalSteps || 0) - (a.totalSteps || 0));
  const sortedBluePlayers = [...(teamBlue.members || [])].sort((a, b) => (b.totalSteps || 0) - (a.totalSteps || 0));

  // Get overall rankings based on total steps
  const allPlayers = [...(teamRed.members || []), ...(teamBlue.members || [])].sort((a, b) => (b.totalSteps || 0) - (a.totalSteps || 0));
  const getGlobalRank = (playerId) => allPlayers.findIndex(p => p.id === playerId) + 1;

  // Get daily champions based on today's steps
  const dailyChampions = [...(teamRed.members || []), ...(teamBlue.members || [])].sort((a, b) => (b.todaySteps || 0) - (a.todaySteps || 0));

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-electric to-primary bg-clip-text text-transparent mb-2">
          🏆 TEAM LEADERBOARDS 🏆
        </h2>
        <p className="text-muted-foreground text-lg">Total step rankings from both teams</p>
        <div className="flex justify-center space-x-1 mt-2">
          <div className="w-2 h-2 bg-team-red rounded-full animate-ping"></div>
          <div className="w-2 h-2 bg-electric rounded-full animate-ping animate-delay-200"></div>
          <div className="w-2 h-2 bg-team-blue rounded-full animate-ping animate-delay-400"></div>
        </div>
      </div>

      {/* Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fire Walkers Team */}
        <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm rounded-3xl p-6 border border-border/50 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-orange-900/5 animate-pulse"></div>
          <div className="absolute top-4 right-4 opacity-10">
            <span className="text-4xl animate-bounce">🔥</span>
          </div>

          <div className="relative z-10">
            {/* Team Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-team-red mb-2 flex items-center justify-center space-x-2">
                <span>🔥</span>
                <span>Fire Walkers</span>
                <span>🔥</span>
              </h3>
              <div className="text-sm text-muted-foreground">
                Team Total: <span className="font-bold text-team-red">{formatNumber(teamRed.totalSteps || 0)}</span> total steps
              </div>
            </div>

            {/* Players List */}
            <div className="space-y-3">
              {sortedRedPlayers.length > 0 ? sortedRedPlayers.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  rank={getGlobalRank(player.id)}
                  teamColor="red"
                  isTopPlayer={index === 0}
                />
              )) : (
                <div className="text-center text-muted-foreground py-8">
                  No players on this team yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Storm Striders Team */}
        <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm rounded-3xl p-6 border border-border/50 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-cyan-900/5 animate-pulse"></div>
          <div className="absolute top-4 right-4 opacity-10">
            <span className="text-4xl animate-bounce">⚡</span>
          </div>

          <div className="relative z-10">
            {/* Team Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-team-blue mb-2 flex items-center justify-center space-x-2">
                <span>⚡</span>
                <span>Storm Striders</span>
                <span>⚡</span>
              </h3>
              <div className="text-sm text-muted-foreground">
                Team Total: <span className="font-bold text-team-blue">{formatNumber(teamBlue.totalSteps || 0)}</span> total steps
              </div>
            </div>

            {/* Players List */}
            <div className="space-y-3">
              {sortedBluePlayers.length > 0 ? sortedBluePlayers.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  rank={getGlobalRank(player.id)}
                  teamColor="blue"
                  isTopPlayer={index === 0}
                />
              )) : (
                <div className="text-center text-muted-foreground py-8">
                  No players on this team yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Champions Stats */}
      <div className="mt-8 bg-gradient-to-r from-card/50 to-card/30 rounded-3xl p-6 border border-border/50">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">🏆 Daily Champions 🏆</h3>
          <p className="text-sm text-muted-foreground mb-4">Today's top step performers</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {dailyChampions.slice(0, 3).map((player, index) => {
              const team = teams.find(t => t.members.some(m => m.id === player.id));
              const medals = ['🥇', '🥈', '🥉'];
              
              return (
                <div key={player.id} className="flex items-center space-x-3 justify-center">
                  <span className="text-2xl">{medals[index]}</span>
                  <div className="text-center">
                    <div className="font-bold text-foreground">{player.name}</div>
                    <div className={cn(
                      'text-sm font-semibold',
                      team?.id === 'red' ? 'text-team-red' : 'text-team-blue'
                    )}>
                      {formatNumber(player.todaySteps || 0)} steps today
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

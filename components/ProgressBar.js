'use client';

import { cn, formatNumber } from '../lib/utils';

export function ProgressBar({ 
  value1, 
  value2, 
  label1, 
  label2, 
  animated = false,
  className 
}) {
  // Add data validation and logging
  console.log('ProgressBar received:', { value1, value2, label1, label2 });
  
  // Ensure values are numbers
  const safeValue1 = typeof value1 === 'number' ? value1 : 0;
  const safeValue2 = typeof value2 === 'number' ? value2 : 0;
  
  const total = safeValue1 + safeValue2;
  const percentage1 = total > 0 ? (safeValue1 / total) * 100 : 50;
  const percentage2 = total > 0 ? (safeValue2 / total) * 100 : 50;

  return (
    <div className={cn('w-full', className)}>
      {/* Epic Battle Headers */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="text-4xl filter-drop-shadow animate-bounce">🔥</span>
            {animated && (
              <div className="absolute inset-0 animate-ping">
                <span className="text-4xl opacity-75">🔥</span>
              </div>
            )}
          </div>
          <div>
            <div className="text-xl font-black text-team-red animate-pulse">{label1}</div>
            <div className="text-sm text-team-red/70 font-semibold">{formatNumber(safeValue1)} steps</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
            TUG OF WAR
          </span>
          <div className="flex space-x-1 mt-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping animate-delay-200"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping animate-delay-400"></div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-xl font-black text-team-blue animate-pulse">{label2}</div>
            <div className="text-sm text-team-blue/70 font-semibold">{formatNumber(safeValue2)} steps</div>
          </div>
          <div className="relative">
            <span className="text-4xl filter-drop-shadow animate-bounce">⚡</span>
            {animated && (
              <div className="absolute inset-0 animate-ping">
                <span className="text-4xl opacity-75">⚡</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EPIC TUG OF WAR BATTLE BAR */}
      <div className="relative h-20 bg-gradient-battle rounded-2xl overflow-hidden border-4 border-purple-500/30 shadow-2xl">
        {/* Animated background energy */}
        {animated && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-blue-900/30 animate-pulse"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-transparent animate-ping"></div>
              <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-blue-400 to-transparent animate-ping"></div>
            </div>
          </>
        )}

        {/* Fire Team Power (Left Side) */}
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-fire transition-all duration-1000 ease-out overflow-hidden"
          style={{ width: `${percentage1}%` }}
        >
          {/* Fire effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/80 via-orange-400/60 to-yellow-300/40 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-orange-300/30 to-transparent animate-ping"></div>
          
          {/* Fire particles */}
          {animated && (
            <>
              <div className="absolute top-2 left-4 w-3 h-3 bg-orange-400 rounded-full animate-bounce opacity-80"></div>
              <div className="absolute bottom-3 left-8 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
              <div className="absolute top-4 left-16 w-2 h-2 bg-yellow-400 rounded-full animate-bounce animate-delay-200"></div>
            </>
          )}
          
          {/* Fire advancing edge */}
          <div className="absolute right-0 top-0 h-full w-4 bg-gradient-to-r from-transparent to-orange-300 animate-pulse opacity-80"></div>
        </div>

        {/* Lightning Team Power (Right Side) */}
        <div 
          className="absolute top-0 right-0 h-full bg-gradient-lightning transition-all duration-1000 ease-out overflow-hidden"
          style={{ width: `${percentage2}%` }}
        >
          {/* Lightning effects */}
          <div className="absolute inset-0 bg-gradient-to-l from-blue-500/80 via-cyan-400/60 to-indigo-300/40 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-300/30 to-transparent animate-ping"></div>
          
          {/* Lightning particles */}
          {animated && (
            <>
              <div className="absolute top-2 right-4 w-3 h-3 bg-cyan-400 rounded-full animate-bounce opacity-80"></div>
              <div className="absolute bottom-3 right-8 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute top-4 right-16 w-2 h-2 bg-indigo-400 rounded-full animate-bounce animate-delay-200"></div>
            </>
          )}
          
          {/* Lightning advancing edge */}
          <div className="absolute left-0 top-0 h-full w-4 bg-gradient-to-l from-transparent to-cyan-300 animate-pulse opacity-80"></div>
        </div>

        {/* EPIC BATTLE CLASH POINT */}
        <div 
          className="absolute top-0 h-full w-2 z-10"
          style={{ left: `${percentage1}%`, transform: 'translateX(-50%)' }}
        >
          {/* Main clash effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-400 via-white to-purple-400 animate-pulse shadow-lg"></div>
          
          {/* Sparks flying */}
          {animated && (
            <div className="absolute inset-0">
              <div className="absolute -top-2 left-1/2 w-4 h-4 bg-white rounded-full animate-ping opacity-70 transform -translate-x-1/2"></div>
              <div className="absolute -bottom-2 left-1/2 w-3 h-3 bg-purple-300 rounded-full animate-bounce transform -translate-x-1/2"></div>
              
              {/* Lightning bolts */}
              <div className="absolute top-1/2 -left-3 w-6 h-0.5 bg-white animate-ping transform -translate-y-1/2 rotate-45"></div>
              <div className="absolute top-1/2 -right-3 w-6 h-0.5 bg-white animate-ping transform -translate-y-1/2 -rotate-45"></div>
            </div>
          )}
        </div>

        {/* Center battlefield indicators */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="flex items-center space-x-2">
            <span className="text-2xl animate-spin">⚔️</span>
          </div>
        </div>
      </div>

      {/* Battle Stats */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏆</span>
          <span className="text-sm font-bold text-team-red">
            {percentage1 > percentage2 ? 'WINNING!' : percentage1 === percentage2 ? 'TIED!' : 'FIGHTING!'}
          </span>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-muted-foreground">POWER DIFFERENCE</div>
          <div className="text-lg font-black text-purple-400">
            {formatNumber(Math.abs(safeValue1 - safeValue2))}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-team-blue">
            {percentage2 > percentage1 ? 'WINNING!' : percentage2 === percentage1 ? 'TIED!' : 'FIGHTING!'}
          </span>
          <span className="text-2xl">🏆</span>
        </div>
      </div>
    </div>
  );
}

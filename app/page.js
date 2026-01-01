'use client';

import { useState, useEffect } from 'react';
import { ProgressBar } from '../components/ProgressBar';
import { DailyMatchup } from '../components/DailyMatchup';
import { Leaderboard } from '../components/Leaderboard';
import { formatNumber } from '../lib/utils';

console.log("VERSION 1.0.0 - Initial release with basic features");

// Icon components
const Activity = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12L18 8L16 10L12 6L8 10L6 8L2 12L6 16L8 14L12 18L16 14L18 16L22 12Z"/>
  </svg>
);

const Calendar = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H18V1H16V3H8V1H6V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z"/>
  </svg>
);

const TrendingUp = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z"/>
  </svg>
);

const Users = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4C18.21 4 20 5.79 20 8S18.21 12 16 12 12 10.21 12 8 13.79 4 16 4M16 14C20.42 14 24 15.79 24 18V20H8V18C8 15.79 11.58 14 16 14M8 4C10.21 4 12 5.79 12 8S10.21 12 8 12 4 10.21 4 8 5.79 4 8 4M8 14C12.42 14 16 15.79 16 18V20H0V18C0 15.79 3.58 14 8 14Z"/>
  </svg>
);

function StepCounter({ steps, label, variant = 'default', className = '' }) {

  const getVariantClasses = () => {
    switch (variant) {
      case 'large':
        return 'text-4xl font-black';
      case 'team-red':
        return 'text-2xl font-bold text-team-red';
      case 'team-blue':
        return 'text-2xl font-bold text-team-blue';
      default:
        return 'text-xl font-semibold';
    }
  };

  return (
    <div className={`text-center ${className}`}>
      <div className={`text-foreground ${getVariantClasses()}`}>
        {formatNumber(steps)}
      </div>
      <div className="text-muted-foreground text-sm font-medium mt-1">
        {label}
      </div>
    </div>
  );
}

// Add helper functions for random matchup and time checking
function getDaysSinceEpoch() {
  const now = new Date();
  // Convert to CST (UTC-6)
  const cstOffset = -6 * 60; // CST is UTC-6
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const cst = new Date(utc + (cstOffset * 60000));
  
  // Get days since epoch for CST date
  const cstDate = new Date(cst.getFullYear(), cst.getMonth(), cst.getDate());
  return Math.floor(cstDate.getTime() / (1000 * 60 * 60 * 24));
}

function isLastFiveMinutes() {
  const now = new Date();
  // Convert to CST
  const cstOffset = -6 * 60;
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const cst = new Date(utc + (cstOffset * 60000));
  
  const hours = cst.getHours();
  const minutes = cst.getMinutes();
  
  // Check if it's between 11:55 PM and 11:59 PM CST
  return hours === 23 && minutes >= 55;
}

function getRandomPlayerForDay(players, daysSinceEpoch, teamId) {
  if (!players || players.length === 0) {
    return { Name: `No ${teamId} Players`, StepsToday: 0, PlayerNumber: 0 };
  }
  
  // Use day + team as seed for consistent random selection per day
  const seed = daysSinceEpoch + teamId.charCodeAt(0);
  const index = seed % players.length;
  return players[index];
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://2737dw2pq5.execute-api.us-east-1.amazonaws.com/dev');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        console.log("API data:", data);
        
        // Parse the JSON string from data.body
        const users = JSON.parse(data.body);
        console.log("Parsed users:", users);
        
        // Transform data into expected format
        const transformedData = transformApiData(users);
        setAppData(transformedData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform API data into expected format
  const transformApiData = (users) => {
    console.log('Raw users data:', users);
    
    // Validate users data
    if (!Array.isArray(users) || users.length === 0) {
      console.warn('No valid users data received');
      return {
        teams: [
          { id: 'red', name: 'Fire Walkers', todayTotalSteps: 0, members: [] },
          { id: 'blue', name: 'Storm Striders', todayTotalSteps: 0, members: [] }
        ],
        todaysMatchup: {
          player1: { name: 'No players', steps: 0, team: 'red', playerNumber: 0 },
          player2: { name: 'No players', steps: 0, team: 'blue', playerNumber: 0 }
        }
      };
    }

    // Filter users by team assignment (data already has TeamAssignment from scraper)
    const teamRedUsers = users.filter(user => user.TeamAssignment === 'red');
    const teamBlueUsers = users.filter(user => user.TeamAssignment === 'blue');
    
    console.log('Team Red Users:', teamRedUsers);
    console.log('Team Blue Users:', teamBlueUsers);

    // Calculate team totals using StepsToday field for daily stats
    const teamRedTotal = teamRedUsers.reduce((sum, user) => sum + (user.StepsToday || 0), 0);
    const teamBlueTotal = teamBlueUsers.reduce((sum, user) => sum + (user.StepsToday || 0), 0);
    
    // Calculate team totals using TotalSteps for progress bar
    const teamRedTotalSteps = teamRedUsers.reduce((sum, user) => sum + (user.TotalSteps || 0), 0);
    const teamBlueTotalSteps = teamBlueUsers.reduce((sum, user) => sum + (user.TotalSteps || 0), 0);
    
    console.log('Team totals - Red Today:', teamRedTotal, 'Blue Today:', teamBlueTotal);
    console.log('Team total steps - Red:', teamRedTotalSteps, 'Blue:', teamBlueTotalSteps);

    // Create teams structure
    const teams = [
      {
        id: 'red',
        name: 'Fire Walkers',
        todayTotalSteps: teamRedTotal,
        totalSteps: teamRedTotalSteps,
        members: teamRedUsers.map(user => ({
          id: user.ID,
          name: user.Name,
          todaySteps: user.StepsToday || 0,
          totalSteps: user.TotalSteps || 0,
          teamAssignment: user.TeamAssignment,
          playerNumber: user.PlayerNumber
        }))
      },
      {
        id: 'blue',
        name: 'Storm Striders',
        todayTotalSteps: teamBlueTotal,
        totalSteps: teamBlueTotalSteps,
        members: teamBlueUsers.map(user => ({
          id: user.ID,
          name: user.Name,
          todaySteps: user.StepsToday || 0,
          totalSteps: user.TotalSteps || 0,
          teamAssignment: user.TeamAssignment,
          playerNumber: user.PlayerNumber
        }))
      }
    ];

    // Get random players for daily matchup instead of top performers
    const daysSinceEpoch = getDaysSinceEpoch();
    const redMatchupPlayer = getRandomPlayerForDay(teamRedUsers, daysSinceEpoch, 'red');
    const blueMatchupPlayer = getRandomPlayerForDay(teamBlueUsers, daysSinceEpoch, 'blue');

    console.log('Random matchup players - Red:', redMatchupPlayer, 'Blue:', blueMatchupPlayer);

    const todaysMatchup = {
      player1: {
        name: redMatchupPlayer.Name,
        steps: redMatchupPlayer.StepsToday || 0,
        team: 'red',
        playerNumber: redMatchupPlayer.PlayerNumber || 0
      },
      player2: {
        name: blueMatchupPlayer.Name,
        steps: blueMatchupPlayer.StepsToday || 0,
        team: 'blue',
        playerNumber: blueMatchupPlayer.PlayerNumber || 0
      },
      showWinner: isLastFiveMinutes()
    };

    console.log('Final transformed data:', { teams, todaysMatchup });

    return {
      teams,
      todaysMatchup
    };
  };

  useEffect(() => {
    setMounted(true);
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }));
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-electric mb-2">StepVersus</div>
          <div className="text-muted-foreground">
            {loading ? 'Loading epic battle arena...' : 'Initializing...'}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-electric mb-2">StepVersus</div>
          <div className="text-red-500 mb-2">Error loading data: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-electric text-white rounded-lg hover:bg-electric/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-electric mb-2">StepVersus</div>
          <div className="text-muted-foreground">No data available</div>
        </div>
      </div>
    );
  }

  const { teams, todaysMatchup } = appData;
  const [teamRed, teamBlue] = teams;
  console.log(teamRed);
  
  // Calculate overall stats using total steps instead of today's steps
  const totalCombinedSteps = teams.reduce((sum, team) => sum + team.totalSteps, 0);
  const redWinning = teamRed.totalSteps > teamBlue.totalSteps;
  const stepDifference = Math.abs(teamRed.totalSteps - teamBlue.totalSteps);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-r from-electric to-primary rounded-xl sm:rounded-2xl p-2 sm:p-3">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-foreground">StepVersus</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Team Step Challenge</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-xs sm:text-sm">
                  {mounted ? currentDate : 'Loading...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-12">
        {/* Overall Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="sm:col-span-2 lg:col-span-4 text-center mb-2 sm:mb-4">
            <h2 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-electric to-primary bg-clip-text text-transparent mb-2">
              Today's Battle
            </h2>
            <p className="text-muted-foreground text-sm sm:text-lg">
              See which team dominates the step leaderboard
            </p>
          </div>
          
          <div className="bg-card-80 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-electric/20 rounded-xl p-2">
                <TrendingUp className="w-5 h-5 text-electric" />
              </div>
              <span className="font-semibold text-foreground">Total Steps</span>
            </div>
            <StepCounter steps={totalCombinedSteps} label="Combined Total" variant="large" />
          </div>

          <div className="bg-gradient-to-br from-team-red-light/20 to-team-red/10 rounded-2xl p-6 border border-team-red/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-team-red/20 rounded-xl p-2">
                <Users className="w-5 h-5 text-team-red" />
              </div>
              <span className="font-semibold text-foreground">Fire Walkers</span>
            </div>
            <StepCounter steps={teamRed.totalSteps} label="Team Total" variant="team-red" />
          </div>

          <div className="bg-gradient-to-br from-team-blue-light/20 to-team-blue/10 rounded-2xl p-6 border border-team-blue/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-team-blue/20 rounded-xl p-2">
                <Users className="w-5 h-5 text-team-blue" />
              </div>
              <span className="font-semibold text-foreground">Storm Striders</span>
            </div>
            <StepCounter steps={teamBlue.totalSteps} label="Team Total" variant="team-blue" />
          </div>

          <div className="bg-card-80 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`rounded-xl p-2 ${redWinning ? 'bg-team-red/20' : 'bg-team-blue/20'}`}>
                <Activity className={`w-5 h-5 ${redWinning ? 'text-team-red' : 'text-team-blue'}`} />
              </div>
              <span className="font-semibold text-foreground">Leading By</span>
            </div>
            <StepCounter 
              steps={stepDifference} 
              label={`${redWinning ? 'Red Team' : 'Blue Team'} Ahead`} 
              variant={redWinning ? 'team-red' : 'team-blue'} 
            />
          </div>
        </section>

        {/* Battle Arena - Side by Side Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Live Team Battle */}
          <div className="bg-card-80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-border/50 relative overflow-hidden">
            {/* Epic background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-purple-900/5 to-blue-900/10 animate-pulse"></div>
            <div className="absolute top-4 right-4 opacity-10">
              <span className="text-6xl animate-spin">⚔️</span>
            </div>
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  ⚡ EPIC BATTLE ARENA ⚡
                </h2>
                <p className="text-muted-foreground text-base sm:text-lg">Total Steps Competition</p>
                <div className="flex justify-center space-x-1 mt-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping animate-delay-200"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping animate-delay-400"></div>
                </div>
              </div>
              
              <ProgressBar
                value1={teamRed.totalSteps}
                value2={teamBlue.totalSteps}
                label1="Fire Walkers"
                label2="Storm Striders"
                color1="red"
                color2="blue"
                animated={true}
              />
            </div>
          </div>

          {/* Daily Matchup */}
          <div>
            <DailyMatchup matchup={todaysMatchup} />
          </div>
        </section>

        <section>
          <Leaderboard teams={teams} />
        </section>

        {/* Footer */}
        <section className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-muted-foreground">
            <span className="text-2xl animate-sparkle">⚡</span>
            <span className="font-semibold">Epic battles powered by steps</span>
            <span className="text-2xl animate-sparkle">⚔️</span>
          </div>
        </section>
      </main>
    </div>
  );
}

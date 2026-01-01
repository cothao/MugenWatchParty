// Mock users for Team Red
const teamRedUsers = [
  {
    id: 'user1',
    name: 'Sarah Chen',
    avatar: 'SC',
    todaySteps: 12450,
    weeklySteps: 78300,
    totalSteps: 1250000,
    teamId: 'team-red'
  },
  {
    id: 'user2',
    name: 'Marcus Johnson',
    avatar: 'MJ',
    todaySteps: 9800,
    weeklySteps: 65200,
    totalSteps: 980000,
    teamId: 'team-red'
  },
  {
    id: 'user3',
    name: 'Emma Rodriguez',
    avatar: 'ER',
    todaySteps: 15200,
    weeklySteps: 89500,
    totalSteps: 1420000,
    teamId: 'team-red'
  },
  {
    id: 'user4',
    name: 'David Kim',
    avatar: 'DK',
    todaySteps: 7650,
    weeklySteps: 54800,
    totalSteps: 750000,
    teamId: 'team-red'
  }
];

// Mock users for Team Blue
const teamBlueUsers = [
  {
    id: 'user5',
    name: 'Alex Thompson',
    avatar: 'AT',
    todaySteps: 11200,
    weeklySteps: 72600,
    totalSteps: 1100000,
    teamId: 'team-blue'
  },
  {
    id: 'user6',
    name: 'Lisa Wang',
    avatar: 'LW',
    todaySteps: 13800,
    weeklySteps: 82400,
    totalSteps: 1350000,
    teamId: 'team-blue'
  },
  {
    id: 'user7',
    name: 'Jordan Miller',
    avatar: 'JM',
    todaySteps: 8900,
    weeklySteps: 61700,
    totalSteps: 890000,
    teamId: 'team-blue'
  },
  {
    id: 'user8',
    name: 'Priya Patel',
    avatar: 'PP',
    todaySteps: 16500,
    weeklySteps: 94200,
    totalSteps: 1580000,
    teamId: 'team-blue'
  }
];

// Calculate team totals
const teamRed = {
  id: 'team-red',
  name: 'Fire Walkers',
  color: 'red',
  users: teamRedUsers,
  todayTotalSteps: teamRedUsers.reduce((sum, user) => sum + user.todaySteps, 0),
  weeklyTotalSteps: teamRedUsers.reduce((sum, user) => sum + user.weeklySteps, 0),
  totalSteps: teamRedUsers.reduce((sum, user) => sum + user.totalSteps, 0)
};

const teamBlue = {
  id: 'team-blue',
  name: 'Storm Striders',
  color: 'blue',
  users: teamBlueUsers,
  todayTotalSteps: teamBlueUsers.reduce((sum, user) => sum + user.todaySteps, 0),
  weeklyTotalSteps: teamBlueUsers.reduce((sum, user) => sum + user.weeklySteps, 0),
  totalSteps: teamBlueUsers.reduce((sum, user) => sum + user.totalSteps, 0)
};

// Today's matchup
const todaysMatchup = {
  id: 'matchup-today',
  date: new Date().toISOString().split('T')[0],
  team1User: teamRedUsers[2], // Emma Rodriguez
  team2User: teamBlueUsers[3], // Priya Patel
  team1Steps: teamRedUsers[2].todaySteps,
  team2Steps: teamBlueUsers[3].todaySteps,
  winner: teamBlueUsers[3].id // Priya wins with 16,500 steps
};

// Previous matchups
const previousMatchups = [
  {
    id: 'matchup-yesterday',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    team1User: teamRedUsers[0],
    team2User: teamBlueUsers[1],
    team1Steps: 11800,
    team2Steps: 13200,
    winner: teamBlueUsers[1].id
  },
  {
    id: 'matchup-2days',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    team1User: teamRedUsers[1],
    team2User: teamBlueUsers[0],
    team1Steps: 14500,
    team2Steps: 12100,
    winner: teamRedUsers[1].id
  }
];

export const mockAppData = {
  teams: [teamRed, teamBlue],
  todaysMatchup,
  previousMatchups
};

// Helper function to format numbers with commas
export const formatNumber = (num) => {
  return num.toLocaleString();
};

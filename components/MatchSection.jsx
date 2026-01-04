import { useState } from 'react';
import MatchHistory from './MatchHistory';
import ChooseNextMatch from './ChooseNextMatch';
import { useCharacters } from "../hooks/useCharacters";

export default function MatchSection() {
  const [activeTab, setActiveTab] = useState('history');
  const { characters, loading, error } = useCharacters();

  if (loading) return <p>Loading fighters…</p>;
  if (error) return <p>Error loading fighters</p>;

  const tabs = [
    { id: 'history', label: 'Match History' },
    { id: 'choose', label: 'Choose Next Match' },
  ];

  return (
    <div className="mt-8 w-full">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-secondary/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'history' && <MatchHistory />}
          {activeTab === 'choose' && <ChooseNextMatch characters={characters} />}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

type WatchlistMenuProps = {
  ticker: string;
  watchlists: Record<string, any[]>;
  tickerWatchlists: Record<string, Set<string>>;
  onToggleWatchlist: (ticker: string, listName: string, isWatched: boolean) => void;
  onCreateWatchlist: (listName: string) => void;
  onClose: () => void;
};

export default function WatchlistMenu({
  ticker,
  watchlists,
  tickerWatchlists,
  onToggleWatchlist,
  onCreateWatchlist,
  onClose
}: WatchlistMenuProps) {
  const [newListName, setNewListName] = useState('');
  
  const currentSets = tickerWatchlists[ticker] || new Set();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      onCreateWatchlist(newListName.trim());
      setNewListName('');
    }
  };

  return (
    <div 
      className="watchlist-menu"
      style={{
        position: 'absolute',
        top: '100%',
        left: '0',
        marginTop: '4px',
        backgroundColor: '#18181b',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        padding: '12px',
        width: '220px',
        zIndex: 100,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        textAlign: 'left'
      }}
      onClick={e => e.stopPropagation()} // Prevent row click
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#a1a1aa' }}>Save {ticker.split('.')[0]} to...</h4>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: 0 }}>✕</button>
      </div>
      
      <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '12px', paddingRight: '4px' }}>
        {Object.keys(watchlists).map(listName => (
          <label key={listName} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 4px', cursor: 'pointer', fontSize: '0.85rem', color: '#d4d4d8', borderRadius: '4px', transition: 'background-color 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <input 
              type="checkbox" 
              checked={currentSets.has(listName)}
              onChange={(e) => onToggleWatchlist(ticker, listName, e.target.checked)}
              style={{ cursor: 'pointer', accentColor: '#3b82f6', width: '16px', height: '16px', margin: 0 }}
            />
            {listName}
          </label>
        ))}
      </div>
      
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '6px' }}>
        <input 
          type="text" 
          placeholder="New Watchlist..." 
          value={newListName}
          onChange={e => setNewListName(e.target.value)}
          style={{ 
            flex: 1, 
            padding: '6px 8px', 
            background: '#27272a', 
            border: '1px solid #3f3f46', 
            color: '#e4e4e7', 
            borderRadius: '4px',
            fontSize: '0.8rem',
            outline: 'none',
            minWidth: 0 // prevent overflow
          }}
          onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'}
          onBlur={e => e.currentTarget.style.borderColor = '#3f3f46'}
        />
        <button 
          type="submit" 
          style={{ 
            background: 'rgba(59, 130, 246, 0.15)', 
            color: '#60a5fa', 
            border: '1px solid #3b82f6', 
            borderRadius: '4px', 
            padding: '4px 10px', 
            fontSize: '0.8rem', 
            cursor: 'pointer',
            fontWeight: 500,
            outline: 'none',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.25)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)'}
        >
          Create
        </button>
      </form>
    </div>
  );
}

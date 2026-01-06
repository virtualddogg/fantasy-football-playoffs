import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './FantasyTracker.css';

function FantasyTracker() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT2biwi5r-R8M35Hq--8vNamdE91g9SzgnLZx02vTt3OVjK53endK3MSJzuIwACC_w-ok2UQYIupZj8/pub?gid=0&single=true&output=csv';
    
    Papa.parse(csvUrl, {
      download: true,
      header: false,
      complete: (results) => {
        const parsedTeams = parseTeams(results.data);
        console.log('Parsed Teams:', parsedTeams);
        setTeams(parsedTeams);
        setLoading(false);
      }
    });
  }, []);

  const parseTeams = (data) => {
    const teams = [];
    let i = 0;
    
    while (i < data.length) {
      // Look for team name (like "Bob", "Joe", etc - not position codes)
      if (i >= 5 && data[i][0] && data[i][0].trim() !== '' && 
          !['QB', 'RB', 'WR', 'DEF', 'K'].includes(data[i][0].trim()) &&
          !data[i][0].includes('Week Total') && 
          !data[i][0].includes('Grand Total')) {
        
        const teamName = data[i][0].trim();
        console.log('Found team:', teamName, 'at row', i);
        i++; // Skip to week headers row
        
        if (i >= data.length) break;
        i++; // Skip to first player row
        
        const players = [];
        const reserves = [];
        
        // Read all players
        while (i < data.length && data[i][0] && 
               ['QB', 'RB', 'WR', 'DEF', 'K'].includes(data[i][0].trim())) {
          
          const player = {
            position: data[i][0].trim(),
            name: data[i][1] || '',
            week1: data[i][2] || '0',
            week2: data[i][3] || '0',
            week3: data[i][4] || '0',
            week4: data[i][5] || '0'
          };
          players.push(player);
          
          // Check for reserve player
          if (data[i][6] && data[i][7]) {
            const reserve = {
              position: data[i][6].trim(),
              name: data[i][7] || '',
              week1: data[i][8] || '0',
              week2: data[i][9] || '0',
              week3: data[i][10] || '0',
              week4: data[i][11] || '0'
            };
            reserves.push(reserve);
          }
          
          i++;
        }
        
        // Skip empty row
        if (i < data.length && (!data[i][0] || data[i][0].trim() === '')) i++;
        
        let weekTotals = { week1: '0', week2: '0', week3: '0', week4: '0' };
        let grandTotal = '0';
        let reserveTiebreakerTotal = '0';
        
        // Week totals row
        if (i < data.length && data[i][0] && data[i][0].trim().includes('Week Total')) {
          console.log('Week Total row:', data[i]);
          weekTotals = {
            week1: data[i][2] || '0',
            week2: data[i][3] || '0',
            week3: data[i][4] || '0',
            week4: data[i][5] || '0'
          };
          
          if (data[i][7] && data[i][7].includes('TieBreaker')) {
            reserveTiebreakerTotal = data[i][8] || '0';
          }
          
          i++;
        }
        
        // Skip empty row
        if (i < data.length && (!data[i][0] || data[i][0].trim() === '')) i++;
        
        // Grand total row
        if (i < data.length && data[i][0] && data[i][0].trim().includes('Grand Total')) {
          console.log('Grand Total row:', data[i]);
          grandTotal = data[i][1] || '0';
          console.log('Setting grand total to:', grandTotal);
          i++;
        }
        
        teams.push({
          name: teamName,
          players: players,
          reserves: reserves,
          weekTotals: weekTotals,
          grandTotal: grandTotal,
          reserveTiebreakerTotal: reserveTiebreakerTotal
        });
        
        // Skip empty rows until next team
        while (i < data.length && (!data[i][0] || data[i][0].trim() === '')) {
          i++;
        }
      } else {
        i++;
      }
    }
    
    return teams;
  };

  if (loading) {
    return <div className="loading">Loading scores...</div>;
  }

  return (
    <div className="tracker-container">
      <h1>Fantasy Football Playoffs 2026</h1>
      
      <div className="teams-grid">
        {teams.map((team, index) => (
          <div key={index} className="team-card">
            <h2>{team.name}</h2>
            
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Player</th>
                  <th>W1</th>
                  <th>W2</th>
                  <th>W3</th>
                  <th>W4</th>
                </tr>
              </thead>
              <tbody>
                {team.players.map((player, pIndex) => (
                  <tr key={pIndex}>
                    <td className="position">{player.position}</td>
                    <td className="player-name">{player.name}</td>
                    <td>{player.week1}</td>
                    <td>{player.week2}</td>
                    <td>{player.week3}</td>
                    <td>{player.week4}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="totals-row">
                  <td colSpan="2"><strong>Week Totals</strong></td>
                  <td><strong>{team.weekTotals.week1}</strong></td>
                  <td><strong>{team.weekTotals.week2}</strong></td>
                  <td><strong>{team.weekTotals.week3}</strong></td>
                  <td><strong>{team.weekTotals.week4}</strong></td>
                </tr>
                <tr className="grand-total-row">
                  <td colSpan="5"><strong>Grand Total</strong></td>
                  <td><strong>{team.grandTotal}</strong></td>
                </tr>
              </tfoot>
            </table>
            
            {team.reserves.length > 0 && (
              <div className="reserves-section">
                <h3>Reserves (Tiebreaker: {team.reserveTiebreakerTotal})</h3>
                <table className="reserves-table">
                  <thead>
                    <tr>
                      <th>Pos</th>
                      <th>Player</th>
                      <th>W1</th>
                      <th>W2</th>
                      <th>W3</th>
                      <th>W4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.reserves.map((reserve, rIndex) => (
                      <tr key={rIndex}>
                        <td>{reserve.position}</td>
                        <td className="player-name">{reserve.name}</td>
                        <td>{reserve.week1}</td>
                        <td>{reserve.week2}</td>
                        <td>{reserve.week3}</td>
                        <td>{reserve.week4}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FantasyTracker;
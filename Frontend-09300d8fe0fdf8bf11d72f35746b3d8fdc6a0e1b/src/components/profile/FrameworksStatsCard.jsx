import React, { useEffect, useState } from 'react';
import { getUserFrameworks } from '../../apiEndpoints';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';

const COLORS = [
  'bg-indigo-500', 'bg-green-500', 'bg-yellow-400', 'bg-red-500',
  'bg-blue-500', 'bg-pink-500', 'bg-purple-500', 'bg-teal-500',
  'bg-pink-400', 'bg-amber-500', 'bg-sky-500', 'bg-violet-400'
];

const FrameworksStatsCard = () => {
  const { username } = useParams();
  const [frameworks, setFrameworks] = useState([]);

  useEffect(() => {
    async function load() {
      if (!username) return;
      const data = await getUserFrameworks(username);
      console.log(data);
      if (data?.error) {
        console.log(data.error);

      } else {
        if (data && typeof data === 'object') {
          const arr = Object.entries(data)
            .map(([name, val]) => ({ name, value: val }))
            .sort((a, b) => b.value - a.value); // ← sort descending
          setFrameworks(arr);
        }
      }
    }
    load();
  }, [username]);

  const total = frameworks.reduce((sum, f) => sum + f.value, 0) || 1;

  if (!frameworks.length) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center h-full flex flex-col justify-center items-center">
        <h3 className="text-xl font-display font-bold text-white mb-2">
          Frameworks
        </h3>
        <p className="text-slate-400 text-sm">
          No frameworks detected in top repositories.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 h-full my-20">
      <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-fuchsia-500 to-pink-500 rounded-full"></span>
        Frameworks
      </h3>

      {/* Stacked Bar */}
      <div className="flex h-3 w-full rounded-full overflow-hidden mb-8 bg-surface/50 border border-white/5">
        {frameworks.map((fw, i) => (
          <div
            key={fw.name}
            className={`${COLORS[i % COLORS.length]} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
            style={{ flex: fw.value }}
            title={`${fw.name}: ${((fw.value / total) * 100).toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {frameworks.length > 0 && frameworks.map((fw, i) => {
          const pct = ((fw.value / total) * 100).toFixed(1);
          return (
            <div
              key={fw.name}
              className="flex items-center justify-between text-slate-400 text-sm border-b border-white/5 pb-2 last:border-0"
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full shadow-lg shadow-white/10 ${COLORS[i % COLORS.length]}`}
                />
                <span className="font-medium">{fw.name}</span>
              </div>
              <span className="font-semibold text-slate-200">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FrameworksStatsCard;

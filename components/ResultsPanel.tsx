
import React, { useState } from 'react';
import { SimulationResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import CodeViewer from './CodeViewer';

interface ResultsPanelProps {
  result: SimulationResult | null;
  loading: boolean;
  estimatedTime: string;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, loading, estimatedTime }) => {
  const [showCode, setShowCode] = useState(false);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-cyan-400 animate-pulse p-6 text-center">
        <i className="fas fa-atom fa-spin text-5xl mb-6"></i>
        <h3 className="text-xl font-bold mb-2">Simulating Quantum State...</h3>
        <p className="font-mono text-sm text-slate-400">Running Python 3.14 (Free-Threaded Mode)</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
           <i className="fas fa-brain animate-pulse"></i>
           <span>Reasoning about complex amplitudes...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center border border-dashed border-slate-800 rounded-lg">
        <i className="fas fa-chart-bar text-4xl mb-4 text-slate-700"></i>
        <p className="font-bold text-lg text-slate-400">Ready to Simulate</p>
        <p className="text-sm mb-6 max-w-xs">Build your circuit on the left, then click "Run Simulation" to see how the qubits behave.</p>
        <div className="bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
           <span className="text-xs font-mono text-cyan-400">Estimated Compute Time: ~{estimatedTime}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar relative">
      
      {/* Educational Header for Results */}
      <div className="bg-gradient-to-r from-purple-900/20 to-slate-800 p-4 rounded border-l-4 border-purple-500 flex justify-between items-start">
        <div>
          <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
            <i className="fas fa-check-circle text-green-400"></i> Simulation Complete
          </h3>
          <p className="text-xs text-slate-400">
            This result shows the final state of your quantum system. In quantum mechanics, we don't know the answer until we measure it.
          </p>
        </div>
        <button 
          onClick={() => setShowCode(true)}
          className="ml-2 px-3 py-1 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded text-[10px] font-mono text-cyan-300 transition-colors whitespace-nowrap"
          title="View the Python 3.14 code that generated this result"
        >
          <i className="fab fa-python mr-1"></i> View Code
        </button>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 p-3 rounded border border-slate-700">
          <p className="text-xs text-slate-400 uppercase">Actual Execution Time</p>
          <p className="text-xl font-mono text-green-400">{result.executionTime}</p>
        </div>
        <div className="bg-slate-800 p-3 rounded border border-slate-700">
          <p className="text-xs text-slate-400 uppercase">System Fidelity</p>
          <p className="text-xl font-mono text-purple-400">{result.fidelity.toFixed(8)}</p>
        </div>
      </div>

      {/* Probability Chart */}
      <div className="bg-slate-800 p-4 rounded border border-slate-700 h-64 flex flex-col">
        <div className="flex justify-between items-start mb-2">
           <h4 className="text-xs text-slate-400 uppercase">Measurement Probabilities</h4>
           <div className="text-[10px] text-slate-500 italic">Tall bars = High chance of being measured</div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={result.probabilities} margin={{top: 5, right: 5, left: -20, bottom: 0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="state" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dy={5} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 1]} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', fontSize: '12px' }}
                itemStyle={{ color: '#22d3ee' }}
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Probability']}
              />
              <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                {result.probabilities.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.probability > 0.01 ? '#22d3ee' : '#475569'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* State Vector Table */}
      <div className="bg-slate-800 p-4 rounded border border-slate-700">
         <div className="flex justify-between items-center mb-2">
           <h4 className="text-xs text-slate-400 uppercase">State Vector Details</h4>
           <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">Mathematical Complex Amplitudes</span>
         </div>
         <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
           <table className="w-full text-left border-collapse">
             <thead className="text-xs text-slate-500 border-b border-slate-700 sticky top-0 bg-slate-800">
               <tr>
                 <th className="pb-2 pt-1 pl-2">Basis State</th>
                 <th className="pb-2 pt-1">Real Part</th>
                 <th className="pb-2 pt-1">Imaginary Part</th>
               </tr>
             </thead>
             <tbody className="font-mono text-xs">
               {result.stateVector.map((sv, idx) => (
                 <tr key={idx} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30">
                   <td className="py-2 pl-2 text-purple-300 font-bold">{sv.label}</td>
                   <td className="py-2 text-slate-300">{sv.real.toFixed(4)}</td>
                   <td className="py-2 text-slate-400">{sv.imag >= 0 ? '+' : ''}{sv.imag.toFixed(4)}i</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      {/* Code Modal */}
      {showCode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 lg:p-8 animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-4xl h-[80vh] rounded-lg border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
             <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                <div>
                  <h3 className="text-white font-bold text-lg">Python 3.14 Kernel Source</h3>
                  <p className="text-xs text-slate-400">Generated specifically for this circuit execution</p>
                </div>
                <button 
                  onClick={() => setShowCode(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
             </div>
             <div className="flex-1 overflow-hidden p-0">
               <CodeViewer code={result.pythonCode} />
             </div>
             <div className="bg-slate-800 px-6 py-3 border-t border-slate-700 flex justify-end">
                <button 
                   onClick={() => {
                     navigator.clipboard.writeText(result.pythonCode);
                     // Could add toast here
                   }}
                   className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
                >
                   <i className="fas fa-copy"></i> Copy to Clipboard
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;

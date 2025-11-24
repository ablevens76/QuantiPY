
import React, { useState, useEffect } from 'react';
import { CircuitState, GateType, SimulationResult } from './types';
import { INITIAL_CIRCUIT } from './constants';
import GateSelector from './components/GateSelector';
import CircuitGrid from './components/CircuitGrid';
import ResultsPanel from './components/ResultsPanel';
import ChatPanel from './components/ChatPanel';
import { simulateCircuitWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [circuit, setCircuit] = useState<CircuitState>(INITIAL_CIRCUIT);
  const [selectedGate, setSelectedGate] = useState<GateType | null>(GateType.H);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<string>("0.00s");

  // Recalculate estimate whenever circuit changes
  useEffect(() => {
    // Fake formula: Base overhead + time per gate * factor
    const gateCount = circuit.gates.length;
    const time = (0.015 + (gateCount * 0.0042)).toFixed(4);
    setEstimatedTime(`${time}s`);
  }, [circuit]);

  const addGate = (qubit: number, step: number, type: GateType) => {
    let controlQubit = undefined;
    if (type === GateType.CX) {
        controlQubit = qubit > 0 ? qubit - 1 : qubit + 1;
        if (controlQubit >= circuit.numQubits) controlQubit = undefined;
    }

    const newGate = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      targetQubit: qubit,
      controlQubit,
      step
    };

    setCircuit(prev => ({
      ...prev,
      gates: [...prev.gates.filter(g => !(g.targetQubit === qubit && g.step === step)), newGate]
    }));
  };

  const removeGate = (gateId: string) => {
    setCircuit(prev => ({
      ...prev,
      gates: prev.gates.filter(g => g.id !== gateId)
    }));
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await simulateCircuitWithGemini(circuit);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial simulation on mount
  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center px-6 justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-900/20">
            <i className="fas fa-atom text-lg"></i>
          </div>
          <div>
             <h1 className="text-xl font-bold tracking-tight text-slate-100 leading-none">
              QuantumPy <span className="text-cyan-400">3.14</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-wide uppercase">Educational Simulator</p>
          </div>
        </div>
        <div className="flex gap-6 text-sm text-slate-400 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
             <span className="font-mono text-xs text-green-400">Free-Threading Active</span>
           </div>
           <div className="w-px h-4 bg-slate-700"></div>
           <div className="flex items-center gap-2">
             <i className="fab fa-python text-yellow-500"></i>
             <span className="font-mono text-xs">Python 3.14.0a4</span>
           </div>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden max-w-[1920px] mx-auto w-full h-[calc(100vh-4rem)]">
        
        {/* Left Column: Circuit Builder (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4 h-full overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex justify-between items-end shrink-0">
            <div>
               <h2 className="text-2xl font-bold text-slate-100">Circuit Designer</h2>
               <p className="text-slate-400 text-sm">Design your quantum algorithm below.</p>
            </div>
            <button 
               onClick={() => setCircuit({...circuit, gates: []})}
               className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/50 rounded transition-all"
             >
               <i className="fas fa-trash-alt mr-2"></i>Reset Circuit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-[500px]">
             {/* Gate Selection */}
             <div className="md:col-span-4 lg:col-span-3 h-full">
                <GateSelector selectedGate={selectedGate} onSelectGate={setSelectedGate} />
             </div>
             
             {/* Grid */}
             <div className="md:col-span-8 lg:col-span-9 flex flex-col gap-4 h-full">
                <div className="flex-1">
                  <CircuitGrid 
                      circuit={circuit}
                      selectedGateType={selectedGate}
                      onAddGate={addGate}
                      onRemoveGate={removeGate}
                  />
                </div>
                
                {/* Action Bar */}
                <div className="flex justify-end items-center gap-4 bg-slate-900 p-4 rounded-lg border border-slate-800 shrink-0">
                   <div className="text-right mr-4">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Estimated Cost</p>
                      <p className="font-mono text-cyan-400">{estimatedTime}</p>
                   </div>
                   <button 
                    onClick={runSimulation}
                    disabled={loading}
                    className={`
                      px-8 py-4 rounded-lg font-bold text-white shadow-xl flex items-center gap-3 transition-all transform
                      ${loading 
                        ? 'bg-slate-700 cursor-not-allowed opacity-50 grayscale' 
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/40 hover:scale-[1.02] hover:shadow-cyan-900/60'}
                    `}
                  >
                    {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-play"></i>}
                    <span>Run Simulation</span>
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Results & Chat (5 cols) - Split Vertically */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full gap-4">
          
          {/* Top Half: Results (55%) */}
          <div className="flex-[5.5] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col min-h-0">
            <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
               <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                 <i className="fas fa-chart-line text-cyan-500"></i> Simulation Results
               </h3>
               {result && <span className="text-[10px] bg-green-900/50 text-green-400 px-2 py-0.5 rounded border border-green-800">Success</span>}
            </div>
            <div className="flex-1 overflow-hidden relative">
               <ResultsPanel result={result} loading={loading} estimatedTime={estimatedTime} />
            </div>
          </div>

          {/* Bottom Half: Chat (45%) */}
          <div className="flex-[4.5] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col min-h-0">
             <ChatPanel circuit={circuit} result={result} />
          </div>

        </div>

      </main>
    </div>
  );
};

export default App;

import React from 'react';
import { CircuitState, GateType } from '../types';

interface CircuitGridProps {
  circuit: CircuitState;
  selectedGateType: GateType | null;
  onAddGate: (qubit: number, step: number, type: GateType) => void;
  onRemoveGate: (gateId: string) => void;
}

const CircuitGrid: React.FC<CircuitGridProps> = ({ circuit, selectedGateType, onAddGate, onRemoveGate }) => {
  
  const handleGridClick = (qubitIdx: number, stepIdx: number) => {
    const existingGate = circuit.gates.find(g => g.targetQubit === qubitIdx && g.step === stepIdx);
    
    if (existingGate) {
      onRemoveGate(existingGate.id);
    } else if (selectedGateType) {
      onAddGate(qubitIdx, stepIdx, selectedGateType);
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 shadow-inner relative flex flex-col h-full">
       <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
         <i className="fas fa-microchip"></i> 2. Build Circuit
       </h3>

       {/* Educational Header */}
       <div className="bg-blue-900/20 border border-blue-800/50 rounded p-3 mb-6 flex gap-3 text-xs text-blue-200">
         <i className="fas fa-lightbulb text-yellow-400 text-base mt-0.5"></i>
         <div className="space-y-1">
           <p><strong className="text-blue-100">The Lines (Qubits):</strong> Each horizontal line represents a single Quantum Bit (Qubit) existing over time.</p>
           <p><strong className="text-blue-100">Left to Right:</strong> This is the timeline. Gates placed on the left happen first.</p>
           <p><strong className="text-blue-100">The Grid:</strong> Click any intersection to apply the selected gate to that qubit at that specific moment.</p>
         </div>
       </div>
       
       <div className="overflow-x-auto flex-1 pb-4">
         <div className="min-w-[600px] flex flex-col gap-6">
           {Array.from({ length: circuit.numQubits }).map((_, qubitIdx) => (
             <div key={`qubit-row-${qubitIdx}`} className="flex items-center relative h-12 group">
               {/* Qubit Label */}
               <div className="w-24 flex-shrink-0 text-slate-400 font-mono text-sm border-r border-slate-700 pr-4 flex flex-col items-end justify-center">
                 <span className="text-slate-200 font-bold">Qubit {qubitIdx}</span>
                 <span className="text-[10px] text-slate-500">|0⟩ initial</span>
               </div>

               {/* Wire Line */}
               <div className="absolute left-24 right-0 h-px bg-slate-600 top-1/2 z-0 group-hover:bg-slate-500 transition-colors"></div>

               {/* Grid Slots */}
               <div className="flex-1 flex justify-around pl-4 relative z-10">
                 {Array.from({ length: circuit.steps }).map((_, stepIdx) => {
                   const gate = circuit.gates.find(g => g.targetQubit === qubitIdx && g.step === stepIdx);
                   const controlledGate = circuit.gates.find(g => g.controlQubit === qubitIdx && g.step === stepIdx);

                   return (
                     <button
                       key={`${qubitIdx}-${stepIdx}`}
                       onClick={() => handleGridClick(qubitIdx, stepIdx)}
                       title={gate ? `Remove ${gate.type}` : `Place ${selectedGateType} at Step ${stepIdx + 1}`}
                       className={`
                         w-10 h-10 flex items-center justify-center rounded transition-all duration-200
                         ${gate 
                           ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 hover:bg-red-500 font-bold z-20 scale-100' 
                           : 'bg-transparent hover:bg-slate-700/80 rounded-full border-2 border-transparent hover:border-slate-500 scale-75 hover:scale-100'}
                         ${controlledGate ? 'bg-slate-900 border-2 border-purple-500 z-20' : ''}
                       `}
                     >
                       {gate && gate.type}
                       {controlledGate && <div className="w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>}
                     </button>
                   );
                 })}
               </div>
             </div>
           ))}
         </div>

         {/* Control Lines Rendering Overlay */}
         <svg className="absolute top-[120px] left-0 w-full h-full pointer-events-none z-0 opacity-50">
            {/* Visual placeholder for control lines - in a real app this requires exact coordinate math */}
         </svg>
      </div>
    </div>
  );
};

export default CircuitGrid;
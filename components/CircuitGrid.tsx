import React, { useMemo } from 'react';
import { CircuitState, GateType, Preset } from '../types';

interface CircuitGridProps {
  circuit: CircuitState;
  selectedGateType: GateType | null;
  activeStep: number; // -1 for idle, 0..N for running
  onAddGate: (qubit: number, step: number, type: GateType) => void;
  onRemoveGate: (gateId: string) => void;
  presets?: Preset[];
  onLoadPreset?: (preset: Preset) => void;
}

const CELL_WIDTH = 64; // w-16
const CELL_HEIGHT = 80; // h-20
const TOP_OFFSET = 24; // Center of first row

const CircuitGrid: React.FC<CircuitGridProps> = ({ 
  circuit, 
  selectedGateType, 
  activeStep, 
  onAddGate, 
  onRemoveGate,
  presets = [],
  onLoadPreset
}) => {
  
  const handleGridClick = (qubitIdx: number, stepIdx: number) => {
    if (activeStep !== -1) return; // Disable editing while running

    const existingGate = circuit.gates.find(g => g.targetQubit === qubitIdx && g.step === stepIdx);
    
    if (existingGate) {
      onRemoveGate(existingGate.id);
    } else if (selectedGateType) {
      onAddGate(qubitIdx, stepIdx, selectedGateType);
    }
  };

  // Calculate SVG lines for CNOT gates
  const controlLines = useMemo(() => {
    const lines: React.ReactElement[] = [];
    
    circuit.gates.forEach(gate => {
      if (gate.type === GateType.CX && gate.controlQubit !== undefined) {
        const x = (gate.step * CELL_WIDTH) + (CELL_WIDTH / 2);
        const y1 = (gate.targetQubit * CELL_HEIGHT) + (CELL_HEIGHT / 2);
        const y2 = (gate.controlQubit * CELL_HEIGHT) + (CELL_HEIGHT / 2);
        
        lines.push(
          <g key={gate.id}>
             {/* The vertical control line */}
             <line 
               x1={x} y1={y1} x2={x} y2={y2} 
               stroke={activeStep === gate.step ? "#22d3ee" : "#64748b"} 
               strokeWidth="2" 
               className="transition-colors duration-300"
             />
             {/* The Control Dot */}
             <circle 
                cx={x} cy={y2} r="6" 
                fill={activeStep === gate.step ? "#22d3ee" : "#0f172a"} 
                stroke={activeStep === gate.step ? "#22d3ee" : "#64748b"} 
                strokeWidth="2" 
             />
          </g>
        );
      }
    });
    return lines;
  }, [circuit.gates, activeStep]);

  // Helper to guess visual state for education (Very basic heuristic)
  const getQubitStateLabel = (qubitIdx: number, currentStep: number) => {
    if (currentStep <= 0) return "|0⟩";
    
    // Find last gate applied to this qubit before current step
    const relevantGates = circuit.gates
        .filter(g => g.targetQubit === qubitIdx && g.step < currentStep)
        .sort((a, b) => b.step - a.step);

    if (relevantGates.length === 0) return "|0⟩";
    
    const lastGate = relevantGates[0];
    switch (lastGate.type) {
        case GateType.H: return "|+⟩";
        case GateType.X: return "|1⟩";
        case GateType.M: return "0/1";
        case GateType.CX: return "Ent";
        default: return "?";
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 shadow-inner relative flex flex-col h-full overflow-hidden select-none">
       {/* Header with Presets */}
       <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-2">
         <div className="flex items-center gap-4">
            <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-microchip"></i> 2. Circuit Board
            </h3>
            
            {/* Presets Toolbar */}
            {presets && presets.length > 0 && onLoadPreset && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700/50">
                 <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Try Famous Algo:</span>
                 {presets.map(p => (
                   <button
                     key={p.name}
                     onClick={() => activeStep === -1 && onLoadPreset(p)}
                     disabled={activeStep !== -1}
                     className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-400 rounded transition-colors disabled:opacity-50 whitespace-nowrap"
                     title={p.description}
                   >
                     {p.name}
                   </button>
                 ))}
              </div>
            )}
         </div>

         <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600"></span> Empty</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-600"></span> Gate</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_cyan]"></span> Active</div>
         </div>
       </div>

       {/* Educational Box */}
       {activeStep === -1 && (
         <div className="bg-blue-900/20 border border-blue-800/50 rounded p-3 mb-6 flex gap-3 text-xs text-blue-200 animate-in fade-in slide-in-from-top-2">
           <i className="fas fa-lightbulb text-yellow-400 text-base mt-0.5"></i>
           <div className="space-y-1">
             <p><strong className="text-blue-100">How to use:</strong> Select a gate from the left, then click on the wires below to place it.</p>
             <p>The signal flows from <strong className="text-white">Left → Right</strong>. Gates change the Qubit's state as it passes through.</p>
           </div>
         </div>
       )}

       {/* The Grid Container */}
       <div className="flex-1 overflow-x-auto overflow-y-auto relative custom-scrollbar">
         <div className="relative min-w-[600px] pb-12" style={{ height: circuit.numQubits * CELL_HEIGHT }}>
           
           {/* 1. Background Grid & Scanline */}
           <div className="absolute inset-0 pointer-events-none">
              {/* Scanline Effect */}
              {activeStep >= 0 && activeStep < circuit.steps && (
                  <div 
                    className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-cyan-500/10 to-cyan-500/30 border-r border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-300 z-0"
                    style={{ left: (activeStep * CELL_WIDTH) + 84 }} // 84 = 24 (padding) + 60 (label width)
                  >
                     <div className="absolute top-0 left-0 text-[10px] bg-cyan-500 text-black font-bold px-1">STEP {activeStep + 1}</div>
                  </div>
              )}
           </div>

           {/* 2. SVG Connections Layer (Wires & Control Lines) */}
           <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
              {/* Horizontal Qubit Wires */}
              {Array.from({ length: circuit.numQubits }).map((_, i) => (
                  <line 
                    key={`wire-${i}`}
                    x1="80" 
                    y1={(i * CELL_HEIGHT) + (CELL_HEIGHT / 2)} 
                    x2={80 + (circuit.steps * CELL_WIDTH)} 
                    y2={(i * CELL_HEIGHT) + (CELL_HEIGHT / 2)} 
                    stroke="#334155" 
                    strokeWidth="2" 
                  />
              ))}
              {/* Dynamic Control Lines */}
              {controlLines}
           </svg>

           {/* 3. Interactive Layer (Gates & Buttons) */}
           <div className="absolute top-0 left-0 w-full h-full z-20 pl-2">
              {Array.from({ length: circuit.numQubits }).map((_, qubitIdx) => (
                <div key={`row-${qubitIdx}`} className="flex items-center" style={{ height: CELL_HEIGHT }}>
                  
                  {/* Qubit Label */}
                  <div className="w-20 shrink-0 text-right pr-4 flex flex-col justify-center">
                    <span className={`font-mono font-bold text-sm ${activeStep !== -1 ? 'text-cyan-400 text-shadow-glow' : 'text-slate-200'}`}>Q{qubitIdx}</span>
                    <span className="text-[10px] text-slate-500">{activeStep === -1 ? '|0⟩' : getQubitStateLabel(qubitIdx, activeStep)}</span>
                  </div>

                  {/* Gate Slots */}
                  {Array.from({ length: circuit.steps }).map((_, stepIdx) => {
                    const gate = circuit.gates.find(g => g.targetQubit === qubitIdx && g.step === stepIdx);
                    const isControlled = circuit.gates.some(g => g.controlQubit === qubitIdx && g.step === stepIdx);
                    const isActive = activeStep === stepIdx;

                    return (
                      <div 
                        key={`cell-${qubitIdx}-${stepIdx}`} 
                        className="relative flex items-center justify-center"
                        style={{ width: CELL_WIDTH, height: CELL_HEIGHT }}
                      >
                         {/* The Interactive Button */}
                         <button
                           onClick={() => handleGridClick(qubitIdx, stepIdx)}
                           disabled={activeStep !== -1}
                           className={`
                             w-10 h-10 rounded transition-all duration-200 flex items-center justify-center z-30
                             ${gate 
                               ? 'bg-purple-600 text-white shadow-lg font-bold border border-purple-400' 
                               : 'bg-transparent hover:bg-slate-700/50 rounded-full'}
                             ${isActive && gate ? 'ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] scale-110' : ''}
                             ${isActive && !gate ? 'bg-cyan-500/10' : ''}
                             ${isControlled ? 'z-40' : ''}
                           `}
                         >
                           {/* Render Gate Content */}
                           {gate && (
                             <span className="text-sm">
                               {gate.type === GateType.CX ? <i className="fas fa-plus-circle text-lg"></i> : gate.type}
                             </span>
                           )}
                           
                           {/* Ghost Hover Effect (if placing) */}
                           {!gate && !isControlled && activeStep === -1 && selectedGateType && (
                             <div className="absolute opacity-0 hover:opacity-40 w-10 h-10 bg-slate-500 rounded border border-dashed border-slate-300 flex items-center justify-center">
                               <span className="text-xs text-white">{selectedGateType}</span>
                             </div>
                           )}
                         </button>
                      </div>
                    );
                  })}
                </div>
              ))}
           </div>

         </div>
       </div>
    </div>
  );
};

export default CircuitGrid;
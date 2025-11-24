import React from 'react';
import { GateType } from '../types';
import { GATE_DESCRIPTIONS } from '../constants';

interface GateSelectorProps {
  selectedGate: GateType | null;
  onSelectGate: (gate: GateType) => void;
}

const GATE_NAMES: Record<GateType, string> = {
  [GateType.H]: "Hadamard",
  [GateType.X]: "Pauli-X",
  [GateType.Y]: "Pauli-Y",
  [GateType.Z]: "Pauli-Z",
  [GateType.CX]: "CNOT",
  [GateType.M]: "Measure"
};

const GateSelector: React.FC<GateSelectorProps> = ({ selectedGate, onSelectGate }) => {
  return (
    <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-xl flex flex-col h-full">
      <h3 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
        <i className="fas fa-toolbox"></i> 1. Select a Gate
      </h3>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        {Object.keys(GATE_DESCRIPTIONS).map((key) => {
          const type = key as GateType;
          const isSelected = selectedGate === type;
          
          return (
            <button
              key={type}
              onClick={() => onSelectGate(type)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 group
                ${isSelected 
                  ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                  : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700 hover:border-slate-500 hover:text-slate-200'}
              `}
            >
              <span className={`text-xl font-mono font-bold mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                {type}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wide opacity-80">
                {GATE_NAMES[type]}
              </span>
            </button>
          );
        })}
      </div>
      
      <div className="mt-auto bg-slate-900/80 p-4 rounded border border-slate-700/50 min-h-[80px]">
        <div className="flex items-start gap-3">
          <i className="fas fa-info-circle text-cyan-500 mt-1"></i>
          <div>
            <p className="text-xs font-bold text-slate-300 mb-1">
              {selectedGate ? `Effect of ${GATE_NAMES[selectedGate]}` : "Select a gate"}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {selectedGate ? GATE_DESCRIPTIONS[selectedGate] : "Click a button above to see what each quantum logic gate does to a qubit."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GateSelector;
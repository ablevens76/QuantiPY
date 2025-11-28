export enum GateType {
  H = 'H',
  X = 'X',
  Y = 'Y',
  Z = 'Z',
  CX = 'CX',
  M = 'M' // Measure
}

export interface Gate {
  id: string;
  type: GateType;
  targetQubit: number;
  controlQubit?: number;
  step: number; // Time step in the circuit
}

export interface CircuitState {
  numQubits: number;
  steps: number;
  gates: Gate[];
}

export interface SimulationResult {
  stateVector: { real: number; imag: number; label: string }[];
  probabilities: { state: string; probability: number }[];
  pythonCode: string; // The generated Python 3.14 code
  executionTime: string;
  fidelity: number;
}

export interface SimulationRequest {
  circuit: CircuitState;
}

export interface Preset {
  name: string;
  description: string;
  circuit: CircuitState;
}
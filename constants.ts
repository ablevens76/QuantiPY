import { GateType, Preset } from './types';

export const MAX_QUBITS = 5;
export const MAX_STEPS = 8;

export const GATE_DESCRIPTIONS: Record<GateType, string> = {
  [GateType.H]: "Hadamard (Superposition): Puts a definite state (0 or 1) into a 50/50 probability mix of both.",
  [GateType.X]: "Pauli-X (NOT): Flips the bit. Turns 0 to 1, and 1 to 0.",
  [GateType.Y]: "Pauli-Y: Combines a bit flip and a phase rotation. Useful for complex quantum rotations.",
  [GateType.Z]: "Pauli-Z (Phase Flip): Leaves '0' alone but flips the phase of '1'. Crucial for interference.",
  [GateType.CX]: "CNOT (Entangle): Conditional logic. If the Control dot is active (1), it flips the Target bit.",
  [GateType.M]: "Measure: The act of observation. Collapses the delicate quantum state into a classic 0 or 1.",
};

export const INITIAL_CIRCUIT = {
  numQubits: 3,
  steps: 6,
  gates: [
    { id: '1', type: GateType.H, targetQubit: 0, step: 0 },
    { id: '2', type: GateType.CX, targetQubit: 1, controlQubit: 0, step: 1 },
    { id: '3', type: GateType.CX, targetQubit: 2, controlQubit: 0, step: 2 },
  ]
};

export const PRESETS: Preset[] = [
  {
    name: "Bell State",
    description: "The simplest example of Quantum Entanglement. Two qubits become inextricably linked.",
    circuit: {
      numQubits: 2,
      steps: 4,
      gates: [
        { id: 'p1', type: GateType.H, targetQubit: 0, step: 0 },
        { id: 'p2', type: GateType.CX, targetQubit: 1, controlQubit: 0, step: 1 },
        { id: 'p3', type: GateType.M, targetQubit: 0, step: 2 },
        { id: 'p4', type: GateType.M, targetQubit: 1, step: 2 },
      ]
    }
  },
  {
    name: "GHZ State",
    description: "Greenberger–Horne–Zeilinger state. Maximal entanglement across three qubits.",
    circuit: {
      numQubits: 3,
      steps: 5,
      gates: [
        { id: 'g1', type: GateType.H, targetQubit: 0, step: 0 },
        { id: 'g2', type: GateType.CX, targetQubit: 1, controlQubit: 0, step: 1 },
        { id: 'g3', type: GateType.CX, targetQubit: 2, controlQubit: 1, step: 2 },
        { id: 'g4', type: GateType.M, targetQubit: 0, step: 3 },
        { id: 'g5', type: GateType.M, targetQubit: 1, step: 3 },
        { id: 'g6', type: GateType.M, targetQubit: 2, step: 3 },
      ]
    }
  },
  {
    name: "Superposition Swarm",
    description: "Puts every qubit into superposition, creating a uniform probability distribution.",
    circuit: {
      numQubits: 4,
      steps: 4,
      gates: [
        { id: 's1', type: GateType.H, targetQubit: 0, step: 0 },
        { id: 's2', type: GateType.H, targetQubit: 1, step: 0 },
        { id: 's3', type: GateType.H, targetQubit: 2, step: 0 },
        { id: 's4', type: GateType.H, targetQubit: 3, step: 0 },
        { id: 's5', type: GateType.Z, targetQubit: 0, step: 1 },
        { id: 's6', type: GateType.Z, targetQubit: 2, step: 1 },
      ]
    }
  }
];
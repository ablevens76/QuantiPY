import { GateType } from './types';

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
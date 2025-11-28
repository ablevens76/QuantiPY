
import { GoogleGenAI, Type } from "@google/genai";
import { CircuitState, SimulationResult, GateType } from "../types";

const SIMULATOR_PERSONA = `
You are an advanced Quantum Circuit Simulator engine running on Python 3.14.
Your code base uses:
- Free-threaded mode (PEP 703) for parallelism.
- Slotted dataclasses for memory optimization.
- Union types (PEP 604) like 'Complex = complex | float | int'.
- Self type (PEP 673) for method chaining.
- Matrix operations via '@' operator.

User will provide a circuit definition. You must:
1. "Execute" this circuit mathematically to find the final State Vector and Measurement Probabilities.
2. Generate the exact Python 3.14 code that would represent this circuit using the architecture described.
`;

const TUTOR_PERSONA = `
You are a friendly, expert Quantum Physics Tutor who is also knowledgeable about Alternative Computing Architectures (like Optical and Ternary Computing).

Your goal is to help students learn using "QuantumPy 3.14".

**Key Concepts to Bridge:**
- **Interference:** Explain that just like sound and light waves in an Optical Computer can interfere constructively or destructively, Quantum States have "Phase" that causes interference.
- **Qubits vs Trits:** If asked, explain that this simulator uses Qubits (Base-2: |0>, |1> and superposition), whereas Optical systems often use Trits (Base-3: -1, 0, +1).
- **The "Wobble":** If the user asks about "wobble" or imperfections, relate it to Quantum Noise or Phase Errors.

**Guidelines:**
- Explain concepts simply.
- Interpret results clearly (e.g. "The 50/50 split means the qubit is in a perfect superposition").
- Keep answers concise and helpful.
- Reference the user's specific circuit design when explaining.
- You have access to Google Search for real-world verification.
`;

export const simulateCircuitWithGemini = async (circuit: CircuitState): Promise<SimulationResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  const circuitDescription = JSON.stringify(circuit, null, 2);

  const prompt = `
    ${SIMULATOR_PERSONA}

    Here is the circuit configuration:
    ${circuitDescription}

    Please perform the simulation and return the results in JSON format.
    
    For the 'pythonCode', generate the full Python script (including imports from 'quantum_simulator') that constructs and runs this specific circuit. Ensure the code demonstrates the advanced features (Context managers, Async, Types).
    
    For 'stateVector', provide the complex amplitudes for all 2^n basis states (e.g., |000>, |001>...).
    For 'probabilities', provide the squared magnitude of amplitudes for each basis state.
    Calculated 'fidelity' should be 1.0 for this ideal simulation.
    'executionTime' should be a realistic string simulating high-performance (e.g., "0.0042s").
  `;

  // Define the schema for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      stateVector: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            real: { type: Type.NUMBER },
            imag: { type: Type.NUMBER },
            label: { type: Type.STRING, description: "e.g. |00> or |101>" }
          }
        }
      },
      probabilities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            state: { type: Type.STRING },
            probability: { type: Type.NUMBER }
          }
        }
      },
      pythonCode: { type: Type.STRING },
      executionTime: { type: Type.STRING },
      fidelity: { type: Type.NUMBER }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 32768 } // Use max thinking budget for complex math
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as SimulationResult;
  } catch (error) {
    console.error("Simulation failed", error);
    // Fallback mock data in case of API failure to prevent app crash
    return {
      stateVector: [],
      probabilities: [],
      pythonCode: "# Error connecting to Quantum Engine via Gemini.\n# Please check API Key.",
      executionTime: "ERR",
      fidelity: 0
    };
  }
};

export const getChatResponse = async (
  currentMessage: string, 
  history: { role: 'user' | 'model', text: string }[], 
  circuit: CircuitState, 
  result: SimulationResult | null
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Error: API Key missing.";

  const ai = new GoogleGenAI({ apiKey });

  // Construct context string
  const context = `
    [CURRENT APP STATE]
    Circuit Gates: ${JSON.stringify(circuit.gates.map(g => `${g.type} on Q${g.targetQubit} (Step ${g.step})`))}
    Simulation Result: ${result ? JSON.stringify(result.probabilities) : "Not run yet"}
    
    [USER QUESTION]
    ${currentMessage}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        { role: "user", parts: [{ text: TUTOR_PERSONA }] },
        { role: "model", parts: [{ text: "Understood. I am your Quantum Tutor ready to help." }] },
        ...history.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        })),
        { role: "user", parts: [{ text: context }] }
      ],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    let text = response.text || "I didn't catch that.";
    
    // Check for grounding chunks to display sources
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      const sources = chunks
        .map((c: any) => c.web?.uri)
        .filter((u: string) => u)
        .map((u: string, i: number) => `[${i+1}] ${u}`)
        .join('\n');
      
      if (sources) {
        text += `\n\n**Sources:**\n${sources}`;
      }
    }

    return text;
  } catch (error) {
    console.error("Chat failed", error);
    return "I'm having trouble thinking right now.";
  }
};

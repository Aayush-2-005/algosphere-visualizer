import { createContext, useContext, useReducer, ReactNode } from 'react';

export type BarState = 'default' | 'comparing' | 'swapping' | 'sorted';

export interface ArrayBar {
  value: number;
  state: BarState;
}

export type AlgorithmType = 
  | 'bubble' 
  | 'selection' 
  | 'insertion' 
  | 'merge' 
  | 'quick' 
  | 'heap';

export type VisualizerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface VisualizerState {
  array: ArrayBar[];
  arraySize: number;
  speed: number;
  algorithm: AlgorithmType;
  status: VisualizerStatus;
  currentStep: number;
  totalSteps: number;
  comparisons: number;
  swaps: number;
  currentDescription: string;
}

type VisualizerAction =
  | { type: 'SET_ARRAY'; payload: ArrayBar[] }
  | { type: 'SET_ARRAY_SIZE'; payload: number }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'SET_ALGORITHM'; payload: AlgorithmType }
  | { type: 'SET_STATUS'; payload: VisualizerStatus }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_TOTAL_STEPS'; payload: number }
  | { type: 'INCREMENT_COMPARISONS' }
  | { type: 'INCREMENT_SWAPS' }
  | { type: 'RESET_STATS' }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'UPDATE_BAR_STATE'; payload: { indices: number[]; state: BarState } }
  | { type: 'SWAP_BARS'; payload: { i: number; j: number } };

const initialState: VisualizerState = {
  array: [],
  arraySize: 30,
  speed: 50,
  algorithm: 'bubble',
  status: 'idle',
  currentStep: 0,
  totalSteps: 0,
  comparisons: 0,
  swaps: 0,
  currentDescription: 'Click "Generate Array" to start',
};

function visualizerReducer(state: VisualizerState, action: VisualizerAction): VisualizerState {
  switch (action.type) {
    case 'SET_ARRAY':
      return { ...state, array: action.payload };
    case 'SET_ARRAY_SIZE':
      return { ...state, arraySize: action.payload };
    case 'SET_SPEED':
      return { ...state, speed: action.payload };
    case 'SET_ALGORITHM':
      return { ...state, algorithm: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_TOTAL_STEPS':
      return { ...state, totalSteps: action.payload };
    case 'INCREMENT_COMPARISONS':
      return { ...state, comparisons: state.comparisons + 1 };
    case 'INCREMENT_SWAPS':
      return { ...state, swaps: state.swaps + 1 };
    case 'RESET_STATS':
      return { ...state, comparisons: 0, swaps: 0, currentStep: 0 };
    case 'SET_DESCRIPTION':
      return { ...state, currentDescription: action.payload };
    case 'UPDATE_BAR_STATE':
      return {
        ...state,
        array: state.array.map((bar, idx) =>
          action.payload.indices.includes(idx)
            ? { ...bar, state: action.payload.state }
            : bar
        ),
      };
    case 'SWAP_BARS':
      const newArray = [...state.array];
      [newArray[action.payload.i], newArray[action.payload.j]] = 
        [newArray[action.payload.j], newArray[action.payload.i]];
      return { ...state, array: newArray };
    default:
      return state;
  }
}

interface VisualizerContextType {
  state: VisualizerState;
  dispatch: React.Dispatch<VisualizerAction>;
}

const VisualizerContext = createContext<VisualizerContextType | null>(null);

export function VisualizerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(visualizerReducer, initialState);

  return (
    <VisualizerContext.Provider value={{ state, dispatch }}>
      {children}
    </VisualizerContext.Provider>
  );
}

export function useVisualizer() {
  const context = useContext(VisualizerContext);
  if (!context) {
    throw new Error('useVisualizer must be used within a VisualizerProvider');
  }
  return context;
}

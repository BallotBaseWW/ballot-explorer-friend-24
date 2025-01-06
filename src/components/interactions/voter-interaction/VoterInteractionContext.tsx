import { createContext, useContext, ReactNode, useState } from 'react';
import { VoterInfo, InteractionType } from '../types';

interface VoterInteractionContextType {
  selectedVoter: VoterInfo | null;
  type: InteractionType;
  notes: string;
  setType: (type: InteractionType) => void;
  setNotes: (notes: string) => void;
  setSelectedVoter: (voter: VoterInfo | null) => void;
}

const VoterInteractionContext = createContext<VoterInteractionContextType | undefined>(undefined);

export const VoterInteractionProvider = ({ 
  children,
  initialState = {
    selectedVoter: null,
    type: "call" as InteractionType,
    notes: "",
  }
}: { 
  children: ReactNode;
  initialState?: Partial<VoterInteractionContextType>;
}) => {
  const [state, setState] = useState({
    selectedVoter: initialState.selectedVoter ?? null,
    type: initialState.type ?? "call",
    notes: initialState.notes ?? "",
  });

  const contextValue = {
    ...state,
    setType: (type: InteractionType) => setState(prev => ({ ...prev, type })),
    setNotes: (notes: string) => setState(prev => ({ ...prev, notes })),
    setSelectedVoter: (voter: VoterInfo | null) => setState(prev => ({ ...prev, selectedVoter: voter })),
  };

  return (
    <VoterInteractionContext.Provider value={contextValue}>
      {children}
    </VoterInteractionContext.Provider>
  );
};

export const useVoterInteraction = () => {
  const context = useContext(VoterInteractionContext);
  if (context === undefined) {
    throw new Error('useVoterInteraction must be used within a VoterInteractionProvider');
  }
  return context;
};
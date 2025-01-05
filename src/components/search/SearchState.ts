import { create } from 'zustand';

interface SearchState {
  searchCriteria: {
    first_name: string;
    last_name: string;
  };
  setSearchCriteria: (criteria: Partial<{ first_name: string; last_name: string }>) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  resetSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchCriteria: {
    first_name: '',
    last_name: ''
  },
  setSearchCriteria: (criteria) => 
    set((state) => ({
      searchCriteria: { ...state.searchCriteria, ...criteria }
    })),
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
  resetSearch: () => set({
    searchCriteria: { first_name: '', last_name: '' },
    currentPage: 1
  })
}));
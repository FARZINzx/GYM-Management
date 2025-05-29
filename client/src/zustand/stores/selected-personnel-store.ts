import { create } from 'zustand';
import { PersonnelType} from '@/data/type';

type SelectedPersonnelState = {
    selectedPersonnel: PersonnelType | null;
    setSelectedPersonnel: (person: PersonnelType) => void;
    clearSelectedPersonnel: () => void;
};

export const useSelectedPersonnelStore = create<SelectedPersonnelState>((set)=>({
    selectedPersonnel : null,
    setSelectedPersonnel: (person)=>set({selectedPersonnel : person}),
    clearSelectedPersonnel : () => set({selectedPersonnel : null})
}))
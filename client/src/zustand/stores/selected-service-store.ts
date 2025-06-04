import { create } from 'zustand';
import { GymService} from '@/data/type';

type SelectedServiceState = {
    selectedService: GymService | null;
    setSelectedService: (service: GymService) => void;
    clearSelectedService: () => void;
};

export const useSelectedServiceStore = create<SelectedServiceState>((set)=>({
    selectedService : null,
    setSelectedService: (service)=>set({selectedService : service}),
    clearSelectedService : () => set({selectedService : null})
}))
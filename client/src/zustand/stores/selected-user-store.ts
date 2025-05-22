import { create } from 'zustand';
import { User } from '@/data/type';

type SelectedUserState = {
  selectedUser: User | null;
  setSelectedUser: (user: User) => void;
  clearSelectedUser: () => void;
}; 

export const useSelectedUserStore = create<SelectedUserState>((set)=>({
     selectedUser : null,
     setSelectedUser: (user)=>set({selectedUser : user}),
     clearSelectedUser : () => set({selectedUser : null})
}))
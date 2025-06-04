import { create } from 'zustand'
//

type user = {
     id: number
     role: string
}

type meType = {
     me: user | null,
     setMe: (user: user) => void
}

export const useMeStore = create<meType>((set) => ({
     me: null,
     setMe: (user) => set({ me: user })
}))
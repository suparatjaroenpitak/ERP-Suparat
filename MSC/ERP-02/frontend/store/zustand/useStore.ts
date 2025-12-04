import create from 'zustand'

type State = {
  count: number
  inc: () => void
  dec: () => void
}

export const useStore = create<State>((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
  dec: () => set((s) => ({ count: s.count - 1 })),
}))

export default useStore

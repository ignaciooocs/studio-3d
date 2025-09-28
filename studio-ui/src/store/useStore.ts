import { create } from 'zustand'

export type Vec3 = [number, number, number]
export type SceneObjectType = 'cube' | 'sphere' | 'text' | 'custom'

export interface SceneObject {
  id: string
  name?: string
  type: SceneObjectType
  position: Vec3
  rotation: Vec3
  scale: Vec3
  color?: string
  // space for future properties: material, metadata, etc.
}

interface AppState {
  objects: SceneObject[]
  selectedId: string | null
  showBuildVolume: boolean
  addObject: (obj: SceneObject) => void
  updateObject: (id: string, patch: Partial<SceneObject>) => void
  removeObject: (id: string) => void
  setSelected: (id: string | null) => void
  reset: () => void
  setShowBuildVolume: (v: boolean) => void
  toggleBuildVolume: () => void
}

export const useStore = create<AppState>((set) => ({
  objects: [],
  selectedId: null,
  showBuildVolume: true,
  addObject: (obj) => set((s) => ({ objects: [...s.objects, obj] })),
  updateObject: (id, patch) =>
    set((s) => ({
      objects: s.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    })),
  removeObject: (id) =>
    set((s) => ({ objects: s.objects.filter((o) => o.id !== id) })),
  setSelected: (id) => set({ selectedId: id }),
  reset: () => set({ objects: [], selectedId: null }),
  setShowBuildVolume: (v) => set({ showBuildVolume: v }),
  toggleBuildVolume: () => set((s) => ({ showBuildVolume: !s.showBuildVolume })),
}))

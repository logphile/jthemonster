import { defineStore } from 'pinia'

export type Units = 'lb' | 'kg'
export type Profile = { id: string; display_name?: string } | null

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null as Profile,
    settings: {
      units: 'lb' as Units,
      showRpeHints: true,
    },
  }),
  getters: {
    displayName: (s) => s.profile?.display_name ?? 'Athlete',
  },
  actions: {
    setProfile(p: Profile) { this.profile = p },
    setUnits(u: Units) { this.settings.units = u },
  },
})

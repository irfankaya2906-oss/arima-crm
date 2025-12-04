import { create } from 'zustand'
import { Opportunity, OpportunityStage } from '@prisma/client'

interface OpportunityStore {
  opportunities: Opportunity[]
  setOpportunities: (opportunities: Opportunity[]) => void
  addOpportunity: (opportunity: Opportunity) => void
  updateOpportunity: (id: string, opportunity: Partial<Opportunity>) => void
  updateOpportunityStage: (id: string, stage: OpportunityStage) => void
  deleteOpportunity: (id: string) => void
}

export const useOpportunityStore = create<OpportunityStore>((set) => ({
  opportunities: [],
  setOpportunities: (opportunities) => set({ opportunities }),
  addOpportunity: (opportunity) => set((state) => ({ opportunities: [...state.opportunities, opportunity] })),
  updateOpportunity: (id, opportunity) => set((state) => ({
    opportunities: state.opportunities.map((o) => (o.id === id ? { ...o, ...opportunity } : o))
  })),
  updateOpportunityStage: (id, stage) => set((state) => ({
    opportunities: state.opportunities.map((o) => (o.id === id ? { ...o, stage } : o))
  })),
  deleteOpportunity: (id) => set((state) => ({
    opportunities: state.opportunities.filter((o) => o.id !== id)
  })),
}))





import { create } from 'zustand'
import { Company, CompanyStatus } from '@prisma/client'

interface CompanyStore {
  companies: Company[]
  selectedCompany: Company | null
  filters: {
    sector?: string
    region?: string
    status?: CompanyStatus
    search?: string
  }
  setCompanies: (companies: Company[]) => void
  setSelectedCompany: (company: Company | null) => void
  setFilters: (filters: Partial<CompanyStore['filters']>) => void
  addCompany: (company: Company) => void
  updateCompany: (id: string, company: Partial<Company>) => void
  deleteCompany: (id: string) => void
}

export const useCompanyStore = create<CompanyStore>((set) => ({
  companies: [],
  selectedCompany: null,
  filters: {},
  setCompanies: (companies) => set({ companies }),
  setSelectedCompany: (selectedCompany) => set({ selectedCompany }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  addCompany: (company) => set((state) => ({ companies: [...state.companies, company] })),
  updateCompany: (id, company) => set((state) => ({
    companies: state.companies.map((c) => (c.id === id ? { ...c, ...company } : c)),
    selectedCompany: state.selectedCompany?.id === id 
      ? { ...state.selectedCompany, ...company } 
      : state.selectedCompany
  })),
  deleteCompany: (id) => set((state) => ({
    companies: state.companies.filter((c) => c.id !== id),
    selectedCompany: state.selectedCompany?.id === id ? null : state.selectedCompany
  })),
}))





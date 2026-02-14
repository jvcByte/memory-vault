export type UserRole = 'owner' | 'viewer'

export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  role: UserRole
  createdAt: Date
}

export interface Memory {
  id: string
  title: string
  description: string | null
  memoryDate: string
  imageUrl: string | null
  tags: string[]
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Reason {
  id: string
  content: string
  isActive: boolean
  createdAt: Date
}

export interface Event {
  id: string
  title: string
  targetDate: Date
  createdAt: Date
}

export interface ProposalResponse {
  id: string
  response: 'yes' | 'no'
  respondedAt: Date
}

export interface Settings {
  key: string
  value: any
  updatedAt: Date
}

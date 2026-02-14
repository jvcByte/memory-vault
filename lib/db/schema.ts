import { pgTable, text, timestamp, uuid, boolean, date, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// NextAuth tables
export const users = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  role: text('role', { enum: ['owner', 'viewer'] }).notNull().default('viewer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const accounts = pgTable('account', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: timestamp('expires_at', { mode: 'date' }),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
})

export const sessions = pgTable('session', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

// App tables
export const memories = pgTable('memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  memoryDate: date('memory_date').notNull(),
  imageUrl: text('image_url'),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const reasons = pgTable('reasons', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  targetDate: timestamp('target_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const proposalResponses = pgTable('proposal_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  response: text('response', { enum: ['yes', 'no'] }).notNull(),
  respondedAt: timestamp('responded_at').defaultNow().notNull(),
})

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

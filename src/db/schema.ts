import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

// 1. Leads Table
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  eventType: text("event_type").notNull(),
  eventDate: text("event_date").notNull(),
  guests: integer("guests").default(0).notNull(),
  message: text("message"),
  status: text("status").default("New").notNull(), // "New" | "Contacted" | "Closed"
  notes: text("notes").default(""),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

// 2. Users Table (Admin accounts)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(), // stored plain/simple for mockup auth requirements
  name: text("name").notNull(),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

// 3. Global Config Table (Single-row site configurations)
export const config = pgTable("config", {
  id: integer("id").primaryKey().default(1),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  officeName: text("office_name").notNull(),
});

// 4. Scheduled Events Table
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  date: text("event_date").notNull(),
  type: text("event_type").notNull(),
  status: text("status").default("Scheduled").notNull(), // "Scheduled" | "Completed" | "Cancelled"
  notes: text("notes").default(""),
  createdTime: timestamp("created_time").defaultNow().notNull(),
});

// Infer types
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Config = typeof config.$inferSelect;
export type NewConfig = typeof config.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

"use server";

import { db, leads, users, config, events, type Lead, type User, type Config, type Event } from "@/db";
import { desc, eq } from "drizzle-orm";

// 1. Seed Data Definitions
const SEED_LEADS = [
  {
    name: "Juliana Vane",
    email: "juliana@vane.co",
    eventType: "Luxury Wedding",
    eventDate: "2024-10-12",
    guests: 150,
    message: "Planning a grand celebration at the Metropolitan Museum. Looking for bespoke coordination.",
    status: "New",
    notes: "Initial request for high-end champagne styling.",
  },
  {
    name: "Goldman Sachs Exec",
    email: "events@gs.com",
    eventType: "Corporate Gala",
    eventDate: "2024-10-10",
    guests: 300,
    message: "Q4 executive summit. Requires absolute discretion and high-end tech/lounge staging.",
    status: "Contacted",
    notes: "Followed up with executive catering options. Waiting on menu review.",
  },
  {
    name: "The Richardsons",
    email: "richardson@family.org",
    eventType: "Private Celebration",
    eventDate: "2024-10-08",
    guests: 80,
    message: "Intimate estate celebration in Hudson Valley with gold accents and custom fine dining.",
    status: "Closed",
    notes: "Contract signed and deposit received.",
  },
];

const DEFAULT_ADMIN = {
  email: "executive@infinityplanners.nyc",
  password: "password", // plain password for simple admin panel mockup validation
  name: "Infinity Curator",
};

const DEFAULT_CONFIG = {
  id: 1,
  email: "hello@infinityplanners.nyc",
  phone: "+1 (516) 344-7239",
  address: "545 Madison Avenue, 12th Floor, New York, NY 10022",
  officeName: "Manhattan Office",
};

const SEED_EVENTS = [
  {
    title: "Plaza Hotel Winter Gala",
    clientName: "Goldman Sachs Exec",
    clientEmail: "events@gs.com",
    date: "2024-11-20",
    type: "Corporate Gala",
    status: "Scheduled",
    notes: "Theme: Modern Glassmorphism. Visual mockups approved.",
  },
  {
    title: "Juliana & Marcus Wedding",
    clientName: "Juliana Vane",
    clientEmail: "juliana@vane.co",
    date: "2024-10-12",
    type: "Luxury Wedding",
    status: "Scheduled",
    notes: "Staged at the Metropolitan Museum. High-priority lead.",
  },
];

// ==========================================
// 2. Leads Server Actions
// ==========================================

export async function createLeadAction(data: {
  name: string;
  email: string;
  eventType: string;
  eventDate: string;
  guests: number;
  message: string;
}): Promise<Lead> {
  const [result] = await db.insert(leads).values({
    name: data.name,
    email: data.email,
    eventType: data.eventType,
    eventDate: data.eventDate,
    guests: data.guests,
    message: data.message,
    status: "New",
  }).returning();

  return result;
}

export async function getLeadsAction(): Promise<Lead[]> {
  let result = await db.select().from(leads).orderBy(desc(leads.createdTime));
  
  if (result.length === 0) {
    await db.insert(leads).values(SEED_LEADS);
    result = await db.select().from(leads).orderBy(desc(leads.createdTime));
  }
  
  return result;
}

export async function updateLeadAction(
  id: string,
  status: string,
  notes: string
): Promise<Lead> {
  const [updated] = await db
    .update(leads)
    .set({ status, notes })
    .where(eq(leads.id, id))
    .returning();

  return updated;
}

export async function deleteLeadAction(id: string): Promise<void> {
  await db.delete(leads).where(eq(leads.id, id));
}

// ==========================================
// 3. User Authentication Server Actions
// ==========================================

export async function validateLoginAction(
  emailInput: string,
  passwordInput: string
): Promise<User | null> {
  // Ensure default administrator exists
  const allUsers = await db.select().from(users);
  if (allUsers.length === 0) {
    await db.insert(users).values(DEFAULT_ADMIN);
  }

  const [foundUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, emailInput.toLowerCase().trim()))
    .limit(1);

  if (foundUser && foundUser.password === passwordInput) {
    return foundUser;
  }
  return null;
}

// ==========================================
// 4. Config settings Server Actions
// ==========================================

export async function getConfigAction(): Promise<Config> {
  let [currentConfig] = await db
    .select()
    .from(config)
    .where(eq(config.id, 1))
    .limit(1);

  if (!currentConfig) {
    [currentConfig] = await db.insert(config).values(DEFAULT_CONFIG).returning();
  }

  return currentConfig;
}

export async function updateConfigAction(data: {
  email: string;
  phone: string;
  address: string;
  officeName: string;
}): Promise<Config> {
  const [updated] = await db
    .update(config)
    .set({
      email: data.email,
      phone: data.phone,
      address: data.address,
      officeName: data.officeName,
    })
    .where(eq(config.id, 1))
    .returning();

  return updated;
}

// ==========================================
// 5. Events Server Actions
// ==========================================

export async function getEventsAction(): Promise<Event[]> {
  let result = await db.select().from(events).orderBy(desc(events.createdTime));

  if (result.length === 0) {
    await db.insert(events).values(SEED_EVENTS);
    result = await db.select().from(events).orderBy(desc(events.createdTime));
  }

  return result;
}

export async function createEventAction(data: {
  title: string;
  clientName: string;
  clientEmail: string;
  date: string;
  type: string;
  notes?: string;
}): Promise<Event> {
  const [result] = await db.insert(events).values({
    title: data.title,
    clientName: data.clientName,
    clientEmail: data.clientEmail,
    date: data.date,
    type: data.type,
    status: "Scheduled",
    notes: data.notes || "",
  }).returning();

  return result;
}

export async function updateEventAction(
  id: string,
  status: string,
  notes: string
): Promise<Event> {
  const [updated] = await db
    .update(events)
    .set({ status, notes })
    .where(eq(events.id, id))
    .returning();

  return updated;
}

export async function deleteEventAction(id: string): Promise<void> {
  await db.delete(events).where(eq(events.id, id));
}

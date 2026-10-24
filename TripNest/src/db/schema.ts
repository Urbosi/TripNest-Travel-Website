import {
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("traveler"),
  homeCity: text("home_city").notNull().default(""),
  bio: text("bio").notNull().default(""),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  country: text("country").notNull(),
  continent: text("continent").notNull().default("Asia"),
  division: text("division").notNull().default("Dhaka"),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  bestSeason: text("best_season").notNull().default("Year-round"),
  avgDailyCost: doublePrecision("avg_daily_cost").notNull().default(0),
  currency: text("currency").notNull().default("BDT"),

  // Individual cost breakdown (all in BDT)
  lodgingCost: doublePrecision("lodging_cost").notNull().default(0), // per night
  foodCost: doublePrecision("food_cost").notNull().default(0), // per day
  localTransportCost: doublePrecision("local_transport_cost").notNull().default(0), // per day
  activityCost: doublePrecision("activity_cost").notNull().default(0), // per day
  intercityTransport: doublePrecision("intercity_transport").notNull().default(0), // round trip from Dhaka
  entryFee: doublePrecision("entry_fee").notNull().default(0), // one-off

  // Logistics
  distanceFromDhaka: doublePrecision("distance_from_dhaka").notNull().default(0), // km
  travelMode: text("travel_mode").notNull().default("Bus"),
  travelTime: text("travel_time").notNull().default(""),
  accessNote: text("access_note").notNull().default(""),

  rating: doublePrecision("rating").notNull().default(4.5),
  latitude: doublePrecision("latitude").notNull().default(0),
  longitude: doublePrecision("longitude").notNull().default(0),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("wishlist"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  destinationId: integer("destination_id").references(() => destinations.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  travelers: integer("travelers").notNull().default(1),
  budget: doublePrecision("budget").notNull().default(0),
  status: text("status").notNull().default("planning"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tripId: integer("trip_id").references(() => trips.id, { onDelete: "cascade" }),
  category: text("category").notNull().default("Other"),
  description: text("description").notNull().default(""),
  amount: doublePrecision("amount").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  spentOn: date("spent_on").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull().default("General enquiry"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Destination = typeof destinations.$inferSelect;
export type NewDestination = typeof destinations.$inferInsert;
export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

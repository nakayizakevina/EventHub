/**
 * Seed data for the frontend-only EventHub Dashboard.
 *
 * There is no backend: these arrays stand in for API responses. The service
 * layer (`src/services/dashboardService.ts`) reads from here, so swapping the
 * seed for real HTTP calls later does not touch any UI component.
 *
 * Assumptions (also documented in the README):
 * - Event and booking dates are generated relative to the current date so
 *   the dashboard always shows upcoming, active and completed events plus
 *   several months of booking history.
 * - `event.ticketsSold` is the authoritative per-event sold count and never
 *   exceeds `ticketCapacity`.
 * - Bookings are a representative sample of orders used for revenue and
 *   booking figures; only `paid` bookings count towards revenue.
 * - Every booking's `eventId` references an event in `events` (enforced by
 *   the seed integrity tests).
 * - `draftEvents` are unpublished events used only by the Events page; the
 *   dashboard never reads them, so its figures are unaffected.
 */
import { addDays, setHours, setMinutes, subDays } from 'date-fns';

import type { Booking } from '../types/booking';
import type { EventItem } from '../types/event';

const referenceDate = new Date();

/** ISO 8601 date-time `days` from today at a fixed local time. */
function isoDateDaysFromNow(days: number, hour: number, minute = 0): string {
  return setMinutes(setHours(addDays(referenceDate, days), hour), minute).toISOString();
}

/** ISO 8601 timestamp for `days` days ago (used for booking creation dates). */
function isoDaysAgo(days: number): string {
  return subDays(referenceDate, days).toISOString();
}

/**
 * Events across five categories and three lifecycle statuses, with a spread
 * of capacities and sales figures (from 40% to ~99% occupancy).
 */
export const events: EventItem[] = [
  {
    id: 'evt-001',
    title: 'Afrobeat Night Live',
    category: 'Music',
    date: isoDateDaysFromNow(0, 19, 0),
    venue: 'Kampala Serena Conference Centre, Kampala',
    status: 'active',
    ticketCapacity: 2000,
    ticketsSold: 1740,
    image: '/images/events/afrobeat-night-live.svg',
    description:
      'An electrifying night of East Africa’s finest afrobeats acts, live on one stage.',
  },
  {
    id: 'evt-002',
    title: 'Tech4Dev DevFest 2026',
    category: 'Technology',
    date: isoDateDaysFromNow(12, 9, 0),
    venue: 'Kenyatta International Convention Centre, Nairobi',
    status: 'upcoming',
    ticketCapacity: 1200,
    ticketsSold: 860,
    image: '/images/events/tech4dev-devfest.svg',
    description:
      'A full day of talks, workshops and networking for developers building for good.',
  },
  {
    id: 'evt-003',
    title: 'Kampala City Marathon',
    category: 'Sports',
    date: isoDateDaysFromNow(-35, 6, 30),
    venue: 'Kololo Independence Grounds, Kampala',
    status: 'completed',
    ticketCapacity: 5000,
    ticketsSold: 4620,
    image: '/images/events/kampala-city-marathon.svg',
    description:
      'The city’s biggest road race, with 5K, 10K and full marathon routes through Kampala.',
  },
  {
    id: 'evt-004',
    title: 'Lagos Fashion Week Showcase',
    category: 'Fashion',
    date: isoDateDaysFromNow(25, 18, 0),
    venue: 'Eko Hotel & Suites Convention Centre, Lagos',
    status: 'upcoming',
    ticketCapacity: 900,
    ticketsSold: 610,
    image: '/images/events/lagos-fashion-week.svg',
    description:
      'Runway shows, designer markets and style talks celebrating the best of African design.',
  },
  {
    id: 'evt-005',
    title: 'Taste of East Africa Food Fest',
    category: 'Food & Culinary',
    date: isoDateDaysFromNow(0, 11, 0),
    venue: 'Sheraton Kampala Gardens, Kampala',
    status: 'active',
    ticketCapacity: 800,
    ticketsSold: 735,
    image: '/images/events/taste-of-east-africa.svg',
    description:
      'A weekend of street food, chef demos and regional flavours from across the region.',
  },
  {
    id: 'evt-006',
    title: 'Gospel Praise Gala',
    category: 'Music',
    date: isoDateDaysFromNow(-60, 17, 0),
    venue: 'Lugogo Cricket Oval, Kampala',
    status: 'completed',
    ticketCapacity: 1500,
    ticketsSold: 1480,
    image: '/images/events/gospel-praise-gala.svg',
    description:
      'An evening of worship and praise featuring celebrated gospel choirs and soloists.',
  },
  {
    id: 'evt-007',
    title: 'Women in Tech Summit',
    category: 'Technology',
    date: isoDateDaysFromNow(8, 9, 30),
    venue: 'The Innovation Village, Kampala',
    status: 'upcoming',
    ticketCapacity: 600,
    ticketsSold: 372,
    image: '/images/events/women-in-tech-summit.svg',
    description:
      'Keynotes, mentoring clinics and panels for women building careers in technology.',
  },
  {
    id: 'evt-008',
    title: 'East Africa Basketball Finals',
    category: 'Sports',
    date: isoDateDaysFromNow(-1, 16, 0),
    venue: 'Nyayo National Stadium, Nairobi',
    status: 'active',
    ticketCapacity: 3000,
    ticketsSold: 2410,
    image: '/images/events/east-africa-basketball-finals.svg',
    description:
      'The regional championship showdown — top clubs battle for the continental crown.',
  },
  {
    id: 'evt-009',
    title: 'Street Food Carnival',
    category: 'Food & Culinary',
    date: isoDateDaysFromNow(-90, 12, 0),
    venue: 'Freedom Park, Kampala',
    status: 'completed',
    ticketCapacity: 1000,
    ticketsSold: 940,
    image: '/images/events/street-food-carnival.svg',
    description:
      'Dozens of vendors, live music and family fun in the heart of the city.',
  },
  {
    id: 'evt-010',
    title: 'Accra Style Weekend',
    category: 'Fashion',
    date: isoDateDaysFromNow(40, 18, 30),
    venue: 'Accra International Conference Centre, Accra',
    status: 'upcoming',
    ticketCapacity: 700,
    ticketsSold: 280,
    image: '/images/events/accra-style-weekend.svg',
    description:
      'Runway shows, designer markets and style talks celebrating Ghanaian fashion.',
  },
];

/**
 * Unpublished (draft) events for the Events page listing.
 *
 * Kept separate from `events` so the dashboard — which only ever reads
 * `events` — never shows them. The Events page combines the two arrays as
 * its temporary frontend dataset.
 */
export const draftEvents: EventItem[] = [
  {
    id: 'evt-draft-01',
    title: 'Kampala Jazz & Brunch',
    category: 'Music',
    date: isoDateDaysFromNow(21, 12, 0),
    endDate: isoDateDaysFromNow(21, 17, 0),
    venue: 'Ndere Cultural Centre, Kampala',
    eventType: 'Physical',
    status: 'draft',
    ticketCapacity: 0,
    ticketsSold: 0,
    image: '/images/events/kampala-jazz-brunch.svg',
    description:
      'A lazy Sunday of live jazz, brunch platters and acoustic sets in Kampala.',
  },
  {
    id: 'evt-draft-02',
    title: 'African FinTech Summit 2026',
    category: 'Technology',
    date: isoDateDaysFromNow(35, 9, 0),
    endDate: isoDateDaysFromNow(35, 17, 0),
    venue: 'Virtual — join link shared on registration',
    eventType: 'Online',
    status: 'draft',
    ticketCapacity: 0,
    ticketsSold: 0,
    image: '/images/events/african-fintech-summit.svg',
    description:
      'A virtual summit on payments, lending and the future of African fintech.',
  },
];

/**
 * Representative sample of orders spanning ~5 months and all three payment
 * statuses (18 paid, 5 pending, 4 failed). Amounts equal quantity x the
 * event's unit price.
 */
export const bookings: Booking[] = [
  // Afrobeat Night Live ($60 / ticket)
  { id: 'bkg-001', eventId: 'evt-001', attendeeName: 'Amina Nansubuga', ticketQuantity: 4, amount: 240, paymentStatus: 'paid', createdAt: isoDaysAgo(12) },
  { id: 'bkg-002', eventId: 'evt-001', attendeeName: 'Daniel Okello', ticketQuantity: 2, amount: 120, paymentStatus: 'paid', createdAt: isoDaysAgo(30) },
  { id: 'bkg-003', eventId: 'evt-001', attendeeName: 'Grace Wanjiru', ticketQuantity: 6, amount: 360, paymentStatus: 'pending', createdAt: isoDaysAgo(3) },
  { id: 'bkg-004', eventId: 'evt-001', attendeeName: 'Peter Mugisha', ticketQuantity: 1, amount: 60, paymentStatus: 'failed', createdAt: isoDaysAgo(20) },

  // Tech4Dev DevFest ($45 / ticket)
  { id: 'bkg-005', eventId: 'evt-002', attendeeName: 'Sarah Kimani', ticketQuantity: 3, amount: 135, paymentStatus: 'paid', createdAt: isoDaysAgo(45) },
  { id: 'bkg-006', eventId: 'evt-002', attendeeName: 'John Baptist Odongo', ticketQuantity: 1, amount: 45, paymentStatus: 'paid', createdAt: isoDaysAgo(8) },
  { id: 'bkg-007', eventId: 'evt-002', attendeeName: 'Faith Achieng', ticketQuantity: 2, amount: 90, paymentStatus: 'pending', createdAt: isoDaysAgo(2) },

  // Kampala City Marathon ($35 / ticket)
  { id: 'bkg-008', eventId: 'evt-003', attendeeName: 'Michael Tumusiime', ticketQuantity: 5, amount: 175, paymentStatus: 'paid', createdAt: isoDaysAgo(70) },
  { id: 'bkg-009', eventId: 'evt-003', attendeeName: 'Esther Nabwire', ticketQuantity: 2, amount: 70, paymentStatus: 'paid', createdAt: isoDaysAgo(95) },
  { id: 'bkg-010', eventId: 'evt-003', ticketQuantity: 1, amount: 35, paymentStatus: 'failed', createdAt: isoDaysAgo(80) },

  // Lagos Fashion Week Showcase ($80 / ticket)
  { id: 'bkg-011', eventId: 'evt-004', attendeeName: 'Chidinma Okafor', ticketQuantity: 2, amount: 160, paymentStatus: 'paid', createdAt: isoDaysAgo(25) },
  { id: 'bkg-012', eventId: 'evt-004', attendeeName: 'Amara Eze', ticketQuantity: 3, amount: 240, paymentStatus: 'pending', createdAt: isoDaysAgo(5) },
  { id: 'bkg-013', eventId: 'evt-004', attendeeName: 'Zainab Yusuf', ticketQuantity: 1, amount: 80, paymentStatus: 'paid', createdAt: isoDaysAgo(60) },

  // Taste of East Africa Food Fest ($40 / ticket)
  { id: 'bkg-014', eventId: 'evt-005', attendeeName: 'Robert Kato', ticketQuantity: 6, amount: 240, paymentStatus: 'paid', createdAt: isoDaysAgo(10) },
  { id: 'bkg-015', eventId: 'evt-005', attendeeName: 'Mercy Atieno', ticketQuantity: 4, amount: 160, paymentStatus: 'paid', createdAt: isoDaysAgo(1) },
  { id: 'bkg-016', eventId: 'evt-005', attendeeName: 'Joseph Kimbo', ticketQuantity: 2, amount: 80, paymentStatus: 'failed', createdAt: isoDaysAgo(6) },

  // Gospel Praise Gala ($25 / ticket)
  { id: 'bkg-017', eventId: 'evt-006', attendeeName: 'Rebecca Nakato', ticketQuantity: 8, amount: 200, paymentStatus: 'paid', createdAt: isoDaysAgo(55) },
  { id: 'bkg-018', eventId: 'evt-006', attendeeName: 'Samuel Mwangi', ticketQuantity: 3, amount: 75, paymentStatus: 'paid', createdAt: isoDaysAgo(40) },

  // Women in Tech Summit ($30 / ticket)
  { id: 'bkg-019', eventId: 'evt-007', attendeeName: 'Irene Auma', ticketQuantity: 2, amount: 60, paymentStatus: 'paid', createdAt: isoDaysAgo(18) },
  { id: 'bkg-020', eventId: 'evt-007', attendeeName: 'Kevin Omondi', ticketQuantity: 4, amount: 120, paymentStatus: 'pending', createdAt: isoDaysAgo(4) },

  // East Africa Basketball Finals ($20 / ticket)
  { id: 'bkg-021', eventId: 'evt-008', attendeeName: 'Davis Nkrumah', ticketQuantity: 7, amount: 140, paymentStatus: 'paid', createdAt: isoDaysAgo(2) },
  { id: 'bkg-022', eventId: 'evt-008', attendeeName: 'Halima Said', ticketQuantity: 2, amount: 40, paymentStatus: 'paid', createdAt: isoDaysAgo(15) },
  { id: 'bkg-023', eventId: 'evt-008', ticketQuantity: 3, amount: 60, paymentStatus: 'failed', createdAt: isoDaysAgo(9) },

  // Street Food Carnival ($15 / ticket)
  { id: 'bkg-024', eventId: 'evt-009', attendeeName: 'Naomi Cheruto', ticketQuantity: 10, amount: 150, paymentStatus: 'paid', createdAt: isoDaysAgo(110) },
  { id: 'bkg-025', eventId: 'evt-009', attendeeName: 'Dennis Ochieng', ticketQuantity: 5, amount: 75, paymentStatus: 'paid', createdAt: isoDaysAgo(150) },

  // Accra Style Weekend ($55 / ticket)
  { id: 'bkg-026', eventId: 'evt-010', attendeeName: 'Adwoa Mensah', ticketQuantity: 2, amount: 110, paymentStatus: 'paid', createdAt: isoDaysAgo(35) },
  { id: 'bkg-027', eventId: 'evt-010', attendeeName: 'Kwame Boateng', ticketQuantity: 1, amount: 55, paymentStatus: 'pending', createdAt: isoDaysAgo(7) },
];

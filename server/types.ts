export type EventStatus = 'draft' | 'active' | 'ended' | 'archived';
export type EventPlan = 'lite' | 'party' | 'premium';
export type PhotoStatus = 'pending' | 'approved' | 'rejected';

export type EventSettings = {
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  loginBgUrl?: string;
  headerSubtitle?: string;
  qrCardVariant?: 'classic' | 'minimal' | 'botanical' | 'noir';
  seatsEnabled?: boolean;
  seatsWelcomeMessage?: string;
  seatsShowTablemates?: boolean;
  seatsShowSeatNumber?: boolean;
};

export type EventGuestRow = {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  table_number: string;
  seat_number: string | null;
  phone: string | null;
  group_name: string | null;
  notes: string | null;
  search_text: string;
  created_at: string;
  updated_at: string;
};

export type EventGuestInput = {
  firstName: string;
  lastName?: string;
  tableNumber: string;
  seatNumber?: string | null;
  phone?: string | null;
  groupName?: string | null;
  notes?: string | null;
};

export type EventGuestPublic = {
  id: string;
  fullName: string;
  tableNumber: string;
  seatNumber?: string | null;
};

export type EventGuestView = {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  tableNumber: string;
  seatNumber: string | null;
  phone: string | null;
  groupName: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventRow = {
  id: string;
  slug: string;
  organizer_id: string | null;
  title: string;
  pin_hash: string | null;
  pin_plain: string | null;
  pin_enabled: boolean;
  status: EventStatus;
  plan: EventPlan;
  photo_limit: number;
  moderation_enabled: boolean;
  starts_at: string | null;
  ends_at: string | null;
  settings: EventSettings;
  created_at: string;
  updated_at: string;
};

export type MediaType = 'image' | 'video';

export type PhotoRow = {
  id: string;
  event_id: string | null;
  storage_path: string;
  created_at: string;
  author: string | null;
  status: PhotoStatus;
  media_type?: MediaType;
};

export type PhotoEntry = {
  id: string;
  url: string;
  createdAt: string;
  author?: string;
  status?: PhotoStatus;
  mediaType: MediaType;
};

export const PLAN_LIMITS: Record<EventPlan, { photoLimit: number }> = {
  lite: { photoLimit: 300 },
  party: { photoLimit: 2000 },
  premium: { photoLimit: 5000 },
};

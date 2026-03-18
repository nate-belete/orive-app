export interface User {
  id: number
  email: string
  full_name: string
  first_name: string
  last_name: string
  is_active: boolean
  onboarding_complete: boolean
  gender: string | null
  date_of_birth: string | null
  postcode: string | null
  height_cm: number | null
  weight_kg: number | null
  body_type: string | null
  body_photo_path: string | null
  face_photo_path: string | null
  style_go_tos: string | null
  style_no_goes: string | null
  style_cant_wear: string | null
  colour_season: string | null
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  full_name?: string
  first_name: string
  last_name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UserUpdate {
  full_name?: string
  first_name?: string
  last_name?: string
  gender?: string
  date_of_birth?: string
  postcode?: string
  height_cm?: number
  weight_kg?: number
  body_type?: string
  style_go_tos?: string
  style_no_goes?: string
  style_cant_wear?: string
}

export interface ColourSwatch {
  name: string
  hex: string
}

export interface ColourPalette {
  season: string
  sub_season: string
  description: string
  characteristics: {
    skin_undertone: string
    skin_description: string
    eye_colour: string
    hair_colour: string
  }
  best_colours: ColourSwatch[]
  best_neutrals: ColourSwatch[]
  avoid_colours: ColourSwatch[]
  styling_tips: string[]
}

export interface ColourAnalysisResult {
  season: string
  face_photo_url: string | null
  palette: ColourPalette
}

export interface ClosetItem {
  id: number
  user_id: number
  name: string
  category: string
  color: string
  pattern: string
  formality: number
  season: string
  fabric: string
  brand: string | null
  size: string | null
  notes: string
  image_path: string | null
  image_url: string | null
  ai_tagged: boolean
  is_favourite: boolean
  created_at: string
}

export interface ClosetItemCreate {
  name?: string
  category?: string
  color?: string
  pattern?: string
  formality?: number
  season?: string
  fabric?: string
  brand?: string
  size?: string
  notes?: string
}

export interface ClosetItemUpdate {
  name?: string
  category?: string
  color?: string
  pattern?: string
  formality?: number
  season?: string
  fabric?: string
  brand?: string
  size?: string
  notes?: string
  is_favourite?: boolean
}

export interface Occasion {
  id: number
  user_id: number
  name: string
  occasion_type: string
  datetime_local: string
  end_datetime: string | null
  location: string
  venue: string
  description: string
  dress_code: string
  comfort: string
  desired_outcome: string
  budget: number
  weather_hint: string
  importance: number
  attendees: string
  role: string
  status: string
  playbook_generated: boolean
  created_at: string
  updated_at: string
}

export interface OccasionCreate {
  name?: string
  occasion_type: string
  datetime_local: string
  end_datetime?: string
  location?: string
  venue?: string
  description?: string
  dress_code?: string
  comfort?: string
  desired_outcome?: string
  budget?: number
  weather_hint?: string
  importance?: number
  attendees?: string
  role?: string
}

export interface OccasionUpdate {
  name?: string
  occasion_type?: string
  datetime_local?: string
  end_datetime?: string
  location?: string
  venue?: string
  description?: string
  dress_code?: string
  comfort?: string
  desired_outcome?: string
  budget?: number
  weather_hint?: string
  importance?: number
  attendees?: string
  role?: string
  status?: string
}

export interface OutfitItem {
  id: number
  name: string
  category?: string
}

export interface Outfit {
  title: string
  items: OutfitItem[]
  reasoning: string
  styling_notes?: string
  risk_flags: string[]
  accessories?: string
}

export interface UpgradeSuggestion {
  item: string
  why: string
  priority: 'high' | 'medium' | 'low'
}

export interface Playbook {
  id: number
  occasion_id: number
  look: {
    outfits: Outfit[]
    message?: string
    upgrade_suggestions?: UpgradeSuggestion[]
  }
  beauty: {
    skin_prep?: string[]
    hair?: string
    fragrance?: string
    grooming_notes?: string[]
    notes?: string[]
  }
  prep: {
    week_before?: string[]
    three_days_before?: string[]
    day_before: string[]
    morning_of: string[]
    just_before?: string[]
    pack_list?: string[]
    pack?: string[]
  }
  presence: {
    mindset?: string[]
    body_language?: string[]
    conversation?: {
      openers?: string[]
      topics_to_discuss?: string[]
      graceful_exits?: string[]
    }
    pep_talk?: string
    tips?: string[]
    scripts?: string[]
  }
  created_at: string
}

export interface Feedback {
  id: number
  occasion_id: number
  playbook_id: number
  wore_it: boolean
  confidence_rating: number
  notes: string
  would_repeat: boolean
  created_at: string
}

export interface FeedbackCreate {
  occasion_id: number
  playbook_id: number
  wore_it: boolean
  confidence_rating: number
  notes: string
  would_repeat: boolean
}

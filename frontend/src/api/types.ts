export interface ClosetItem {
  id: number
  name: string
  category: string
  color: string
  formality: number
  season: string
  notes: string
  image_path: string | null
  created_at: string
}

export interface ClosetItemCreate {
  name: string
  category: string
  color: string
  formality: number
  season: string
  notes: string
}

export interface Occasion {
  id: number
  occasion_type: string
  datetime_local: string
  location: string
  dress_code: string
  weather_hint: string
  budget: number
  comfort: string
  desired_outcome: string
  created_at: string
}

export interface OccasionCreate {
  occasion_type: string
  datetime_local: string
  location: string
  dress_code: string
  weather_hint: string
  budget: number
  comfort: string
  desired_outcome: string
}

export interface Outfit {
  title: string
  items: Array<{ id: number; name: string }>
  reasoning: string
  risk_flags: string[]
}

export interface Playbook {
  id: number
  occasion_id: number
  look: {
    outfits: Outfit[]
    message?: string
  }
  beauty: {
    notes: string[]
  }
  prep: {
    day_before: string[]
    morning_of: string[]
    pack: string[]
  }
  presence: {
    tips: string[]
    scripts: string[]
    notes?: string[]
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


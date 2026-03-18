import axios from 'axios'
import type {
  ClosetItem,
  ClosetItemCreate,
  Occasion,
  OccasionCreate,
  Playbook,
  Feedback,
  FeedbackCreate,
} from './types'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const closetApi = {
  list: () => api.get<ClosetItem[]>('/closet/items').then((r) => r.data),
  create: (data: ClosetItemCreate) =>
    api.post<ClosetItem>('/closet/items', data).then((r) => r.data),
  get: (id: number) =>
    api.get<ClosetItem>(`/closet/items/${id}`).then((r) => r.data),
  delete: (id: number) =>
    api.delete(`/closet/items/${id}`).then((r) => r.data),
}

export const occasionsApi = {
  list: () => api.get<Occasion[]>('/occasions').then((r) => r.data),
  create: (data: OccasionCreate) =>
    api.post<Occasion>('/occasions', data).then((r) => r.data),
  get: (id: number) =>
    api.get<Occasion>(`/occasions/${id}`).then((r) => r.data),
}

export const playbooksApi = {
  generate: (occasionId: number, force = false) =>
    api
      .post<Playbook>(`/playbooks/generate?force=${force}`, {
        occasion_id: occasionId,
      })
      .then((r) => r.data),
  getByOccasion: (occasionId: number) =>
    api
      .get<Playbook>(`/playbooks/occasion/${occasionId}`)
      .then((r) => r.data),
  get: (id: number) => api.get<Playbook>(`/playbooks/${id}`).then((r) => r.data),
}

export const feedbackApi = {
  list: () => api.get<Feedback[]>('/feedback').then((r) => r.data),
  create: (data: FeedbackCreate) =>
    api.post<Feedback>('/feedback', data).then((r) => r.data),
  getByOccasion: (occasionId: number) =>
    api
      .get<Feedback[]>(`/feedback/occasion/${occasionId}`)
      .then((r) => r.data),
}


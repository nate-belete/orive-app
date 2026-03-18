import axios from 'axios'
import type {
  ClosetItem,
  ClosetItemCreate,
  ClosetItemUpdate,
  ColourAnalysisResult,
  Occasion,
  OccasionCreate,
  OccasionUpdate,
  Playbook,
  Feedback,
  FeedbackCreate,
  TokenResponse,
  RegisterRequest,
  LoginRequest,
  User,
  UserUpdate,
} from './types'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach auth token to every request if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('orive_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Auth API
export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<TokenResponse>('/auth/register', data).then((r) => r.data),
  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', data).then((r) => r.data),
  getMe: () => api.get<User>('/auth/me').then((r) => r.data),
  updateProfile: (data: UserUpdate) =>
    api.patch<User>('/auth/me', data).then((r) => r.data),
  completeOnboarding: () =>
    api.post<User>('/auth/me/complete-onboarding').then((r) => r.data),
  uploadBodyPhoto: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api
      .post<User>('/auth/me/upload-body-photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
  uploadFacePhoto: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api
      .post<User>('/auth/me/upload-face-photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
  requestPasswordReset: (email: string) =>
    api.post('/auth/password-reset/request', { email }).then((r) => r.data),
  confirmPasswordReset: (token: string, new_password: string) =>
    api
      .post('/auth/password-reset/confirm', { token, new_password })
      .then((r) => r.data),
}

// Closet / Wardrobe API
export const closetApi = {
  list: (params?: { category?: string; season?: string; search?: string }) =>
    api
      .get<ClosetItem[]>('/closet/items', { params })
      .then((r) => r.data),
  create: (data: ClosetItemCreate, image?: File) => {
    const fd = new FormData()
    if (data.name) fd.append('name', data.name)
    if (data.category) fd.append('category', data.category)
    if (data.color) fd.append('color', data.color)
    if (data.pattern) fd.append('pattern', data.pattern)
    if (data.formality !== undefined)
      fd.append('formality', String(data.formality))
    if (data.season) fd.append('season', data.season)
    if (data.fabric) fd.append('fabric', data.fabric)
    if (data.brand) fd.append('brand', data.brand)
    if (data.notes) fd.append('notes', data.notes)
    if (image) fd.append('image', image)
    return api
      .post<ClosetItem>('/closet/items', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
  get: (id: number) =>
    api.get<ClosetItem>(`/closet/items/${id}`).then((r) => r.data),
  update: (id: number, data: ClosetItemUpdate) =>
    api.patch<ClosetItem>(`/closet/items/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    api.delete(`/closet/items/${id}`).then((r) => r.data),
  retag: (id: number) =>
    api.post<ClosetItem>(`/closet/items/${id}/retag`).then((r) => r.data),
  listTrash: () =>
    api.get<ClosetItem[]>('/closet/trash').then((r) => r.data),
  restore: (id: number) =>
    api.post<ClosetItem>(`/closet/items/${id}/restore`).then((r) => r.data),
}

// Colour Analysis API
export const colourApi = {
  analyse: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api
      .post<ColourAnalysisResult>('/colour/analyse', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
  getResults: () =>
    api.get<ColourAnalysisResult>('/colour/results').then((r) => r.data),
  reanalyse: (file?: File) => {
    const fd = new FormData()
    if (file) fd.append('file', file)
    return api
      .post<ColourAnalysisResult>('/colour/reanalyse', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}

// Occasions API
export const occasionsApi = {
  list: (params?: { status?: string; occasion_type?: string }) =>
    api.get<Occasion[]>('/occasions', { params }).then((r) => r.data),
  create: (data: OccasionCreate) =>
    api.post<Occasion>('/occasions', data).then((r) => r.data),
  get: (id: number) =>
    api.get<Occasion>(`/occasions/${id}`).then((r) => r.data),
  update: (id: number, data: OccasionUpdate) =>
    api.patch<Occasion>(`/occasions/${id}`, data).then((r) => r.data),
  delete: (id: number) =>
    api.delete(`/occasions/${id}`).then((r) => r.data),
}

// Playbooks API
export const playbooksApi = {
  generate: (occasionId: number, force = false, module = '') => {
    const params = new URLSearchParams()
    if (force) params.set('force', 'true')
    if (module) params.set('module', module)
    return api
      .post<Playbook>(`/playbooks/generate?${params.toString()}`, {
        occasion_id: occasionId,
      })
      .then((r) => r.data)
  },
  getByOccasion: (occasionId: number) =>
    api
      .get<Playbook>(`/playbooks/occasion/${occasionId}`)
      .then((r) => r.data),
  get: (id: number) =>
    api.get<Playbook>(`/playbooks/${id}`).then((r) => r.data),
}

// Feedback API
export const feedbackApi = {
  list: () => api.get<Feedback[]>('/feedback').then((r) => r.data),
  create: (data: FeedbackCreate) =>
    api.post<Feedback>('/feedback', data).then((r) => r.data),
  getByOccasion: (occasionId: number) =>
    api
      .get<Feedback[]>(`/feedback/occasion/${occasionId}`)
      .then((r) => r.data),
}

// Demo API
export const demoApi = {
  load: () => api.post('/demo/load').then((r) => r.data),
}

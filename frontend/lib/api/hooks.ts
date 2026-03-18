'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  closetApi,
  occasionsApi,
  playbooksApi,
  feedbackApi,
  demoApi,
} from './client'
import type {
  ClosetItemCreate,
  ClosetItemUpdate,
  OccasionCreate,
  OccasionUpdate,
  FeedbackCreate,
} from './types'

// Closet hooks
export const useClosetItems = (params?: {
  category?: string
  season?: string
  search?: string
}) => {
  return useQuery({
    queryKey: ['closet', params],
    queryFn: () => closetApi.list(params),
  })
}

export const useClosetItem = (id: number) => {
  return useQuery({
    queryKey: ['closet', id],
    queryFn: () => closetApi.get(id),
    enabled: !!id,
  })
}

export const useCreateClosetItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      data,
      image,
    }: {
      data: ClosetItemCreate
      image?: File
    }) => closetApi.create(data, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closet'] })
    },
  })
}

export const useUpdateClosetItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClosetItemUpdate }) =>
      closetApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closet'] })
    },
  })
}

export const useDeleteClosetItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: closetApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closet'] })
    },
  })
}

export const useRetagClosetItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: closetApi.retag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closet'] })
    },
  })
}

// Occasion hooks
export const useOccasions = (params?: {
  status?: string
  occasion_type?: string
}) => {
  return useQuery({
    queryKey: ['occasions', params],
    queryFn: () => occasionsApi.list(params),
  })
}

export const useOccasion = (id: number) => {
  return useQuery({
    queryKey: ['occasions', id],
    queryFn: () => occasionsApi.get(id),
    enabled: !!id,
  })
}

export const useCreateOccasion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: occasionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasions'] })
    },
  })
}

export const useUpdateOccasion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OccasionUpdate }) =>
      occasionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasions'] })
    },
  })
}

export const useDeleteOccasion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: occasionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occasions'] })
    },
  })
}

// Playbook hooks
export const useGeneratePlaybook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      occasionId,
      force,
      module,
    }: {
      occasionId: number
      force?: boolean
      module?: string
    }) => playbooksApi.generate(occasionId, force, module),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['playbooks', data.occasion_id],
      })
    },
  })
}

export const usePlaybookByOccasion = (occasionId: number) => {
  return useQuery({
    queryKey: ['playbooks', occasionId],
    queryFn: () => playbooksApi.getByOccasion(occasionId),
    enabled: !!occasionId,
  })
}

// Feedback hooks
export const useFeedback = () => {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: feedbackApi.list,
  })
}

export const useFeedbackByOccasion = (occasionId: number) => {
  return useQuery({
    queryKey: ['feedback', occasionId],
    queryFn: () => feedbackApi.getByOccasion(occasionId),
    enabled: !!occasionId,
  })
}

export const useCreateFeedback = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: feedbackApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      queryClient.invalidateQueries({
        queryKey: ['feedback', data.occasion_id],
      })
    },
  })
}

// Demo hooks
export const useLoadDemoData = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: demoApi.load,
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}

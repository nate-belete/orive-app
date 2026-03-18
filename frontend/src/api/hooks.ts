import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  closetApi,
  occasionsApi,
  playbooksApi,
  feedbackApi,
} from './client'
import type {
  ClosetItemCreate,
  OccasionCreate,
  FeedbackCreate,
} from './types'

// Closet hooks
export const useClosetItems = () => {
  return useQuery({
    queryKey: ['closet'],
    queryFn: closetApi.list,
  })
}

export const useCreateClosetItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: closetApi.create,
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

// Occasion hooks
export const useOccasions = () => {
  return useQuery({
    queryKey: ['occasions'],
    queryFn: occasionsApi.list,
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

// Playbook hooks
export const useGeneratePlaybook = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ occasionId, force }: { occasionId: number; force?: boolean }) =>
      playbooksApi.generate(occasionId, force),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['playbooks', data.occasion_id] })
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
      queryClient.invalidateQueries({ queryKey: ['feedback', data.occasion_id] })
    },
  })
}


'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import AppShell from '@/app/components/AppShell'
import Loading from '@/app/components/Loading'
import ErrorState from '@/app/components/ErrorState'
import {
  useClosetItems,
  useCreateClosetItem,
  useDeleteClosetItem,
  useUpdateClosetItem,
} from '@/lib/api/hooks'
import { useAuth } from '@/lib/auth/AuthContext'
import { API_BASE_URL } from '@/lib/api/client'
import type { ClosetItem, ClosetItemUpdate, ColourPalette } from '@/lib/api/types'
import { matchColourToPalette, getMatchDisplay, type ColourMatch } from '@/lib/colour-match'

const CATEGORIES = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'dress', label: 'Dress' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'bag', label: 'Bag' },
  { value: 'jewellery', label: 'Jewellery' },
]

const SEASONS = [
  { value: 'all', label: 'All Seasons' },
  { value: 'summer', label: 'Summer' },
  { value: 'winter', label: 'Winter' },
  { value: 'spring', label: 'Spring' },
  { value: 'fall', label: 'Fall' },
]

export default function WardrobePage() {
  const { user } = useAuth()
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterSeason, setFilterSeason] = useState('all')
  const [filterColourMatch, setFilterColourMatch] = useState<'all' | ColourMatch>('all')
  const [filterFavourites, setFilterFavourites] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent')
  const [selectedItem, setSelectedItem] = useState<ClosetItem | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: items, isLoading, error, refetch } = useClosetItems()
  const createMutation = useCreateClosetItem()
  const deleteMutation = useDeleteClosetItem()
  const updateMutation = useUpdateClosetItem()

  // Parse user's colour palette
  const palette: ColourPalette | null = useMemo(() => {
    if (!user?.colour_season) return null
    try {
      // colour_palette_json is stored on user but not exposed via UserRead directly;
      // we fetch results separately if needed. For now, use the embedded data if available.
      return null
    } catch {
      return null
    }
  }, [user?.colour_season])

  // Fetch palette data for colour matching
  const [paletteData, setPaletteData] = useState<ColourPalette | null>(null)
  const paletteLoaded = useRef(false)
  if (user?.colour_season && !paletteLoaded.current) {
    paletteLoaded.current = true
    import('@/lib/api/client').then(({ colourApi }) => {
      colourApi
        .getResults()
        .then((data) => setPaletteData(data.palette))
        .catch(() => {})
    })
  }
  const activePalette = paletteData || palette

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setIsUploading(true)
      const fileArray = Array.from(files)

      for (const file of fileArray) {
        try {
          await createMutation.mutateAsync({ data: {}, image: file })
        } catch (err) {
          console.error('Failed to upload:', file.name, err)
        }
      }
      setIsUploading(false)
    },
    [createMutation]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleDelete = async (id: number) => {
    if (confirm('Remove this item from your wardrobe?')) {
      await deleteMutation.mutateAsync(id)
      if (selectedItem?.id === id) setSelectedItem(null)
    }
  }

  const handleUpdateItem = async (id: number, data: ClosetItemUpdate) => {
    const updated = await updateMutation.mutateAsync({ id, data })
    setSelectedItem(updated)
  }

  const filteredItems = useMemo(() => {
    let result = items?.filter((item) => {
      if (filterFavourites && !item.is_favourite) return false
      if (filterCategory !== 'all' && item.category !== filterCategory) return false
      if (filterSeason !== 'all' && item.season !== filterSeason && item.season !== 'all') return false
      if (filterColourMatch !== 'all' && activePalette) {
        const match = matchColourToPalette(item.color, activePalette)
        if (match !== filterColourMatch) return false
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          item.name.toLowerCase().includes(q) ||
          item.color.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.brand && item.brand.toLowerCase().includes(q))
        )
      }
      return true
    }) || []

    if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    }
    return result
  }, [items, filterFavourites, filterCategory, filterSeason, filterColourMatch, activePalette, searchQuery, sortBy])

  const imageUrl = (item: ClosetItem) =>
    item.image_url ? `${API_BASE_URL}${item.image_url}` : null

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-h1 text-charcoal">Wardrobe</h1>
            <p className="font-body text-gray-500 mt-1">
              {items?.length || 0} items in your collection
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-primary-gold disabled:opacity-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            {isUploading ? 'Uploading...' : 'Add Items'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, colour, brand..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-2 rounded-pill text-xs font-body transition-colors ${
                filterCategory === 'all'
                  ? 'bg-charcoal text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterFavourites(!filterFavourites)}
              className={`px-3 py-2 rounded-pill text-xs font-body transition-colors flex items-center gap-1 ${
                filterFavourites
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Favourites
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(cat.value)}
                className={`px-3 py-2 rounded-pill text-xs font-body transition-colors ${
                  filterCategory === cat.value
                    ? 'bg-charcoal text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Season filters */}
          <div className="flex gap-2 flex-wrap">
            {SEASONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setFilterSeason(s.value)}
                className={`px-3 py-2 rounded-pill text-xs font-body transition-colors ${
                  filterSeason === s.value
                    ? 'bg-charcoal text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {s.label}
              </button>
            ))}
            <button
              onClick={() => setSortBy(sortBy === 'recent' ? 'name' : 'recent')}
              className="px-3 py-2 rounded-pill text-xs font-body bg-white text-gray-600 border border-gray-200 hover:border-gray-300 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5-3L16.5 18m0 0L12 13.5m4.5 4.5V4.5" /></svg>
              {sortBy === 'recent' ? 'Recent' : 'A-Z'}
            </button>
          </div>
          {/* Colour match filters (only if palette exists) */}
          {activePalette && (
            <div className="flex gap-2 flex-wrap">
              {([
                { value: 'all' as const, label: 'All Colours', dot: '' },
                { value: 'great' as const, label: 'In Palette', dot: 'bg-emerald-400' },
                { value: 'avoid' as const, label: 'Off Palette', dot: 'bg-red-400' },
                { value: 'neutral' as const, label: 'Neutrals', dot: 'bg-gray-400' },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterColourMatch(opt.value)}
                  className={`px-3 py-2 rounded-pill text-xs font-body transition-colors flex items-center gap-1.5 ${
                    filterColourMatch === opt.value
                      ? 'bg-charcoal text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {opt.dot && (
                    <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                  )}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Drop zone + Grid */}
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState
            message="Failed to load wardrobe"
            onRetry={() => refetch()}
          />
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`min-h-[200px] rounded-xl transition-colors ${
              dragOver ? 'bg-gold/5 border-2 border-dashed border-gold' : ''
            }`}
          >
            {filteredItems && filteredItems.length === 0 ? (
              <div className="card text-center py-16">
                <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </div>
                <h2 className="font-heading text-h3 text-charcoal mb-2">
                  {searchQuery || filterCategory !== 'all'
                    ? 'No matching items'
                    : 'Start building your wardrobe'}
                </h2>
                <p className="font-body text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                  {searchQuery || filterCategory !== 'all'
                    ? 'Try adjusting your filters or search.'
                    : 'Drag and drop garment photos here, or click the button below. Our AI will automatically tag each item.'}
                </p>
                {!searchQuery && filterCategory === 'all' && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-primary-gold"
                  >
                    Upload Photos
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Upload card */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 hover:border-gold hover:bg-gold/5 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <svg
                    className="w-8 h-8 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  <span className="font-body text-xs text-gray-400">
                    Add photos
                  </span>
                </button>

                {filteredItems?.map((item) => {
                  const colourMatch = activePalette
                    ? matchColourToPalette(item.color, activePalette)
                    : null
                  const matchDisplay = colourMatch
                    ? getMatchDisplay(colourMatch)
                    : null

                  return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-grey-bg relative mb-2">
                      {imageUrl(item) ? (
                        <img
                          src={imageUrl(item)!}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-10 h-10 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                            />
                          </svg>
                        </div>
                      )}
                      {/* Favourite heart */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          updateMutation.mutate({ id: item.id, data: { is_favourite: !item.is_favourite } })
                        }}
                        className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        style={item.is_favourite ? { opacity: 1 } : {}}
                        aria-label={item.is_favourite ? 'Remove from favourites' : 'Add to favourites'}
                      >
                        <svg className={`w-4 h-4 ${item.is_favourite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </button>
                      {/* Colour match + AI tag badges */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                        {item.ai_tagged && (
                          <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5">
                            <span className="text-[10px] font-body font-medium text-gold">
                              AI tagged
                            </span>
                          </div>
                        )}
                        {matchDisplay && matchDisplay.label && (
                          <div className={`${matchDisplay.bgClass} backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${matchDisplay.dotClass}`} />
                            <span className={`text-[10px] font-body font-medium ${matchDisplay.textClass}`}>
                              {matchDisplay.label}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }}
                        className="absolute top-2 left-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-gray-500 hover:text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                    <h3 className="font-body font-semibold text-charcoal text-sm truncate">
                      {item.name}
                    </h3>
                    <p className="font-body text-xs text-gray-400 mt-0.5">
                      {item.color} &middot; {item.category}
                    </p>
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Uploading indicator */}
        {isUploading && (
          <div className="fixed bottom-6 right-6 bg-charcoal text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span className="font-body text-sm">
              Uploading &amp; analysing...
            </span>
          </div>
        )}
      </div>

      {/* Trash section */}
      <TrashSection />

      {/* Item Detail Slide-over */}
      {selectedItem && (
        <ItemDetailPanel
          item={selectedItem}
          palette={activePalette}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleUpdateItem}
          onDelete={() => handleDelete(selectedItem.id)}
        />
      )}
    </AppShell>
  )
}

// --- Trash Section ---

function TrashSection() {
  const [open, setOpen] = useState(false)
  const [trashItems, setTrashItems] = useState<ClosetItem[]>([])
  const [loading, setLoading] = useState(false)

  const loadTrash = async () => {
    if (open) { setOpen(false); return }
    setLoading(true)
    try {
      const { closetApi } = await import('@/lib/api/client')
      const items = await closetApi.listTrash()
      setTrashItems(items)
    } catch { /* ignore */ }
    setLoading(false)
    setOpen(true)
  }

  const handleRestore = async (id: number) => {
    try {
      const { closetApi } = await import('@/lib/api/client')
      await closetApi.restore(id)
      setTrashItems((prev) => prev.filter((i) => i.id !== id))
    } catch { /* ignore */ }
  }

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      <button
        onClick={loadTrash}
        className="font-body text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
        {open ? 'Hide Recently Deleted' : 'Recently Deleted'}
        {trashItems.length > 0 && open && <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{trashItems.length}</span>}
      </button>
      {open && (
        <div className="mt-4">
          {loading ? (
            <p className="font-body text-sm text-gray-400">Loading...</p>
          ) : trashItems.length === 0 ? (
            <p className="font-body text-sm text-gray-400">No deleted items</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {trashItems.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3 opacity-60 hover:opacity-100 transition-opacity">
                  <p className="font-body text-sm text-charcoal truncate">{item.name}</p>
                  <p className="font-body text-xs text-gray-400">{item.category}</p>
                  <button
                    onClick={() => handleRestore(item.id)}
                    className="font-body text-xs text-gold hover:text-gold-light mt-2 font-semibold"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- Item Detail Panel ---

function ItemDetailPanel({
  item,
  palette,
  onClose,
  onUpdate,
  onDelete,
}: {
  item: ClosetItem
  palette: ColourPalette | null
  onClose: () => void
  onUpdate: (id: number, data: ClosetItemUpdate) => void
  onDelete: () => void
}) {
  const colourMatch = palette ? matchColourToPalette(item.color, palette) : null
  const matchDisplay = colourMatch ? getMatchDisplay(colourMatch) : null
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: item.name,
    category: item.category,
    color: item.color,
    pattern: item.pattern,
    formality: item.formality,
    season: item.season,
    fabric: item.fabric,
    brand: item.brand || '',
    size: item.size || '',
    notes: item.notes,
  })

  const imgSrc = item.image_url
    ? `${API_BASE_URL}${item.image_url}`
    : null

  const handleSave = () => {
    onUpdate(item.id, {
      ...form,
      brand: form.brand || undefined,
      size: form.size || undefined,
    })
    setEditing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative w-full max-w-md bg-white shadow-xl overflow-y-auto">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-100"
        >
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image */}
        <div className="aspect-square bg-grey-bg">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {item.ai_tagged && (
                  <span className="inline-block text-[10px] font-body font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                    AI tagged
                  </span>
                )}
                {matchDisplay && matchDisplay.label && (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-body font-medium ${matchDisplay.textClass} ${matchDisplay.bgClass} px-2 py-0.5 rounded-full`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${matchDisplay.dotClass}`} />
                    {matchDisplay.label}
                  </span>
                )}
              </div>
              {!editing ? (
                <>
                  <h2 className="font-heading text-h2 text-charcoal">
                    {item.name}
                  </h2>
                  <p className="font-body text-sm text-gray-500 mt-1">
                    Added{' '}
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </>
              ) : (
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field text-lg font-heading"
                />
              )}
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-outline text-xs px-3 py-1.5"
              >
                Edit
              </button>
            )}
          </div>

          {/* Tags */}
          {!editing ? (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Category', value: item.category },
                { label: 'Colour', value: item.color },
                { label: 'Pattern', value: item.pattern },
                { label: 'Fabric', value: item.fabric },
                { label: 'Season', value: item.season },
                { label: 'Brand', value: item.brand || '—' },
                { label: 'Size', value: item.size || '—' },
              ].map((tag) => (
                <div key={tag.label}>
                  <p className="font-body text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
                    {tag.label}
                  </p>
                  <p className="font-body text-sm text-charcoal capitalize">
                    {tag.value}
                  </p>
                </div>
              ))}
              <div>
                <p className="font-body text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                  Formality
                </p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className={`w-2 h-5 rounded-sm ${
                        n <= item.formality ? 'bg-gold' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label text-xs">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="input-field text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label text-xs">Colour</label>
                  <input
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="input-label text-xs">Pattern</label>
                  <select
                    value={form.pattern}
                    onChange={(e) =>
                      setForm({ ...form, pattern: e.target.value })
                    }
                    className="input-field text-sm"
                  >
                    {[
                      'solid',
                      'striped',
                      'checked',
                      'floral',
                      'printed',
                      'textured',
                      'geometric',
                      'other',
                    ].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label text-xs">Season</label>
                  <select
                    value={form.season}
                    onChange={(e) =>
                      setForm({ ...form, season: e.target.value })
                    }
                    className="input-field text-sm"
                  >
                    {SEASONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label text-xs">Fabric</label>
                  <input
                    value={form.fabric}
                    onChange={(e) =>
                      setForm({ ...form, fabric: e.target.value })
                    }
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="input-label text-xs">Brand</label>
                  <input
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    className="input-field text-sm"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="input-label text-xs">Size</label>
                  <input
                    value={form.size}
                    onChange={(e) =>
                      setForm({ ...form, size: e.target.value })
                    }
                    className="input-field text-sm"
                    placeholder="e.g. M, L, 10, 42"
                  />
                </div>
              </div>
              <div>
                <label className="input-label text-xs">
                  Formality ({form.formality})
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form.formality}
                  onChange={(e) =>
                    setForm({ ...form, formality: parseInt(e.target.value) })
                  }
                  className="w-full accent-gold"
                />
              </div>
              <div>
                <label className="input-label text-xs">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                  className="input-field text-sm min-h-[60px] resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditing(false)}
                  className="btn-outline text-xs px-3 py-1.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary-gold text-xs px-3 py-1.5"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Notes (view mode) */}
          {!editing && item.notes && (
            <div>
              <p className="font-body text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                Notes
              </p>
              <p className="font-body text-sm text-gray-600">{item.notes}</p>
            </div>
          )}

          {/* Actions */}
          {!editing && (
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={onDelete}
                className="font-body text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                Remove from wardrobe
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

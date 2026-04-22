'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit, Save, X, ArrowLeft, Package, ImageIcon, FileArchive, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Drumkit {
  id: string
  name: string
  description: string
  price: number
  producer_name: string
  image_url: string
  file_url: string
  tags: string[]
  sample_count: number
  is_featured: boolean
  is_active: boolean
  stripe_price_id: string
}

interface UploadField {
  uploading: boolean
  error: string
}

export default function AdminDrumkitsPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [drumkits, setDrumkits] = useState<Drumkit[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    producer_name: '',
    image_url: '',
    file_url: '',
    tags: '',
    sample_count: '',
    is_featured: false,
    stripe_price_id: '',
  })

  const [dragActive, setDragActive] = useState({ cover: false, zip: false })
  const [uploadState, setUploadState] = useState<{ cover: UploadField; zip: UploadField }>({
    cover: { uploading: false, error: '' },
    zip: { uploading: false, error: '' },
  })
  // Use counters to handle drag enter/leave firing on child elements
  const dragCounter = useRef({ cover: 0, zip: 0 })
  const coverInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkAdminAndFetch()
  }, [])

  // Prevent browser from navigating to dropped files outside the drop zones
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault()
    document.addEventListener('dragover', prevent)
    document.addEventListener('drop', prevent)
    return () => {
      document.removeEventListener('dragover', prevent)
      document.removeEventListener('drop', prevent)
    }
  }, [])

  const checkAdminAndFetch = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      router.push('/')
      return
    }

    setIsAdmin(true)
    await fetchDrumkits()
    setLoading(false)
  }

  const fetchDrumkits = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('drumkits')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setDrumkits(data)
  }

  // ─── Upload helpers ────────────────────────────────────────────────────────

  const uploadCover = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadState(s => ({ ...s, cover: { uploading: false, error: 'Must be an image file (jpg, png, webp)' } }))
      return
    }
    setUploadState(s => ({ ...s, cover: { uploading: true, error: '' } }))
    const supabase = createClient()
    const safeName = file.name.replace(/\s+/g, '-').toLowerCase()
    const path = `covers/${Date.now()}-${safeName}`

    const { data, error } = await supabase.storage.from('drumkit-covers').upload(path, file)

    if (error) {
      setUploadState(s => ({ ...s, cover: { uploading: false, error: error.message } }))
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('drumkit-covers').getPublicUrl(data.path)
    setForm(f => ({ ...f, image_url: publicUrl }))
    setUploadState(s => ({ ...s, cover: { uploading: false, error: '' } }))
  }

  const uploadZip = async (file: File) => {
    const isZip = file.name.endsWith('.zip') ||
      file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed' ||
      file.type === 'application/octet-stream'
    if (!isZip) {
      setUploadState(s => ({ ...s, zip: { uploading: false, error: 'Must be a .zip file' } }))
      return
    }
    setUploadState(s => ({ ...s, zip: { uploading: true, error: '' } }))

    // Get a signed upload URL from the server (admin client bypasses RLS)
    const urlRes = await fetch('/api/drumkit-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name }),
    })

    if (!urlRes.ok) {
      const { error } = await urlRes.json()
      setUploadState(s => ({ ...s, zip: { uploading: false, error: error ?? 'Failed to get upload URL' } }))
      return
    }

    const { path, token } = await urlRes.json()

    // Upload directly from browser to Supabase storage using the signed URL
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('drumkit-files')
      .uploadToSignedUrl(path, token, file, { contentType: 'application/zip' })

    if (error) {
      setUploadState(s => ({ ...s, zip: { uploading: false, error: error.message } }))
      return
    }

    // Store the storage path (not a URL) — generate signed URLs at download time
    setForm(f => ({ ...f, file_url: data.path }))
    setUploadState(s => ({ ...s, zip: { uploading: false, error: '' } }))
  }

  // ─── Drag event handlers ───────────────────────────────────────────────────

  const onDragEnter = (zone: 'cover' | 'zip') => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current[zone]++
    setDragActive(s => ({ ...s, [zone]: true }))
  }

  const onDragLeave = (zone: 'cover' | 'zip') => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current[zone]--
    if (dragCounter.current[zone] === 0) {
      setDragActive(s => ({ ...s, [zone]: false }))
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDrop = (zone: 'cover' | 'zip') => (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current[zone] = 0
    setDragActive(s => ({ ...s, [zone]: false }))
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (zone === 'cover') uploadCover(file)
    else uploadZip(file)
  }

  const onFileInput = (zone: 'cover' | 'zip') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (zone === 'cover') uploadCover(file)
    else uploadZip(file)
    e.target.value = ''
  }

  // ─── Form handlers ─────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    if (!form.image_url) {
      toast.error('Please upload a cover image before saving.')
      setSaving(false)
      return
    }
    if (!form.file_url) {
      toast.error('Please upload a ZIP file before saving.')
      setSaving(false)
      return
    }

    const supabase = createClient()
    const drumkitData = {
      name: form.name,
      description: form.description,
      price: parseInt(form.price) * 100,
      producer_name: form.producer_name,
      image_url: form.image_url,
      file_url: form.file_url,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      sample_count: parseInt(form.sample_count) || 0,
      is_featured: form.is_featured,
      is_active: true,
      stripe_price_id: form.stripe_price_id,
    }

    if (editingId) {
      const { error } = await supabase.from('drumkits').update(drumkitData).eq('id', editingId)
      if (error) {
        toast.error(`Failed to update: ${error.message}`)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase.from('drumkits').insert(drumkitData)
      if (error) {
        toast.error(`Failed to save: ${error.message}`)
        setSaving(false)
        return
      }
    }

    await fetchDrumkits()
    resetForm()
    setSaving(false)
  }

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      producer_name: '',
      image_url: '',
      file_url: '',
      tags: '',
      sample_count: '',
      is_featured: false,
      stripe_price_id: '',
    })
    setUploadState({
      cover: { uploading: false, error: '' },
      zip: { uploading: false, error: '' },
    })
    dragCounter.current = { cover: 0, zip: 0 }
    setDragActive({ cover: false, zip: false })
    setShowForm(false)
    setEditingId(null)
  }

  const editDrumkit = (kit: Drumkit) => {
    setForm({
      name: kit.name,
      description: kit.description || '',
      price: String(kit.price / 100),
      producer_name: kit.producer_name,
      image_url: kit.image_url || '',
      file_url: kit.file_url || '',
      tags: kit.tags?.join(', ') || '',
      sample_count: String(kit.sample_count || 0),
      is_featured: kit.is_featured,
      stripe_price_id: kit.stripe_price_id || '',
    })
    setUploadState({
      cover: { uploading: false, error: '' },
      zip: { uploading: false, error: '' },
    })
    setEditingId(kit.id)
    setShowForm(true)
  }

  const deleteDrumkit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this drumkit?')) return
    const supabase = createClient()

    const kit = drumkits.find(k => k.id === id)

    const { error } = await supabase.from('drumkits').delete().eq('id', id)
    if (error) {
      toast.error(`Failed to delete: ${error.message}`)
      return
    }

    if (kit?.image_url) {
      const coverPath = kit.image_url.split('/drumkit-covers/')[1]
      if (coverPath) await supabase.storage.from('drumkit-covers').remove([coverPath])
    }

    if (kit?.file_url) {
      await supabase.storage.from('drumkit-files').remove([kit.file_url])
    }

    await fetchDrumkits()
  }

  const toggleActive = async (id: string, currentState: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from('drumkits').update({ is_active: !currentState }).eq('id', id)
    if (error) toast.error(`Failed to update status: ${error.message}`)
    await fetchDrumkits()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#22C55E] border-t-transparent" />
          <span className="text-[#666]">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#1a1a1a] bg-black/80 backdrop-blur-lg px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111] text-[#666] hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Drumkit Manager</h1>
            <p className="text-sm text-[#666]">Add and manage producer drumkits</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-2xl bg-[#22C55E] px-5 py-3 font-medium text-black transition-all hover:bg-[#16A34A]"
        >
          <Plus className="h-5 w-5" />
          Add Drumkit
        </button>
      </header>

      <main className="p-6">
        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-[#0a0a0a] border border-[#1a1a1a] p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{editingId ? 'Edit Drumkit' : 'Add New Drumkit'}</h2>
                <button onClick={resetForm} className="text-[#666] hover:text-white">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#666] mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl bg-[#111] border border-[#222] px-4 py-3 text-white focus:border-[#22C55E] focus:outline-none"
                      placeholder="Vintage Soul Drums Vol.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#666] mb-2">Producer Name *</label>
                    <input
                      type="text"
                      required
                      value={form.producer_name}
                      onChange={e => setForm({ ...form, producer_name: e.target.value })}
                      className="w-full rounded-xl bg-[#111] border border-[#222] px-4 py-3 text-white focus:border-[#22C55E] focus:outline-none"
                      placeholder="HILLBOY"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#666] mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl bg-[#111] border border-[#222] px-4 py-3 text-white focus:border-[#22C55E] focus:outline-none resize-none"
                    placeholder="Premium drum samples for hip-hop and lo-fi production..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#666] mb-2">Price (USD) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      className="w-full rounded-xl bg-[#111] border border-[#222] px-4 py-3 text-white focus:border-[#22C55E] focus:outline-none"
                      placeholder="29"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#666] mb-2">Sample Count</label>
                    <input
                      type="number"
                      min="0"
                      value={form.sample_count}
                      onChange={e => setForm({ ...form, sample_count: e.target.value })}
                      className="w-full rounded-xl bg-[#111] border border-[#222] px-4 py-3 text-white focus:border-[#22C55E] focus:outline-none"
                      placeholder="150"
                    />
                  </div>
                </div>

                {/* Cover Image Drop Zone */}
                <div>
                  <label className="block text-sm text-[#666] mb-2">Cover Image</label>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileInput('cover')}
                  />
                  <div
                    onClick={() => !uploadState.cover.uploading && coverInputRef.current?.click()}
                    onDragEnter={onDragEnter('cover')}
                    onDragLeave={onDragLeave('cover')}
                    onDragOver={onDragOver}
                    onDrop={onDrop('cover')}
                    className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition-colors cursor-pointer select-none ${
                      uploadState.cover.uploading
                        ? 'border-[#22C55E]/40 bg-[#22C55E]/5 cursor-wait'
                        : dragActive.cover
                        ? 'border-[#22C55E] bg-[#22C55E]/10'
                        : form.image_url
                        ? 'border-[#22C55E]/40 bg-[#111]'
                        : 'border-[#333] bg-[#111] hover:border-[#444]'
                    }`}
                  >
                    {uploadState.cover.uploading ? (
                      <>
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#22C55E] border-t-transparent" />
                        <span className="text-sm text-[#666]">Uploading to drumkit-covers…</span>
                      </>
                    ) : form.image_url ? (
                      <div className="flex items-center gap-3 w-full">
                        <img
                          src={form.image_url}
                          alt="cover preview"
                          className="h-14 w-14 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[#22C55E] text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            Uploaded
                          </div>
                          <p className="text-xs text-[#555] truncate mt-0.5">{form.image_url}</p>
                        </div>
                        <span className="text-xs text-[#555] shrink-0">Drop to replace</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-7 w-7 text-[#444]" />
                        <div className="text-center">
                          <p className="text-sm text-[#888]">
                            {dragActive.cover ? 'Release to upload' : 'Drop cover image or click to browse'}
                          </p>
                          <p className="text-xs text-[#555] mt-0.5">jpg, png, webp → drumkit-covers bucket</p>
                        </div>
                      </>
                    )}
                    {uploadState.cover.error && (
                      <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {uploadState.cover.error}
                      </div>
                    )}
                  </div>
                </div>

                {/* Zip File Drop Zone */}
                <div>
                  <label className="block text-sm text-[#666] mb-2">Drumkit ZIP File</label>
                  <input
                    ref={zipInputRef}
                    type="file"
                    accept=".zip,application/zip,application/x-zip-compressed"
                    className="hidden"
                    onChange={onFileInput('zip')}
                  />
                  <div
                    onClick={() => !uploadState.zip.uploading && zipInputRef.current?.click()}
                    onDragEnter={onDragEnter('zip')}
                    onDragLeave={onDragLeave('zip')}
                    onDragOver={onDragOver}
                    onDrop={onDrop('zip')}
                    className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition-colors cursor-pointer select-none ${
                      uploadState.zip.uploading
                        ? 'border-[#22C55E]/40 bg-[#22C55E]/5 cursor-wait'
                        : dragActive.zip
                        ? 'border-[#22C55E] bg-[#22C55E]/10'
                        : form.file_url
                        ? 'border-[#22C55E]/40 bg-[#111]'
                        : 'border-[#333] bg-[#111] hover:border-[#444]'
                    }`}
                  >
                    {uploadState.zip.uploading ? (
                      <>
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#22C55E] border-t-transparent" />
                        <span className="text-sm text-[#666]">Uploading to drumkit-files…</span>
                      </>
                    ) : form.file_url ? (
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#1a1a1a] shrink-0">
                          <FileArchive className="h-7 w-7 text-[#22C55E]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[#22C55E] text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            Uploaded
                          </div>
                          <p className="text-xs text-[#555] truncate mt-0.5">{form.file_url}</p>
                        </div>
                        <span className="text-xs text-[#555] shrink-0">Drop to replace</span>
                      </div>
                    ) : (
                      <>
                        <FileArchive className="h-7 w-7 text-[#444]" />
                        <div className="text-center">
                          <p className="text-sm text-[#888]">
                            {dragActive.zip ? 'Release to upload' : 'Drop .zip file or click to browse'}
                          </p>
                          <p className="text-xs text-[#555] mt-0.5">.zip only → drumkit-files bucket (private)</p>
                        </div>
                      </>
                    )}
                    {uploadState.zip.error && (
                      <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {uploadState.zip.error}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[#666] mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={e => setForm({ ...form, tags: e.target.value })}
                    className="w-full rounded-xl bg-[#111] border border-[#222] px-4 py-3 text-white focus:border-[#22C55E] focus:outline-none"
                    placeholder="drums, hip-hop, lo-fi, vintage"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#666] mb-2">Stripe Price ID</label>
                  <input
                    type="text"
                    value={form.stripe_price_id}
                    onChange={e => setForm({ ...form, stripe_price_id: e.target.value })}
                    className="w-full rounded-xl bg-[#111] border border-[#222] px-4 py-3 text-white focus:border-[#22C55E] focus:outline-none"
                    placeholder="price_xxx"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.is_featured}
                    onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                    className="h-5 w-5 rounded border-[#222] bg-[#111] text-[#22C55E] focus:ring-[#22C55E]"
                  />
                  <label htmlFor="featured" className="text-sm">Mark as Featured</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 rounded-2xl bg-[#111] border border-[#222] py-3 font-medium hover:bg-[#1a1a1a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadState.cover.uploading || uploadState.zip.uploading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#22C55E] py-3 font-medium text-black hover:bg-[#16A34A] transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        {editingId ? 'Update' : 'Save'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Drumkits Table */}
        <div className="rounded-3xl bg-[#0a0a0a] border border-[#1a1a1a] overflow-hidden">
          {drumkits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#111] border border-[#222] mb-4">
                <Package className="h-10 w-10 text-[#444]" />
              </div>
              <p className="text-lg font-medium mb-2">No drumkits yet</p>
              <p className="text-[#666] mb-6">Add your first drumkit to start selling</p>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-2xl bg-[#22C55E] px-5 py-3 font-medium text-black"
              >
                <Plus className="h-5 w-5" />
                Add Drumkit
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a1a]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#666] uppercase tracking-wider">Drumkit</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#666] uppercase tracking-wider">Producer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#666] uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#666] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-[#666] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {drumkits.map(kit => (
                  <tr key={kit.id} className="hover:bg-[#111] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {kit.image_url ? (
                          <img src={kit.image_url} alt={kit.name} className="h-12 w-12 rounded-xl object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111] border border-[#222]">
                            <Package className="h-6 w-6 text-[#444]" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{kit.name}</p>
                          <p className="text-sm text-[#666]">{kit.sample_count} samples</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#999]">{kit.producer_name}</td>
                    <td className="px-6 py-4">
                      <span className="text-[#22C55E] font-mono">${(kit.price / 100).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(kit.id, kit.is_active)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          kit.is_active
                            ? 'bg-[#22C55E]/10 text-[#22C55E]'
                            : 'bg-[#666]/10 text-[#666]'
                        }`}
                      >
                        {kit.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => editDrumkit(kit)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111] text-[#666] hover:text-white transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteDrumkit(kit.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111] text-[#666] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

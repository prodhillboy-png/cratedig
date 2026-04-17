'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit, Save, X, Upload, ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  })

  useEffect(() => {
    checkAdminAndFetch()
  }, [])

  const checkAdminAndFetch = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if user is admin
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const drumkitData = {
      name: form.name,
      description: form.description,
      price: parseInt(form.price) * 100, // Convert to cents
      producer_name: form.producer_name,
      image_url: form.image_url,
      file_url: form.file_url,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      sample_count: parseInt(form.sample_count) || 0,
      is_featured: form.is_featured,
      is_active: true,
    }

    if (editingId) {
      await supabase
        .from('drumkits')
        .update(drumkitData)
        .eq('id', editingId)
    } else {
      await supabase
        .from('drumkits')
        .insert(drumkitData)
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
    })
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
    })
    setEditingId(kit.id)
    setShowForm(true)
  }

  const deleteDrumkit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this drumkit?')) return
    
    const supabase = createClient()
    await supabase.from('drumkits').delete().eq('id', id)
    await fetchDrumkits()
  }

  const toggleActive = async (id: string, currentState: boolean) => {
    const supabase = createClient()
    await supabase
      .from('drumkits')
      .update({ is_active: !currentState })
      .eq('id', id)
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

                <div>
                  <label className="block text-sm text-[#666] mb-2">Image URL</label>
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={e => setForm({ ...form, image_url: e.target.value })}
                    className="w-full rounded-xl bg-[#111] border border-[#222] px-4 py-3 text-white focus:border-[#22C55E] focus:outline-none"
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#666] mb-2">Download File URL</label>
                  <input
                    type="url"
                    value={form.file_url}
                    onChange={e => setForm({ ...form, file_url: e.target.value })}
                    className="w-full rounded-xl bg-[#111] border border-[#222] px-4 py-3 text-white focus:border-[#22C55E] focus:outline-none"
                    placeholder="https://example.com/drumkit.zip"
                  />
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
                    disabled={saving}
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

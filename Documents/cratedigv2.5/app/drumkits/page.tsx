'use client'

import { useState, useEffect } from 'react'
import { Disc3, ShoppingCart, Play, ArrowLeft, Search, Filter, ChevronDown, Sun, Moon, Package } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface Drumkit {
  id: string
  name: string
  description: string
  price: number
  producer_name: string
  image_url: string
  tags: string[]
  sample_count: number
  is_featured: boolean
  downloads: number
}

const CATEGORIES = ['All', 'Soul', 'Lo-Fi', 'Trap', 'Jazz', 'Funk', 'Techno', 'Hip Hop', 'R&B', 'Drums', 'Vintage']
const SORT_OPTIONS = ['Popular', 'Newest', 'Price: Low to High', 'Price: High to Low']

export default function DrumkitsPage() {
  const [isDark, setIsDark] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Popular')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [drumkits, setDrumkits] = useState<Drumkit[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [purchases, setPurchases] = useState<string[]>([])
  const [purchasedKits, setPurchasedKits] = useState<{ id: string; name: string; image_url: string }[]>([])
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [checkingOut, setCheckingOut] = useState<string | null>(null)

  useEffect(() => {
    fetchDrumkits()
  }, [sortBy])

  const fetchDrumkits = async () => {
    const supabase = createClient()
    let query = supabase
      .from('drumkits')
      .select('*')
      .eq('is_active', true)

    // Apply sorting
    switch (sortBy) {
      case 'Newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'Price: Low to High':
        query = query.order('price', { ascending: true })
        break
      case 'Price: High to Low':
        query = query.order('price', { ascending: false })
        break
      default: // Popular
        query = query.order('downloads', { ascending: false })
    }

    const { data } = await query
    if (data) setDrumkits(data)
    setLoading(false)
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchPurchases(user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchPurchases(session.user.id)
      else { setPurchases([]); setPurchasedKits([]) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchPurchases = async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('purchases')
      .select('drumkit_id, drumkits(id, name, image_url)')
      .eq('user_id', userId)
    if (data) {
      setPurchases(data.map(p => p.drumkit_id))
      setPurchasedKits(data.map(p => (p.drumkits as unknown as { id: string; name: string; image_url: string })))
    }
  }

  useEffect(() => {
    if (!showAccountDropdown) return
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-account-dropdown]')) setShowAccountDropdown(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [showAccountDropdown])

  const filteredKits = drumkits.filter(kit => {
    const matchesCategory = selectedCategory === 'All' || kit.tags?.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()))
    const matchesSearch = kit.name.toLowerCase().includes(searchQuery.toLowerCase()) || kit.producer_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleBuy = async (drumkitId: string) => {
    if (!user) {
      window.location.href = '/auth/login'
      return
    }
    if (purchases.includes(drumkitId)) return
    setCheckingOut(drumkitId)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drumkit_id: drumkitId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error ?? 'Checkout failed')
        setCheckingOut(null)
      }
    } catch {
      toast.error('Network error — please try again')
      setCheckingOut(null)
    }
  }

  const handleDownload = (drumkitId: string) => {
    window.location.href = `/api/download?drumkit_id=${drumkitId}`
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setShowAccountDropdown(false)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#fafafa]'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-5 md:px-10 backdrop-blur-xl border-b ${
        isDark ? 'bg-black/80 border-[#1a1a1a]' : 'bg-white/80 border-[#e5e5e5]'
      }`}>
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#22C55E] shadow-lg shadow-[#22C55E]/20 transition-transform group-hover:scale-105">
              <Disc3 className="h-5 w-5 text-black" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>CrateDig</span>
          </Link>
          <span className={isDark ? 'text-[#333]' : 'text-[#ccc]'}>/</span>
          <span className={`font-medium ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>Drumkits</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className={`hidden md:flex items-center gap-2 text-sm transition-all duration-300 ${isDark ? 'text-[#666] hover:text-white' : 'text-[#999] hover:text-black'}`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Digging
          </Link>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
              isDark 
                ? 'bg-[#111] text-[#999] hover:bg-[#1a1a1a] hover:text-white'
                : 'bg-white text-[#666] hover:bg-[#f5f5f5] hover:text-black border border-[#e5e5e5]'
            }`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <div className="relative" data-account-dropdown>
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22C55E] text-black text-sm font-bold transition-all duration-300"
              >
                {user.email?.[0].toUpperCase()}
              </button>
              {showAccountDropdown && (
                <div className={`absolute right-0 top-full mt-2 w-72 rounded-2xl p-3 shadow-2xl z-50 ${
                  isDark ? 'bg-[#111] border border-[#222]' : 'bg-white border border-[#e5e5e5]'
                }`}>
                  <p className={`text-xs px-2 pb-2 mb-2 border-b truncate ${isDark ? 'text-[#666] border-[#222]' : 'text-[#999] border-[#e5e5e5]'}`}>
                    {user.email}
                  </p>
                  <p className={`text-xs font-semibold px-2 mb-2 uppercase tracking-wider ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>
                    Downloads
                  </p>
                  {purchasedKits.length === 0 ? (
                    <p className={`text-sm px-2 py-3 ${isDark ? 'text-[#555]' : 'text-[#aaa]'}`}>No purchases yet.</p>
                  ) : (
                    <div className="space-y-1 mb-2">
                      {purchasedKits.map(kit => (
                        <div key={kit.id} className={`flex items-center gap-3 rounded-xl px-2 py-2 ${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-[#f5f5f5]'}`}>
                          {kit.image_url ? (
                            <img src={kit.image_url} alt={kit.name} className="h-9 w-9 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className={`h-9 w-9 rounded-lg shrink-0 flex items-center justify-center ${isDark ? 'bg-[#222]' : 'bg-[#eee]'}`}>
                              <Package className="h-4 w-4 text-[#666]" />
                            </div>
                          )}
                          <span className={`text-sm flex-1 truncate ${isDark ? 'text-white' : 'text-black'}`}>{kit.name}</span>
                          <button
                            onClick={() => handleDownload(kit.id)}
                            className="text-xs text-[#22C55E] hover:underline shrink-0"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handleSignOut}
                    className={`w-full text-left text-sm px-2 py-2 rounded-xl transition-colors ${isDark ? 'text-[#666] hover:text-white hover:bg-[#1a1a1a]' : 'text-[#999] hover:text-black hover:bg-[#f5f5f5]'}`}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/auth/login"
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                isDark ? 'bg-[#111] border border-[#222] hover:bg-[#1a1a1a]' : 'bg-white border border-[#e5e5e5] hover:bg-[#f5f5f5]'
              }`}
            >
              Sign In
            </a>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 md:px-10 md:py-24 text-center">
        <h1 className={`text-4xl md:text-6xl font-bold tracking-tight mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
          Premium <span className="text-[#22C55E]">Drumkits</span>
        </h1>
        <p className={`text-lg max-w-xl mx-auto mb-10 ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>
          Handcrafted drum samples from top producers. Elevate your production with industry-quality sounds.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative mb-8">
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-[#666]' : 'text-[#999]'}`} />
          <input
            type="text"
            placeholder="Search drumkits or producers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-2xl py-4 pl-14 pr-6 outline-none transition-all duration-300 focus:ring-2 focus:ring-[#22C55E]/20 ${
              isDark 
                ? 'bg-[#111] border border-[#222] text-white placeholder-[#666] focus:border-[#22C55E]'
                : 'bg-white border border-[#e5e5e5] text-black placeholder-[#999] focus:border-[#22C55E]'
            }`}
          />
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 md:px-10 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-[#22C55E] text-black'
                    : isDark 
                      ? 'bg-[#111] text-[#999] hover:bg-[#1a1a1a] hover:text-white border border-[#222]'
                      : 'bg-white text-[#666] hover:bg-[#f5f5f5] hover:text-black border border-[#e5e5e5]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                isDark 
                  ? 'bg-[#111] border border-[#222] text-[#999] hover:bg-[#1a1a1a] hover:text-white'
                  : 'bg-white border border-[#e5e5e5] text-[#666] hover:bg-[#f5f5f5] hover:text-black'
              }`}
            >
              <Filter className="h-4 w-4" />
              {sortBy}
              <ChevronDown className={`h-4 w-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showSortDropdown && (
              <div className={`absolute right-0 top-full mt-2 w-48 rounded-2xl p-2 shadow-2xl z-50 ${
                isDark ? 'bg-[#111] border border-[#222]' : 'bg-white border border-[#e5e5e5]'
              }`}>
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option)
                      setShowSortDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      sortBy === option
                        ? 'bg-[#22C55E] text-black font-medium'
                        : isDark 
                          ? 'text-[#999] hover:bg-[#1a1a1a] hover:text-white'
                          : 'text-[#666] hover:bg-[#f5f5f5] hover:text-black'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Drumkits Grid */}
      <section className="px-6 md:px-10 pb-20">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`rounded-3xl overflow-hidden ${isDark ? 'bg-[#0a0a0a] border border-[#1a1a1a]' : 'bg-white border border-[#e5e5e5]'}`}>
                <div className={`aspect-square animate-pulse ${isDark ? 'bg-[#111]' : 'bg-[#f5f5f5]'}`} />
                <div className="p-6 space-y-4">
                  <div className={`h-6 rounded-lg animate-pulse ${isDark ? 'bg-[#111]' : 'bg-[#f5f5f5]'}`} />
                  <div className={`h-4 w-1/2 rounded-lg animate-pulse ${isDark ? 'bg-[#111]' : 'bg-[#f5f5f5]'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredKits.length === 0 ? (
          <div className="text-center py-20">
            <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${isDark ? 'bg-[#111] border border-[#222]' : 'bg-[#f5f5f5] border border-[#e5e5e5]'} mb-6`}>
              <Package className={`h-12 w-12 ${isDark ? 'text-[#444]' : 'text-[#ccc]'}`} />
            </div>
            <p className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-black'}`}>No drumkits found</p>
            <p className={isDark ? 'text-[#666]' : 'text-[#999]'}>
              {drumkits.length === 0 ? 'Check back soon for new releases!' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredKits.map((kit) => (
              <div
                key={kit.id}
                className={`group rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#22C55E]/5 ${
                  isDark 
                    ? 'bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333]'
                    : 'bg-white border border-[#e5e5e5] hover:border-[#ccc]'
                }`}
              >
                {/* Image */}
                <div className={`relative aspect-square flex items-center justify-center ${
                  isDark ? 'bg-gradient-to-br from-[#111] to-[#0a0a0a]' : 'bg-gradient-to-br from-[#f5f5f5] to-white'
                }`}>
                  {kit.image_url ? (
                    <img src={kit.image_url} alt={kit.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl opacity-20">
                      <Disc3 className="h-24 w-24 text-[#22C55E]" />
                    </div>
                  )}
                  {kit.is_featured && (
                    <span className="absolute top-4 left-4 rounded-full bg-[#22C55E] px-3 py-1 text-xs font-bold text-black">
                      Featured
                    </span>
                  )}
                  <button className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E] text-black opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-[#16A34A] hover:scale-110">
                    <Play className="h-5 w-5 ml-0.5" />
                  </button>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`font-bold text-lg mb-1 group-hover:text-[#22C55E] transition-colors ${isDark ? 'text-white' : 'text-black'}`}>{kit.name}</h3>
                      <p className={`text-sm ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>by {kit.producer_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`text-sm ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>{kit.sample_count || 0} samples</span>
                    {kit.downloads > 0 && (
                      <span className={`text-sm ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>{kit.downloads} downloads</span>
                    )}
                  </div>
                  
                  {kit.tags && kit.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {kit.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className={`rounded-full px-3 py-1 text-xs ${
                          isDark 
                            ? 'bg-[#111] border border-[#222] text-[#999]'
                            : 'bg-[#f5f5f5] border border-[#e5e5e5] text-[#666]'
                        }`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#22C55E]">${(kit.price / 100).toFixed(2)}</span>
                    <button
                      onClick={() => purchases.includes(kit.id) ? handleDownload(kit.id) : handleBuy(kit.id)}
                      disabled={checkingOut === kit.id}
                      className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition-all duration-300 ${
                        purchases.includes(kit.id)
                          ? 'bg-[#22C55E] text-black hover:bg-[#16A34A]'
                          : checkingOut === kit.id
                          ? isDark ? 'bg-[#1a1a1a] text-[#666] cursor-wait' : 'bg-[#f5f5f5] text-[#999] cursor-wait'
                          : 'bg-[#22C55E] text-black hover:bg-[#16A34A] active:scale-95'
                      }`}
                    >
                      {purchases.includes(kit.id) ? (
                        'Download'
                      ) : checkingOut === kit.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#666] border-t-transparent" />
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          Buy Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className={`flex flex-col items-center gap-3 pb-8 text-sm border-t pt-8 ${
        isDark ? 'text-[#333] border-[#1a1a1a]' : 'text-[#ccc] border-[#e5e5e5]'
      }`}>
        <div className="flex items-center gap-2">
          <span>crafted by</span>
          <span className={`font-semibold ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>Hillboy</span>
        </div>
        <Link 
          href="/privacy-policy" 
          className={`text-xs font-mono transition-colors ${isDark ? 'text-[#444] hover:text-[#22C55E]' : 'text-[#999] hover:text-[#22C55E]'}`}
        >
          Privacy Policy
        </Link>
      </footer>
    </div>
  )
}

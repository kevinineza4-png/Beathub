export const songs = [
  {
    id: 1,
    title: 'Midnight Pulse',
    artist: 'Mina Sol',
    album: 'Neon Nights',
    genre: 'Afrobeats',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
    duration: '3:42',
    likes: 18500,
    downloads: 2600,
    views: 42000,
    featured: true,
  },
  {
    id: 2,
    title: 'Ocean Echo',
    artist: 'Kairo Lane',
    album: 'Blue Horizon',
    genre: 'Pop',
    cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80',
    duration: '4:12',
    likes: 13200,
    downloads: 1450,
    views: 28900,
    featured: true,
  },
  {
    id: 3,
    title: 'Sunset Drive',
    artist: 'Nia Brooks',
    album: 'Afterglow',
    genre: 'R&B',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80',
    duration: '3:28',
    likes: 9800,
    downloads: 1100,
    views: 21400,
    featured: false,
  },
  {
    id: 4,
    title: 'City Lights',
    artist: 'The Jae Project',
    album: 'Night Shift',
    genre: 'Hip Hop',
    cover: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    duration: '2:58',
    likes: 12300,
    downloads: 1700,
    views: 30300,
    featured: false,
  },
]

export const artists = [
  {
    id: 1,
    name: 'Mina Sol',
    genre: 'Afrobeats',
    followers: '120k',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 2,
    name: 'Kairo Lane',
    genre: 'Pop',
    followers: '84k',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 3,
    name: 'Nia Brooks',
    genre: 'R&B',
    followers: '67k',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
  },
]

export const albums = [
  {
    id: 1,
    title: 'Neon Nights',
    artist: 'Mina Sol',
    genre: 'Afrobeats',
    year: '2024',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    songs: 12,
  },
  {
    id: 2,
    title: 'Blue Horizon',
    artist: 'Kairo Lane',
    genre: 'Pop',
    year: '2025',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
    songs: 10,
  },
  {
    id: 3,
    title: 'Afterglow',
    artist: 'Nia Brooks',
    genre: 'R&B',
    year: '2023',
    cover: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=600&q=80',
    songs: 9,
  },
]

export const videos = [
  {
    id: 1,
    title: 'Midnight Pulse Live',
    artist: 'Mina Sol',
    views: '89k',
    cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    title: 'Blue Horizon Visual',
    artist: 'Kairo Lane',
    views: '64k',
    cover: 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=600&q=80',
  },
]

export const playlists = [
  {
    id: 1,
    title: 'Late Night Vibes',
    tracks: 18,
    owner: 'Alicia',
  },
  {
    id: 2,
    title: 'Focus Flow',
    tracks: 12,
    owner: 'Noah',
  },
]

export const genres = ['Hip Hop', 'Afrobeats', 'R&B', 'Pop', 'Gospel', 'Jazz', 'Reggae', 'Amapiano']

export const testimonials = [
  {
    quote: 'BeatHub feels premium, fast, and incredibly easy to discover fresh music.',
    author: 'A. Mukiza',
  },
  {
    quote: 'The curated collections and polished player make every listening session feel special.',
    author: 'D. Niyonsenga',
  },
]

export const stats = [
  { label: 'Active listeners', value: '1.2M' },
  { label: 'Songs in catalog', value: '320K+' },
  { label: 'Artists onboarded', value: '18K' },
]

export const quickLinks = [
  { label: 'Home', route: 'home' },
  { label: 'Explore', route: 'explore' },
  { label: 'Artists', route: 'artists' },
  { label: 'Albums', route: 'albums' },
  { label: 'Privacy', route: 'privacy' },
  { label: 'Terms', route: 'terms' },
]

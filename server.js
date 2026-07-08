import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'

const app = express()
const port = process.env.PORT || 3001
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataFile = path.join(__dirname, 'backend', 'data.json')
const uploadsDir = path.join(__dirname, 'uploads')
fs.mkdirSync(uploadsDir, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, '-')
      cb(null, `${Date.now()}-${safeName}`)
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'cover') {
      cb(null, file.mimetype.startsWith('image/'))
      return
    }
    if (file.fieldname === 'avatar') {
      cb(null, file.mimetype.startsWith('image/'))
      return
    }
    cb(null, file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/'))
  },
})

const defaultData = {
  users: [
    { id: 1, name: 'Kevin Ineza', email: 'kevinineza4@gmail.com', password: 'kevin123', role: 'admin' },
    { id: 2, name: 'Artist Demo', email: 'artist@beathub.com', password: 'artist123', role: 'artist' },
    { id: 3, name: 'User Demo', email: 'user@beathub.com', password: 'user123', role: 'user' },
  ],
  songs: [
    {
      id: 1,
      title: 'Midnight Pulse',
      artist: 'Mina Sol',
      artistId: 2,
      album: 'Neon Nights',
      genre: 'Afrobeats',
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
      duration: '3:42',
      likes: 18500,
      downloads: 2600,
      description: 'A slick Afro-pop anthem with a deep bassline.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
      id: 2,
      title: 'Ocean Echo',
      artist: 'Kairo Lane',
      artistId: 2,
      album: 'Blue Horizon',
      genre: 'Pop',
      cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80',
      duration: '4:12',
      likes: 13200,
      downloads: 1450,
      description: 'A bright and uplifting pop single.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
  ],
  artists: [
    { id: 1, name: 'Mina Sol', genre: 'Afrobeats', followers: '120k', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80' },
    { id: 2, name: 'Kairo Lane', genre: 'Pop', followers: '84k', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80' },
  ],
  albums: [
    { id: 1, title: 'Neon Nights', artist: 'Mina Sol', genre: 'Afrobeats', year: '2024', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80', songs: 12 },
    { id: 2, title: 'Blue Horizon', artist: 'Kairo Lane', genre: 'Pop', year: '2025', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80', songs: 10 },
  ],
  genres: ['Hip Hop', 'Afrobeats', 'R&B', 'Pop', 'Gospel', 'Jazz', 'Reggae', 'Amapiano'],
  playlists: [
    { id: 1, title: 'Late Night Vibes', tracks: 18, owner: 'Alicia' },
    { id: 2, title: 'Focus Flow', tracks: 12, owner: 'Noah' },
  ],
  downloads: [],
  reports: [],
  activities: [{ id: 1, text: 'Admin opened BeatHub' }],
}

function ensureDataFile() {
  if (!fs.existsSync(dataFile)) {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true })
    fs.writeFileSync(dataFile, JSON.stringify(defaultData, null, 2))
  }
}

function loadData() {
  ensureDataFile()
  const raw = fs.readFileSync(dataFile, 'utf8')
  return JSON.parse(raw)
}

function saveData(store) {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2))
}

function normalizeRole(role) {
  return role === 'listener' ? 'user' : role
}

function normalizeStore(store) {
  if (!Array.isArray(store.users)) {
    store.users = []
  }

  const adminIndex = store.users.findIndex((item) => item.role === 'admin')
  const adminUser = {
    id: 1,
    name: 'Kevin Ineza',
    email: 'kevinineza4@gmail.com',
    password: 'kevin123',
    role: 'admin',
  }

  if (adminIndex >= 0) {
    store.users[adminIndex] = { ...store.users[adminIndex], ...adminUser }
  } else {
    store.users.unshift(adminUser)
  }

  store.users = store.users.map((user) => ({
    ...user,
    role: normalizeRole(user.role),
    profileImage: user.profileImage || '',
    resetCode: user.resetCode || '',
    resetCodeExpiry: user.resetCodeExpiry || null,
  }))

  if (!Array.isArray(store.songs)) store.songs = defaultData.songs
  if (!Array.isArray(store.artists)) store.artists = defaultData.artists
  if (!Array.isArray(store.albums)) store.albums = defaultData.albums
  if (!Array.isArray(store.genres)) store.genres = defaultData.genres
  if (!Array.isArray(store.playlists)) store.playlists = defaultData.playlists
  if (!Array.isArray(store.downloads)) store.downloads = []
  if (!Array.isArray(store.reports)) store.reports = []
  if (!Array.isArray(store.activities)) store.activities = defaultData.activities

  return store
}

function createResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

let store = normalizeStore(loadData())

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(uploadsDir))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/ping', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body
  const normalizedRole = normalizeRole(role)
  const user = store.users.find((item) => item.email === email && item.password === password)
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const storedRole = normalizeRole(user.role)
  if (normalizedRole === 'admin' && storedRole !== 'admin') {
    return res.status(403).json({ message: 'This account is not assigned to that role' })
  }
  if (normalizedRole === 'artist' && storedRole !== 'artist') {
    return res.status(403).json({ message: 'This account is not assigned to that role' })
  }
  if (normalizedRole === 'user' && storedRole !== 'user') {
    return res.status(403).json({ message: 'This account is not assigned to that role' })
  }

  user.role = storedRole
  store.activities.unshift({ id: Date.now(), text: `${user.name} signed in` })
  saveData(store)
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage || '' } })
})

app.post('/api/auth/admin/login', (req, res) => {
  const { email, password } = req.body
  const admin = store.users.find((item) => item.email === 'kevinineza4@gmail.com' && item.password === 'kevin123')
  if (!admin || email !== admin.email || password !== admin.password) {
    return res.status(401).json({ message: 'Admin credentials are invalid' })
  }
  store.activities.unshift({ id: Date.now(), text: 'Admin portal accessed' })
  saveData(store)
  res.json({ user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, profileImage: admin.profileImage || '' } })
})

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body
  const admin = store.users.find((item) => item.email === 'kevinineza4@gmail.com' && item.password === 'kevin123')
  if (!admin || email !== admin.email || password !== admin.password) {
    return res.status(401).json({ message: 'Admin credentials are invalid' })
  }
  store.activities.unshift({ id: Date.now(), text: 'Admin portal accessed' })
  saveData(store)
  res.json({ user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, profileImage: admin.profileImage || '' } })
})

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'user' } = req.body
  const normalizedRole = normalizeRole(role)
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' })
  }
  const duplicate = store.users.find((item) => item.email === email)
  if (duplicate) {
    return res.status(409).json({ message: 'Email already registered' })
  }
  const user = { id: Date.now(), name, email, password, role: normalizedRole, profileImage: '', resetCode: '', resetCodeExpiry: null }
  store.users.push(user)
  store.activities.unshift({ id: Date.now() + 1, text: `${user.name} registered` })
  saveData(store)
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage || '' } })
})

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body
  const user = store.users.find((item) => item.email === email)
  if (!user) {
    return res.status(404).json({ message: 'No account found for that email' })
  }
  const code = createResetCode()
  user.resetCode = code
  user.resetCodeExpiry = Date.now() + 15 * 60 * 1000
  saveData(store)
  res.json({ message: 'Reset code generated', code })
})

app.post('/api/auth/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body
  const user = store.users.find((item) => item.email === email)
  if (!user) {
    return res.status(404).json({ message: 'No account found for that email' })
  }
  if (!newPassword || !code) {
    return res.status(400).json({ message: 'A reset code and a new password are required' })
  }
  const hasValidCode = user.resetCode === String(code) && user.resetCodeExpiry && Date.now() < user.resetCodeExpiry
  if (!hasValidCode) {
    return res.status(401).json({ message: 'Reset code is invalid or expired' })
  }
  user.password = newPassword
  user.resetCode = ''
  user.resetCodeExpiry = null
  saveData(store)
  res.json({ message: 'Password updated successfully' })
})

app.post('/api/profile/avatar', upload.single('avatar'), (req, res) => {
  const { userId } = req.body
  const file = req.file
  if (!userId) {
    return res.status(400).json({ message: 'A user id is required' })
  }
  if (!file) {
    return res.status(400).json({ message: 'Please select an image to upload' })
  }
  const user = store.users.find((item) => item.id === Number(userId))
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }
  user.profileImage = `/uploads/${file.filename}`
  saveData(store)
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage } })
})

app.get('/api/catalog', (_req, res) => {
  res.json({
    songs: store.songs,
    artists: store.artists,
    albums: store.albums,
    genres: store.genres,
    playlists: store.playlists,
  })
})

app.post('/api/artist/songs', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), (req, res) => {
  const body = req.body || {}
  const { artistId, title, artist, genre, album, duration, description } = body
  if (!title || !artist || !genre) {
    return res.status(400).json({ message: 'Title, artist, and genre are required' })
  }

  const audioFile = req.files?.audio?.[0]
  const coverFile = req.files?.cover?.[0]
  const audioUrl = audioFile ? `/uploads/${audioFile.filename}` : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  const coverUrl = coverFile ? `/uploads/${coverFile.filename}` : 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80'

  const song = {
    id: Date.now(),
    title,
    artist,
    artistId: artistId || 2,
    album: album || 'New Upload',
    genre,
    cover: coverUrl,
    duration: duration || '3:00',
    likes: 0,
    downloads: 0,
    description: description || 'Fresh upload from BeatHub.',
    audioUrl,
  }
  store.songs.unshift(song)
  store.activities.unshift({ id: Date.now() + 2, text: `${artist} uploaded ${title}` })
  saveData(store)
  res.json({ song })
})

app.post('/api/downloads', (req, res) => {
  const { songId, userId } = req.body
  const song = store.songs.find((item) => item.id === Number(songId))
  if (!song) {
    return res.status(404).json({ message: 'Song not found' })
  }
  song.downloads += 1
  store.downloads.push({ id: Date.now(), songId: Number(songId), userId: Number(userId), at: new Date().toISOString() })
  store.activities.unshift({ id: Date.now() + 3, text: `Song downloaded: ${song.title}` })
  saveData(store)
  res.json({ song })
})

app.post('/api/reports', (req, res) => {
  const { songId, reason, reporterName, reporterId } = req.body
  const song = store.songs.find((item) => item.id === Number(songId))
  if (!song) {
    return res.status(404).json({ message: 'Song not found' })
  }
  const report = {
    id: Date.now(),
    type: 'song',
    songId: Number(songId),
    songTitle: song.title,
    reporterName: reporterName || 'Listener',
    reporterId: Number(reporterId) || null,
    reason: reason || 'Inappropriate content',
    createdAt: new Date().toISOString(),
  }
  store.reports.unshift(report)
  store.activities.unshift({ id: Date.now() + 4, text: `Report received for ${song.title}` })
  saveData(store)
  res.json({ report })
})

app.post('/api/reports/account', (req, res) => {
  const { accountId, accountName, reason, reporterName, reporterId } = req.body
  const report = {
    id: Date.now() + 1,
    type: 'account',
    accountId: Number(accountId) || null,
    accountName: accountName || 'Account',
    reporterName: reporterName || 'Listener',
    reporterId: Number(reporterId) || null,
    reason: reason || 'Suspicious activity',
    createdAt: new Date().toISOString(),
  }
  store.reports.unshift(report)
  store.activities.unshift({ id: Date.now() + 5, text: `Account report received for ${report.accountName}` })
  saveData(store)
  res.json({ report })
})

app.get('/api/admin/reports', (_req, res) => {
  res.json({ reports: store.reports })
})

app.delete('/api/admin/reports/:id', (req, res) => {
  const reportId = Number(req.params.id)
  store.reports = store.reports.filter((report) => report.id !== reportId)
  saveData(store)
  res.json({ ok: true })
})

app.delete('/api/admin/users/:id', (req, res) => {
  const userId = Number(req.params.id)
  store.users = store.users.filter((user) => user.id !== userId)
  store.songs = store.songs.filter((song) => song.artistId !== userId)
  store.reports = store.reports.filter((report) => report.reporterId !== userId)
  store.activities.unshift({ id: Date.now() + 5, text: `User account removed (${userId})` })
  saveData(store)
  res.json({ ok: true })
})

app.delete('/api/admin/songs/:id', (req, res) => {
  const songId = Number(req.params.id)
  store.songs = store.songs.filter((song) => song.id !== songId)
  store.reports = store.reports.filter((report) => report.songId !== songId)
  store.activities.unshift({ id: Date.now() + 6, text: `Song removed (${songId})` })
  saveData(store)
  res.json({ ok: true })
})

app.get('/api/admin/stats', (_req, res) => {
  res.json({
    users: store.users.length,
    artists: store.artists.length,
    songs: store.songs.length,
    downloads: store.downloads.length,
    reports: store.reports.slice(0, 12),
    activities: store.activities.slice(0, 8),
  })
})

app.get('/api/admin/users', (_req, res) => {
  res.json({ users: store.users })
})

app.get('/api/playlists', (_req, res) => {
  res.json({ playlists: store.playlists })
})

app.post('/api/playlists', (req, res) => {
  const { name } = req.body
  if (!name) {
    return res.status(400).json({ message: 'Playlist name is required' })
  }
  const playlist = { id: Date.now(), name, songs: [] }
  store.playlists.push(playlist)
  saveData(store)
  res.json({ playlist })
})

app.listen(port, () => {
  console.log(`BeatHub backend listening on http://localhost:${port}`)
})

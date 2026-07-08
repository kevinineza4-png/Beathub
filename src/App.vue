<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3001/api' })

const currentPage = ref('auth')
const accessType = ref('listener')
const authMode = ref('login')
const user = ref(null)
const statusMessage = ref('')
const searchQuery = ref('')
const darkMode = ref(false)
const language = ref('en')
const catalog = ref({ songs: [], artists: [], albums: [], genres: [], playlists: [] })
const adminStats = ref({ users: 0, artists: 0, songs: 0, downloads: 0, activities: [], reports: [] })
const adminUsers = ref([])
const allUsers = ref([])
const playerState = ref({ visible: false, playing: false, title: '', artist: '', cover: '', audioUrl: '' })
const audioRef = ref(null)
const selectedAudioFile = ref(null)
const selectedCoverFile = ref(null)
const freshPlaylistName = ref('Chill Mix')
const favorites = ref([])
const playlists = ref([])
const recentTracks = ref([])
const downloadHistory = ref([])
const notifications = ref([{ id: 1, text: 'Welcome back! Your next favorite track is waiting.' }])
const statusVariant = ref('info')
const showingForgotPassword = ref(false)
const profileImageFile = ref(null)

const authForm = reactive({ name: '', email: 'user@beathub.com', password: 'user123', role: 'listener' })
const uploadForm = reactive({ title: '', genre: '', description: '' })
const forgotPasswordForm = reactive({ email: '', resetCode: '', newPassword: '' })

const translations = {
  en: {
    brand: 'BeatHub',
    roleUser: 'Listener',
    roleArtist: 'Artist',
    roleAdmin: 'Admin',
    navHome: 'Home',
    navDiscover: 'Discover',
    navArtists: 'Artists',
    navDownloads: 'Downloads',
    navDashboard: 'Dashboard',
    navUpload: 'Upload',
    navTracks: 'Tracks',
    navLibrary: 'Library',
    navUsers: 'Users',
    navAnalytics: 'Analytics',
    navReports: 'Reports',
    logout: 'Logout',
    login: 'Sign in',
    register: 'Create account',
    heroTitle: 'Stream, discover, and download your favorite music',
    heroSubtitle: 'BeatHub is now a real role-based music platform for listeners, artists, and admins.',
    authSubtitle: 'Choose how you enter and unlock the right experience.',
    accessListener: 'Listener',
    accessArtist: 'Artist',
    accessAdmin: 'Admin portal',
    quickAccess: 'Quick access',
    uploadTrack: 'Upload a track',
    uploadSuccess: 'Track published successfully',
    downloadSuccess: 'Download recorded',
    emptyState: 'Nothing to show yet. Your first upload or download will appear here.',
    adminHeading: 'Admin control center',
    recentActivity: 'Recent activity',
    memberBenefits: 'Why BeatHub works',
  },
  fr: {
    brand: 'BeatHub',
    roleUser: 'Écouteur',
    roleArtist: 'Artiste',
    roleAdmin: 'Admin',
    navHome: 'Accueil',
    navDiscover: 'Découvrir',
    navArtists: 'Artistes',
    navDownloads: 'Téléchargements',
    navDashboard: 'Tableau de bord',
    navUpload: 'Publier',
    navTracks: 'Titres',
    navLibrary: 'Bibliothèque',
    navUsers: 'Utilisateurs',
    navAnalytics: 'Analyses',
    navReports: 'Rapports',
    logout: 'Déconnexion',
    login: 'Se connecter',
    register: 'Créer un compte',
    heroTitle: 'Écoutez, découvrez et téléchargez votre musique préférée',
    heroSubtitle: 'BeatHub est désormais une vraie plateforme musicale par rôles pour les auditeurs, artistes et administrateurs.',
    authSubtitle: 'Choisissez votre mode d’accès et ouvrez la bonne expérience.',
    accessListener: 'Écouteur',
    accessArtist: 'Artiste',
    accessAdmin: 'Portail admin',
    quickAccess: 'Accès rapide',
    uploadTrack: 'Publier un titre',
    uploadSuccess: 'Titre publié avec succès',
    downloadSuccess: 'Téléchargement enregistré',
    emptyState: 'Rien à afficher pour l’instant. Votre premier téléchargement ou envoi apparaîtra ici.',
    adminHeading: 'Centre de contrôle administrateur',
    recentActivity: 'Activité récente',
    memberBenefits: 'Pourquoi BeatHub fonctionne',
  },
  rw: {
    brand: 'BeatHub',
    roleUser: 'Umukurikira',
    roleArtist: 'Umuhanzi',
    roleAdmin: 'Admin',
    navHome: 'Ahabanza',
    navDiscover: 'Shakisha',
    navArtists: 'Abahanzi',
    navDownloads: 'Downloads',
    navDashboard: 'Dashboard',
    navUpload: 'Shyiraho',
    navTracks: 'Indirimbo',
    navLibrary: 'Isomero',
    navUsers: 'Abakoresha',
    navAnalytics: 'Ibarurishamibare',
    navReports: 'Raporo',
    logout: 'Sohoka',
    login: 'Injira',
    register: 'Fungura konti',
    heroTitle: 'Umva, ushakishe, kandi usangire indirimbo ukunda',
    heroSubtitle: 'BeatHub ubu ni urubuga rw’ukuri rw’umuziki rushyira hamwe abakunzi, abahanzi, n’abadmin.',
    authSubtitle: 'Hitamo uburyo bwo kwinjira maze ubone uburambe bukwiriye.',
    accessListener: 'Umukurikira',
    accessArtist: 'Umuhanzi',
    accessAdmin: 'Admin portal',
    quickAccess: 'Injira vuba',
    uploadTrack: 'Shyiraho indirimbo',
    uploadSuccess: 'Indirimbo yashyizweho neza',
    downloadSuccess: 'Download yanditswe',
    emptyState: 'Nta kintu gifite ibiranga. Upload yawe ya mbere cyangwa download izagaragara hano.',
    adminHeading: 'Akarere k’admin',
    recentActivity: 'Ibikorwa by’ibihe',
    memberBenefits: 'Impamvu BeatHub ikora neza',
  },
}

const t = (key) => translations[language.value]?.[key] || translations.en[key] || key

const navItems = computed(() => {
  if (!user.value) return []
  if (user.value.role === 'artist') {
    return [
      { key: 'home', label: t('navHome') },
      { key: 'dashboard', label: t('navDashboard') },
      { key: 'upload', label: t('navUpload') },
      { key: 'tracks', label: t('navTracks') },
      { key: 'profile', label: 'Profile' },
    ]
  }
  if (user.value.role === 'admin') {
    return [
      { key: 'dashboard', label: t('navDashboard') },
      { key: 'users', label: t('navUsers') },
      { key: 'reports', label: t('navReports') },
    ]
  }
  return [
    { key: 'home', label: t('navHome') },
    { key: 'library', label: t('navLibrary') },
    { key: 'artists', label: t('navArtists') },
    { key: 'profile', label: 'Profile' },
  ]
})

const featuredSongs = computed(() => catalog.value.songs.slice(0, 4))
const previewSongs = computed(() => catalog.value.songs.slice(0, 3))
const recommendedSongs = computed(() => catalog.value.songs.slice(1, 4))
const filteredSongs = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return catalog.value.songs
  return catalog.value.songs.filter((song) => `${song.title} ${song.artist} ${song.genre}`.toLowerCase().includes(query))
})
const myUploadedSongs = computed(() => catalog.value.songs.filter((song) => song.artistId === user.value?.id || song.artist === user.value?.name))
const roleLabel = computed(() => {
  if (!user.value) return ''
  return user.value.role === 'artist' ? t('roleArtist') : user.value.role === 'admin' ? t('roleAdmin') : t('roleUser')
})
const hasFavorites = computed(() => favorites.value.length > 0)

const normalizeRole = (role) => (role === 'listener' ? 'user' : role)

const getProfileForUser = (userId) => {
  if (!userId) return null
  const numericId = Number(userId)
  const fromAllUsers = allUsers.value.find((entry) => entry.id === numericId)
  if (fromAllUsers) return fromAllUsers
  if (user.value?.id === numericId) return user.value
  return null
}

const setStatus = (message, variant = 'info') => {
  statusMessage.value = message
  statusVariant.value = variant
}

const handleTheme = () => {
  darkMode.value = !darkMode.value
  document.body.classList.toggle('dark', darkMode.value)
  localStorage.setItem('beathub-dark', String(darkMode.value))
}

const setPage = (page) => {
  currentPage.value = page
}

const setAccess = (type) => {
  accessType.value = type
  authForm.role = type === 'artist' ? 'artist' : 'listener'
  authMode.value = 'login'
}

const openAdminPortal = () => {
  accessType.value = 'admin'
  authForm.role = 'admin'
  authMode.value = 'login'
}

const storeUser = (profile) => {
  const normalizedProfile = { ...profile, role: normalizeRole(profile.role), profileImage: profile.profileImage || '' }
  user.value = normalizedProfile
  localStorage.setItem('beathub-user', JSON.stringify(normalizedProfile))
}

const loadCatalog = async () => {
  const { data } = await api.get('/catalog')
  catalog.value = data
  if (!playlists.value.length && data.playlists?.length) {
    playlists.value = data.playlists.map((playlist) => ({ ...playlist, songs: [] }))
  }
}

const loadProfiles = async () => {
  try {
    const usersResponse = await api.get('/admin/users')
    allUsers.value = usersResponse.data.users || []
    adminUsers.value = usersResponse.data.users || []
  } catch {
    allUsers.value = []
    adminUsers.value = []
  }
}

const loadAdminStats = async () => {
  const { data } = await api.get('/admin/stats')
  adminStats.value = { ...data, reports: Array.isArray(data.reports) ? data.reports : [] }
  await loadProfiles()
}

const submitAuth = async () => {
  setStatus('')
  try {
    let payload = { email: authForm.email, password: authForm.password }

    if (accessType.value === 'admin') {
      const { data } = await api.post('/auth/admin/login', payload)
      storeUser(data.user)
      await loadCatalog()
      await loadAdminStats()
      currentPage.value = 'dashboard'
      setStatus('Welcome back, admin', 'success')
      return
    }

    const endpoint = authMode.value === 'register' ? '/auth/register' : '/auth/login'
    if (authMode.value === 'register') {
      payload = { name: authForm.name, email: authForm.email, password: authForm.password, role: authForm.role === 'listener' ? 'user' : authForm.role }
    } else {
      payload = { ...payload, role: authForm.role === 'listener' ? 'user' : authForm.role }
    }

    const { data } = await api.post(endpoint, payload)
    storeUser(data.user)
    await loadCatalog()
    currentPage.value = 'home'
    setStatus('Signed in successfully', 'success')
  } catch (error) {
    setStatus(error.response?.data?.message || 'Unable to process authentication', 'danger')
  }
}

const logout = () => {
  user.value = null
  localStorage.removeItem('beathub-user')
  currentPage.value = 'auth'
  setStatus('')
}

const playSong = async (song) => {
  playerState.value = { visible: true, playing: true, title: song.title, artist: song.artist, cover: song.cover, audioUrl: song.audioUrl || '' }
  recentTracks.value = [song, ...recentTracks.value.filter((item) => item.id !== song.id)].slice(0, 6)
  notifications.value = [{ id: Date.now(), text: `Playing ${song.title}` }, ...notifications.value].slice(0, 5)
  setStatus(`Now playing ${song.title}`, 'success')

  if (audioRef.value && song.audioUrl) {
    audioRef.value.src = song.audioUrl
    try {
      await audioRef.value.play()
    } catch {
      playerState.value.playing = false
    }
  }
}

const togglePlay = async () => {
  if (!audioRef.value) return
  if (playerState.value.playing) {
    audioRef.value.pause()
    playerState.value.playing = false
  } else {
    try {
      await audioRef.value.play()
      playerState.value.playing = true
    } catch {
      playerState.value.playing = false
    }
  }
}

const toggleFavorite = (song) => {
  const exists = favorites.value.some((item) => item.id === song.id)
  if (exists) {
    favorites.value = favorites.value.filter((item) => item.id !== song.id)
    notifications.value = [{ id: Date.now(), text: `Removed ${song.title} from favorites` }, ...notifications.value].slice(0, 5)
    setStatus(`Removed ${song.title} from favorites`, 'info')
  } else {
    favorites.value = [song, ...favorites.value]
    notifications.value = [{ id: Date.now(), text: `Saved ${song.title} to favorites` }, ...notifications.value].slice(0, 5)
    setStatus(`Saved ${song.title} to favorites`, 'success')
  }
}

const createPlaylist = () => {
  const value = freshPlaylistName.value.trim()
  if (!value) return
  const existing = playlists.value.find((playlist) => playlist.name.toLowerCase() === value.toLowerCase())
  if (existing) {
    setStatus('Playlist already exists', 'danger')
    return
  }
  playlists.value = [{ id: Date.now(), name: value, songs: [] }, ...playlists.value]
  notifications.value = [{ id: Date.now(), text: `Created playlist ${value}` }, ...notifications.value].slice(0, 5)
  freshPlaylistName.value = ''
  setStatus(`Playlist created: ${value}`, 'success')
}

const addSongToPlaylist = (song) => {
  if (!playlists.value.length) {
    createPlaylist()
  }
  const target = playlists.value[0]
  target.songs = [...target.songs, song]
  notifications.value = [{ id: Date.now(), text: `Added ${song.title} to ${target.name}` }, ...notifications.value].slice(0, 5)
  setStatus(`Added ${song.title} to ${target.name}`, 'success')
}

const downloadSong = async (song) => {
  try {
    const { data } = await api.post('/downloads', { songId: song.id, userId: user.value?.id })
    song.downloads = data.song.downloads
    downloadHistory.value = [song, ...downloadHistory.value.filter((item) => item.id !== song.id)].slice(0, 8)
    if (song.audioUrl) {
      const sourceUrl = song.audioUrl.startsWith('http') ? song.audioUrl : `http://localhost:3001${song.audioUrl}`
      const link = document.createElement('a')
      link.href = sourceUrl
      link.download = `${song.title.replace(/\s+/g, '_')}.mp3`
      document.body.appendChild(link)
      link.click()
      link.remove()
    }
    setStatus(`${t('downloadSuccess')} • ${song.title}`, 'success')
    notifications.value = [{ id: Date.now(), text: `Downloaded ${song.title}` }, ...notifications.value].slice(0, 5)
  } catch (error) {
    setStatus(error.response?.data?.message || 'Download failed', 'danger')
  }
}

const selectProfileImage = (event) => {
  profileImageFile.value = event.target.files?.[0] || null
}

const uploadSong = async () => {
  try {
    const formData = new FormData()
    formData.append('artistId', user.value?.id || '')
    formData.append('title', uploadForm.title)
    formData.append('artist', user.value?.name || 'New Artist')
    formData.append('genre', uploadForm.genre)
    formData.append('description', uploadForm.description)
    formData.append('duration', '3:00')
    if (selectedAudioFile.value) formData.append('audio', selectedAudioFile.value)
    if (selectedCoverFile.value) formData.append('cover', selectedCoverFile.value)

    const { data } = await api.post('/artist/songs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    await loadCatalog()
    await loadAdminStats()
    selectedAudioFile.value = null
    selectedCoverFile.value = null
    uploadForm.title = ''
    uploadForm.genre = ''
    uploadForm.description = ''
    setStatus(t('uploadSuccess'), 'success')
    notifications.value = [{ id: Date.now(), text: `Published ${data.song.title}` }, ...notifications.value].slice(0, 5)
  } catch (error) {
    setStatus(error.response?.data?.message || 'Upload failed', 'danger')
  }
}

const handleAudioSelection = (event) => {
  selectedAudioFile.value = event.target.files?.[0] || null
}

const handleCoverSelection = (event) => {
  selectedCoverFile.value = event.target.files?.[0] || null
}

const reportSong = async (song) => {
  const reason = window.prompt('Why are you reporting this track?', 'Inappropriate content')
  if (!reason) return
  try {
    await api.post('/reports', {
      songId: song.id,
      reason,
      reporterName: user.value?.name || 'Listener',
      reporterId: user.value?.id || null,
    })
    setStatus(`Report submitted for ${song.title}`, 'success')
  } catch (error) {
    setStatus(error.response?.data?.message || 'Report failed', 'danger')
  }
}

const reportAccount = async (account) => {
  const reason = window.prompt('Why are you reporting this account?', 'Suspicious activity')
  if (!reason) return
  try {
    await api.post('/reports/account', {
      accountId: account?.id || null,
      accountName: account?.name || account?.title || 'Account',
      reason,
      reporterName: user.value?.name || 'Listener',
      reporterId: user.value?.id || null,
    })
    setStatus(`Report submitted for ${account?.name || 'this account'}`, 'success')
  } catch (error) {
    setStatus(error.response?.data?.message || 'Report failed', 'danger')
  }
}

const requestPasswordReset = async () => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email: forgotPasswordForm.email })
    setStatus(`${data.message}. Use the code ${data.code} to reset your password.`, 'success')
  } catch (error) {
    setStatus(error.response?.data?.message || 'Password reset request failed', 'danger')
  }
}

const submitPasswordReset = async () => {
  try {
    const { data } = await api.post('/auth/reset-password', {
      email: forgotPasswordForm.email,
      code: forgotPasswordForm.resetCode,
      newPassword: forgotPasswordForm.newPassword,
    })
    forgotPasswordForm.resetCode = ''
    forgotPasswordForm.newPassword = ''
    setStatus(data.message, 'success')
  } catch (error) {
    setStatus(error.response?.data?.message || 'Password reset failed', 'danger')
  }
}

const updateProfileImage = async () => {
  if (!profileImageFile.value) return
  try {
    const formData = new FormData()
    formData.append('userId', user.value?.id || '')
    formData.append('avatar', profileImageFile.value)
    const { data } = await api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    storeUser({ ...user.value, ...data.user })
    profileImageFile.value = null
    setStatus('Profile image updated', 'success')
  } catch (error) {
    setStatus(error.response?.data?.message || 'Profile update failed', 'danger')
  }
}

const deleteUserAccount = async (accountId) => {
  try {
    await api.delete(`/admin/users/${accountId}`)
    await loadCatalog()
    await loadAdminStats()
    setStatus('User account removed', 'success')
  } catch (error) {
    setStatus(error.response?.data?.message || 'Unable to remove user', 'danger')
  }
}

const deleteSong = async (songId) => {
  try {
    await api.delete(`/admin/songs/${songId}`)
    await loadCatalog()
    await loadAdminStats()
    setStatus('Song removed from the catalog', 'success')
  } catch (error) {
    setStatus(error.response?.data?.message || 'Unable to remove song', 'danger')
  }
}

const resolveReport = async (reportId) => {
  try {
    await api.delete(`/admin/reports/${reportId}`)
    await loadAdminStats()
    setStatus('Report resolved', 'success')
  } catch (error) {
    setStatus(error.response?.data?.message || 'Unable to resolve report', 'danger')
  }
}

onMounted(async () => {
  const storedTheme = localStorage.getItem('beathub-dark')
  if (storedTheme === 'true') darkMode.value = true
  document.body.classList.toggle('dark', darkMode.value)

  await loadCatalog()
  await loadProfiles()

  const storedUser = localStorage.getItem('beathub-user')
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser)
    user.value = { ...parsedUser, role: normalizeRole(parsedUser.role) }
    if (user.value.role === 'admin') {
      await loadAdminStats()
    }
    currentPage.value = user.value.role === 'admin' ? 'dashboard' : 'home'
  } else {
    currentPage.value = 'auth'
  }
})
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="container topbar-inner">
        <a class="brand" href="#" @click.prevent="user ? setPage(user.role === 'admin' ? 'dashboard' : 'home') : (currentPage = 'auth')">
          <img class="brand-logo" src="/logo.png" alt="BeatHub logo" />
          <span>{{ t('brand') }}</span>
        </a>

        <nav v-if="user" class="nav-links">
          <a
            v-for="item in navItems"
            :key="item.key"
            href="#"
            class="nav-link"
            :class="{ active: currentPage === item.key }"
            @click.prevent="setPage(item.key)"
          >
            {{ item.label }}
          </a>
        </nav>

        <div class="toolbar">
          <select v-model="language" class="lang-select">
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="rw">Kinyarwanda</option>
          </select>
          <button v-if="user" class="icon-btn" @click="handleTheme">{{ darkMode ? '☀️' : '🌙' }}</button>
          <div v-if="user" class="user-pill">
            <img v-if="user.profileImage" class="avatar-chip" :src="user.profileImage" :alt="user.name" />
            <span>{{ user.name }}</span>
          </div>
          <button v-if="user" class="icon-btn" @click="logout">↩</button>
        </div>
      </div>
    </header>

    <main class="container">
      <section v-if="!user" class="auth-shell">
        <div class="auth-card">
          <div class="auth-copy">
            <span class="badge">{{ t('brand') }} • {{ t('authSubtitle') }}</span>
            <h1>{{ t('heroTitle') }}</h1>
            <p>{{ t('heroSubtitle') }}</p>
            <div class="feature-list">
              <div class="feature-item">• Stream and download from one polished dashboard</div>
              <div class="feature-item">• Artists publish songs in seconds</div>
              <div class="feature-item">• Admin access uses a permanent secure login</div>
            </div>
          </div>

          <div class="panel auth-panel">
            <div class="auth-choice-grid">
              <button class="mode-card" :class="{ active: accessType === 'listener' }" @click="setAccess('listener')">{{ t('accessListener') }}</button>
              <button class="mode-card" :class="{ active: accessType === 'artist' }" @click="setAccess('artist')">{{ t('accessArtist') }}</button>
              <button class="mode-card admin-card" :class="{ active: accessType === 'admin' }" @click="openAdminPortal()">{{ t('accessAdmin') }}</button>
            </div>

            <div class="auth-toggle" style="margin-top: 1rem;">
              <button class="pill-btn" :class="{ active: authMode === 'login' }" @click="authMode = 'login'">{{ t('login') }}</button>
              <button v-if="accessType !== 'admin'" class="pill-btn" :class="{ active: authMode === 'register' }" @click="authMode = 'register'">{{ t('register') }}</button>
            </div>

            <div class="form-grid" style="margin-top: 1rem;">
              <input v-if="authMode === 'register' && accessType !== 'admin'" v-model="authForm.name" placeholder="Full name" />
              <input v-model="authForm.email" placeholder="Email" />
              <input v-model="authForm.password" type="password" placeholder="Password" />
              <button class="primary-btn" @click="submitAuth">{{ accessType === 'admin' ? 'Open admin portal' : authMode === 'login' ? t('login') : t('register') }}</button>
              <button v-if="accessType !== 'admin'" class="secondary-btn" @click="authMode = authMode === 'login' ? 'register' : 'login'">
                {{ authMode === 'login' ? 'Need an account?' : 'Already have an account?' }}
              </button>
              <button v-if="accessType !== 'admin'" class="ghost-btn" @click="showingForgotPassword = !showingForgotPassword">
                {{ showingForgotPassword ? 'Cancel reset' : 'Forgot password?' }}
              </button>
            </div>

            <div v-if="showingForgotPassword && accessType !== 'admin'" class="form-grid" style="margin-top: 0.8rem;">
              <input v-model="forgotPasswordForm.email" placeholder="Account email" />
              <button class="secondary-btn" @click="requestPasswordReset">Send reset code</button>
              <input v-model="forgotPasswordForm.resetCode" placeholder="Reset code" />
              <input v-model="forgotPasswordForm.newPassword" type="password" placeholder="New password" />
              <button class="primary-btn" @click="submitPasswordReset">Save new password</button>
            </div>

            <p v-if="statusMessage" :class="['status-message', statusVariant === 'danger' ? 'danger' : statusVariant === 'success' ? 'success' : '']">{{ statusMessage }}</p>
            <p class="helper-text">Listener demo: user@beathub.com / user123. Artist demo: artist@beathub.com / artist123. Admin: kevinineza4@gmail.com / kevin123.</p>
          </div>
        </div>

        <section v-if="previewSongs.length" class="section preview-section">
          <div class="section-head">
            <h2>Preview the catalog</h2>
            <span>Play sample songs immediately, even before you sign in</span>
          </div>
          <div class="grid-3">
            <article v-for="song in previewSongs" :key="song.id" class="card">
              <img class="cover-art" :src="song.cover" :alt="song.title" />
              <h3>{{ song.title }}</h3>
              <p class="muted">{{ song.artist }} • {{ song.genre }}</p>
              <div class="action-row">
                <button class="primary-btn" @click="playSong(song)">Play</button>
                <button class="secondary-btn" @click="downloadSong(song)">Download</button>
              </div>
            </article>
          </div>
        </section>
      </section>

      <section v-else class="section">
        <div class="welcome-banner">
          <div>
            <span class="badge">{{ roleLabel }} • {{ t('brand') }}</span>
            <h1>{{ t('heroTitle') }}</h1>
            <p>{{ t('heroSubtitle') }}</p>
          </div>
          <div class="chip-row">
            <span class="chip">Smart discovery</span>
            <span class="chip">Fast download flow</span>
            <span class="chip">Live admin insights</span>
          </div>
        </div>
      </section>

      <section v-if="user?.role === 'user' && currentPage === 'home'" class="section">
        <div class="section-head">
          <h2>Trending now</h2>
          <span>Fresh songs and instant controls</span>
        </div>
        <div class="grid-4">
          <article v-for="song in featuredSongs" :key="song.id" class="card">
            <img class="cover-art" :src="song.cover" :alt="song.title" />
            <h3>{{ song.title }}</h3>
            <p class="muted">{{ song.artist }}</p>
            <div class="metric-row"><span>{{ song.genre }}</span><span>{{ song.duration }}</span></div>
            <div class="artist-inline">
              <img v-if="getProfileForUser(song.artistId)?.profileImage" class="artist-avatar" :src="getProfileForUser(song.artistId).profileImage" :alt="song.artist" />
              <div>
                <strong>{{ song.artist }}</strong>
                <div class="muted">Artist profile</div>
              </div>
            </div>
            <div class="action-row">
              <button class="primary-btn" @click="playSong(song)">Play</button>
              <button class="secondary-btn" @click="toggleFavorite(song)">♡</button>
              <button class="secondary-btn" @click="downloadSong(song)">Download</button>
            </div>
          </article>
        </div>
      </section>

      <section v-if="user?.role === 'user' && currentPage === 'home'" class="section">
        <div class="section-head">
          <h2>Start here</h2>
          <span>Jump into discovery, your library, or downloads in one place</span>
        </div>
        <div class="grid-3">
          <article class="card">
            <h3>Discover</h3>
            <p class="muted">Search the catalog by mood, artist, or genre.</p>
            <button class="primary-btn" style="margin-top: 0.8rem;" @click="setPage('discover')">Open discover</button>
          </article>
          <article class="card">
            <h3>Library</h3>
            <p class="muted">Create playlists and keep your favorite songs close.</p>
            <button class="primary-btn" style="margin-top: 0.8rem;" @click="setPage('library')">Open library</button>
          </article>
          <article class="card">
            <h3>Downloads</h3>
            <p class="muted">See the tracks you’ve downloaded and play them again.</p>
            <button class="primary-btn" style="margin-top: 0.8rem;" @click="setPage('downloads')">Open downloads</button>
          </article>
        </div>
      </section>

      <section v-if="user?.role === 'user' && currentPage === 'home'" class="section columns">
        <div class="panel">
          <div class="section-head">
            <h3>Recently played</h3>
            <span>What you just opened</span>
          </div>
          <div v-if="recentTracks.length" class="list-card" v-for="track in recentTracks" :key="track.id">
            <div>
              <strong>{{ track.title }}</strong>
              <div class="muted">{{ track.artist }}</div>
            </div>
            <button class="ghost-btn" @click="playSong(track)">Replay</button>
          </div>
          <div v-else class="muted">Start listening to build your activity.</div>
        </div>
        <div class="panel">
          <div class="section-head">
            <h3>Notifications</h3>
            <span>Live updates from the app</span>
          </div>
          <div v-for="item in notifications" :key="item.id" class="list-card">
            <span>{{ item.text }}</span>
          </div>
        </div>
      </section>

      <section v-if="user?.role === 'user' && currentPage === 'discover'" class="section">
        <div class="section-head">
          <h2>Discover</h2>
          <span>Instant search for songs, artists, and genre moods</span>
        </div>
        <label class="search-box" style="margin-bottom: 1rem; width: 100%;">
          <span>🔎</span>
          <input v-model="searchQuery" placeholder="Search songs by title, artist, or genre" />
        </label>
        <div class="grid-3">
          <article v-for="song in filteredSongs" :key="song.id" class="card">
            <h3>{{ song.title }}</h3>
            <p class="muted">{{ song.artist }} • {{ song.genre }}</p>
            <div class="artist-inline">
              <img v-if="getProfileForUser(song.artistId)?.profileImage" class="artist-avatar" :src="getProfileForUser(song.artistId).profileImage" :alt="song.artist" />
              <div>
                <strong>{{ song.artist }}</strong>
                <div class="muted">Artist profile</div>
              </div>
            </div>
            <div class="action-row">
              <button class="primary-btn" @click="playSong(song)">Play</button>
              <button class="secondary-btn" @click="toggleFavorite(song)">Favorite</button>
              <button class="secondary-btn" @click="downloadSong(song)">Download</button>
            </div>
          </article>
        </div>
      </section>

      <section v-if="user?.role === 'user' && currentPage === 'library'" class="section columns">
        <div class="panel">
          <div class="section-head">
            <h3>Playlists</h3>
            <span>Create and manage your own mix lists</span>
          </div>
          <div class="form-grid">
            <input v-model="freshPlaylistName" placeholder="Playlist name" />
            <button class="primary-btn" @click="createPlaylist">Create playlist</button>
          </div>
          <div v-if="playlists.length" class="list-card" v-for="playlist in playlists" :key="playlist.id">
            <div>
              <strong>{{ playlist.name }}</strong>
              <div class="muted">{{ playlist.songs?.length || 0 }} tracks</div>
            </div>
            <button class="ghost-btn" @click="addSongToPlaylist(recommendedSongs[0])">Add current</button>
          </div>
        </div>
        <div class="panel">
          <div class="section-head">
            <h3>Favorites</h3>
            <span>Your saved songs</span>
          </div>
          <div v-if="hasFavorites" class="list-card" v-for="song in favorites" :key="song.id">
            <div>
              <strong>{{ song.title }}</strong>
              <div class="muted">{{ song.artist }}</div>
            </div>
            <button class="ghost-btn" @click="playSong(song)">Play</button>
          </div>
          <div v-else class="muted">Tap the heart on a song to save it here.</div>
        </div>
      </section>

      <section v-if="user?.role === 'user' && currentPage === 'downloads'" class="section">
        <div class="section-head">
          <h2>Downloads</h2>
          <span>Your latest saved tracks</span>
        </div>
        <div v-if="downloadHistory.length" class="grid-3">
          <article v-for="track in downloadHistory" :key="track.id" class="card">
            <h3>{{ track.title }}</h3>
            <p class="muted">{{ track.artist }} • {{ track.genre }}</p>
            <div class="action-row">
              <button class="primary-btn" @click="playSong(track)">Play</button>
              <button class="secondary-btn" @click="reportSong(track)">Report song</button>
            </div>
          </article>
        </div>
        <div v-else class="panel">Download a song to see it here.</div>
      </section>

      <section v-if="user?.role === 'user' && currentPage === 'artists'" class="section">
        <div class="section-head">
          <h2>Artists</h2>
          <span>Follow the creators shaping your next favorite sound</span>
        </div>
        <div class="grid-3">
          <article v-for="artist in catalog.artists" :key="artist.id" class="card artist-card">
            <img :src="artist.image" :alt="artist.name" />
            <h3>{{ artist.name }}</h3>
            <p class="muted">{{ artist.genre }} • {{ artist.followers }}</p>
            <div class="action-row">
              <button class="primary-btn">Follow</button>
              <button class="secondary-btn" @click="reportAccount(artist)">Report account</button>
            </div>
          </article>
        </div>
      </section>

      <section v-if="user?.role === 'user' && currentPage === 'profile'" class="section">
        <div class="section-head">
          <h2>Profile</h2>
          <span>Update your avatar and keep your identity polished</span>
        </div>
        <div class="panel">
          <div class="profile-card">
            <img class="profile-avatar" :src="user.profileImage || '/logo.png'" :alt="user.name" />
            <div>
              <h3>{{ user.name }}</h3>
              <p class="muted">{{ user.email }} • {{ user.role }}</p>
            </div>
          </div>
          <div class="form-grid" style="margin-top: 1rem;">
            <div class="chip-row">
              <span class="chip">{{ user.name }}</span>
              <span class="chip">{{ user.email }}</span>
            </div>
            <label class="upload-box">
              <span>Profile image</span>
              <input type="file" accept="image/*" @change="selectProfileImage" />
            </label>
            <button class="primary-btn" @click="updateProfileImage">Save profile image</button>
          </div>
        </div>
      </section>

      <section v-if="user?.role === 'artist' && currentPage === 'dashboard'" class="section columns">
        <div class="panel">
          <h2>Artist dashboard</h2>
          <p class="muted">Publish new tracks quickly and keep your catalog organized.</p>
          <div class="chip-row" style="margin-top: 1rem;">
            <span class="chip">{{ catalog.songs.length }} tracks</span>
            <span class="chip">{{ catalog.artists.length }} artists</span>
          </div>
        </div>
        <div class="panel">
          <h3>{{ t('uploadTrack') }}</h3>
          <div class="form-grid">
            <input v-model="uploadForm.title" placeholder="Track title" />
            <input v-model="uploadForm.genre" placeholder="Genre" />
            <textarea v-model="uploadForm.description" rows="3" placeholder="Short description"></textarea>
            <label class="upload-box">
              <span>Audio or video file</span>
              <input type="file" accept="audio/*,video/*" @change="handleAudioSelection" />
            </label>
            <label class="upload-box">
              <span>Cover image</span>
              <input type="file" accept="image/*" @change="handleCoverSelection" />
            </label>
            <button class="primary-btn" @click="uploadSong">Publish now</button>
          </div>
        </div>
      </section>

      <section v-if="user?.role === 'artist' && currentPage === 'tracks'" class="section">
        <div class="section-head">
          <h2>Your tracks</h2>
          <span>Everything you have published so far</span>
        </div>
        <div v-if="myUploadedSongs.length" class="grid-3">
          <article v-for="song in myUploadedSongs" :key="song.id" class="card">
            <h3>{{ song.title }}</h3>
            <p class="muted">{{ song.genre }} • {{ song.duration }}</p>
            <div class="action-row">
              <button class="secondary-btn" @click="playSong(song)">Preview</button>
              <button class="secondary-btn" @click="deleteSong(song.id)">Delete</button>
            </div>
          </article>
        </div>
        <div v-else class="panel">{{ t('emptyState') }}</div>
      </section>

      <section v-if="user?.role === 'artist' && currentPage === 'profile'" class="section">
        <div class="section-head">
          <h2>Artist profile</h2>
          <span>Keep your public identity fresh and polished</span>
        </div>
        <div class="panel">
          <div class="profile-card">
            <img class="profile-avatar" :src="user.profileImage || '/logo.png'" :alt="user.name" />
            <div>
              <h3>{{ user.name }}</h3>
              <p class="muted">{{ user.email }} • {{ user.role }}</p>
            </div>
          </div>
          <div class="form-grid" style="margin-top: 1rem;">
            <div class="chip-row">
              <span class="chip">{{ user.name }}</span>
              <span class="chip">{{ user.email }}</span>
            </div>
            <label class="upload-box">
              <span>Profile image</span>
              <input type="file" accept="image/*" @change="selectProfileImage" />
            </label>
            <button class="primary-btn" @click="updateProfileImage">Save profile image</button>
          </div>
        </div>
      </section>

      <section v-if="user?.role === 'artist' && currentPage === 'upload'" class="section">
        <div class="panel">
          <h2>{{ t('uploadTrack') }}</h2>
          <div class="form-grid">
            <input v-model="uploadForm.title" placeholder="Track title" />
            <input v-model="uploadForm.genre" placeholder="Genre" />
            <textarea v-model="uploadForm.description" rows="4" placeholder="Tell listeners what this song is about"></textarea>
            <label class="upload-box">
              <span>Audio or video file</span>
              <input type="file" accept="audio/*,video/*" @change="handleAudioSelection" />
            </label>
            <label class="upload-box">
              <span>Cover image</span>
              <input type="file" accept="image/*" @change="handleCoverSelection" />
            </label>
            <button class="primary-btn" @click="uploadSong">Publish now</button>
          </div>
        </div>
      </section>

      <section v-if="user?.role === 'admin' && currentPage === 'dashboard'" class="section">
        <div class="section-head">
          <h2>{{ t('adminHeading') }}</h2>
          <span>Live stats and backend activity</span>
        </div>
        <div class="grid-4">
          <article class="card">
            <h3>{{ adminStats.users }}</h3>
            <p class="muted">Users</p>
          </article>
          <article class="card">
            <h3>{{ adminStats.artists }}</h3>
            <p class="muted">Artists</p>
          </article>
          <article class="card">
            <h3>{{ adminStats.songs }}</h3>
            <p class="muted">Songs</p>
          </article>
          <article class="card">
            <h3>{{ adminStats.downloads }}</h3>
            <p class="muted">Downloads</p>
          </article>
        </div>
      </section>

      <section v-if="user?.role === 'admin' && currentPage === 'users'" class="section">
        <div class="section-head">
          <h2>Registered users</h2>
          <span>Accounts managed through the backend</span>
        </div>
        <div class="grid-3">
          <article v-for="entry in adminUsers" :key="entry.id" class="card">
            <h3>{{ entry.name }}</h3>
            <p class="muted">{{ entry.email }} • {{ entry.role }}</p>
            <button v-if="entry.role !== 'admin'" class="secondary-btn" style="margin-top: 0.8rem;" @click="deleteUserAccount(entry.id)">Delete account</button>
          </article>
        </div>
      </section>

      <section v-if="user?.role === 'admin' && currentPage === 'reports'" class="section">
        <div class="section-head">
          <h2>{{ t('recentActivity') }}</h2>
          <span>Reports and moderation queue</span>
        </div>
        <div class="panel">
          <div v-for="activity in adminStats.activities" :key="activity.id" class="list-card">
            <span>{{ activity.text }}</span>
          </div>
        </div>
        <div class="panel" style="margin-top: 1rem;">
          <div v-for="report in adminStats.reports || []" :key="report.id" class="list-card">
            <div>
              <strong>{{ report.songTitle }}</strong>
              <div class="muted">{{ report.reason }} • {{ report.reporterName }}</div>
            </div>
            <div class="action-row">
              <button class="secondary-btn" @click="resolveReport(report.id)">Resolve</button>
              <button class="secondary-btn" @click="deleteSong(report.songId)">Delete song</button>
            </div>
          </div>
        </div>
      </section>

      <section v-if="statusMessage" class="section">
        <div class="panel status-banner" :class="statusVariant === 'danger' ? 'status-danger' : statusVariant === 'success' ? 'status-success' : ''">{{ statusMessage }}</div>
      </section>
    </main>

    <footer v-if="user" class="footer">
      <div class="container footer-grid">
        <div>
          <div class="brand" style="margin-bottom: 0.8rem;">
            <span class="brand-badge">♪</span>
            <span>{{ t('brand') }}</span>
          </div>
          <p class="muted">Role-aware music streaming and publishing.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <div class="muted" style="margin-top: 0.35rem;">Discovery</div>
          <div class="muted" style="margin-top: 0.35rem;">Downloads</div>
        </div>
        <div>
          <h3>Publish</h3>
          <div class="muted" style="margin-top: 0.35rem;">Artist uploads</div>
          <div class="muted" style="margin-top: 0.35rem;">Fast publishing</div>
        </div>
        <div>
          <h3>Admin</h3>
          <div class="muted" style="margin-top: 0.35rem;">Live stats</div>
          <div class="muted" style="margin-top: 0.35rem;">Reports</div>
        </div>
      </div>
    </footer>

    <div v-if="playerState.visible" class="player-bar">
      <div class="container">
        <div class="player-card">
          <div class="player-meta">
            <img v-if="playerState.cover" :src="playerState.cover" :alt="playerState.title" />
            <div>
              <strong>{{ playerState.title || 'BeatHub player' }}</strong>
              <div class="muted">{{ playerState.artist }}</div>
            </div>
          </div>
          <div class="player-controls">
            <button class="ghost-btn">⏮</button>
            <button class="primary-btn" @click="togglePlay">{{ playerState.playing ? '⏸' : '▶' }}</button>
            <button class="ghost-btn">⏭</button>
          </div>
          <div class="badge">{{ playerState.audioUrl ? 'Streaming preview' : 'Ready to play' }}</div>
        </div>
      </div>
      <audio ref="audioRef" @ended="playerState.playing = false"></audio>
    </div>
  </div>
</template>

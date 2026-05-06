import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants/colors'
import { getToken } from '../utils/storage'
import { API_URL } from '../constants/config'

const SHELF_ICONS: Record<string, { icon: any; bg: string; color: string }> = {
  'Okunacak':      { icon: 'bookmark-outline',         bg: '#D5E3D7', color: '#3d4a41' },
  'Okunuyor':      { icon: 'book',                     bg: '#7b9e87', color: '#fff' },
  'Okundu':        { icon: 'checkmark-circle-outline', bg: '#e3e3df', color: '#424843' },
  'Yarım Bıraktım':{ icon: 'close-circle-outline',     bg: '#ffdad6', color: '#93000a' },
}

const ACTIVITY_ITEMS = [
  { icon: 'flag-outline',      label: 'Okuma Hedefi',               progress: 45 },
  { icon: 'trophy-outline',    label: 'Okuma Meydan Okumaları',     progress: null },
  { icon: 'library-outline',   label: 'Favori Türleri Düzenle',     progress: null },
]

interface Props {
  embedded?: boolean
}

export default function MyBooksScreen({ embedded = false }: Props) {
  const Wrapper = embedded ? View : SafeAreaView
  const [shelves, setShelves] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchShelves() }, [])

  async function fetchShelves() {
    try {
      const token = await getToken()
      if (!token) { setLoading(false); return }
      const res = await fetch(`${API_URL}/shelves/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setShelves(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Wrapper style={styles.safe}>

      {/* TopAppBar — sadece standalone modda göster */}
      {!embedded && (
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Ionicons name="book" size={22} color={COLORS.primary} />
            <Text style={styles.title}>Kitaplarım</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scroll, embedded && { paddingBottom: 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* RAFLAR */}
        <SectionHeader title="RAFLAR" />

        <TouchableOpacity style={styles.progressBtn}>
          <Ionicons name="sync-outline" size={18} color={COLORS.primary} />
          <Text style={styles.progressBtnText}>Okuma ilerlemenizi güncelleyin</Text>
        </TouchableOpacity>

        <View style={styles.shelfList}>
          {loading ? null : shelves.map((shelf) => {
            const meta = SHELF_ICONS[shelf.name] ?? { icon: 'bookmarks-outline', bg: '#eeeeeb', color: '#424843' }
            return (
              <TouchableOpacity key={shelf.id} style={styles.shelfCard}>
                <View style={[styles.shelfIcon, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={24} color={meta.color} />
                </View>
                <View style={styles.shelfInfo}>
                  <Text style={[styles.shelfLabel, shelf.name === 'Okunuyor' && styles.shelfLabelBold]}>
                    {shelf.name}
                  </Text>
                  <Text style={styles.shelfCount}>{shelf.shelfBooks?.length ?? 0} Kitap</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.outline} />
              </TouchableOpacity>
            )
          })}
        </View>

        <TouchableOpacity style={styles.seeAllBtn}>
          <Text style={styles.seeAllText}>TÜMÜNÜ GÖR</Text>
        </TouchableOpacity>

        {/* ETİKETLER */}
        <SectionHeader title="ETİKETLER" />

        <View style={styles.tagsEmpty}>
          <Text style={styles.tagsEmptyText}>Henüz etiketin yok...</Text>
          <TouchableOpacity style={styles.addTagBtn}>
            <Ionicons name="add-circle" size={18} color={COLORS.primary} />
            <Text style={styles.addTagText}>Yeni etiket veya raf oluştur</Text>
          </TouchableOpacity>
        </View>

        {/* OKUMA AKTİVİTESİ */}
        <SectionHeader title="OKUMA AKTİVİTESİ" />

        <View style={styles.activityCard}>
          {ACTIVITY_ITEMS.map((item, i) => (
            <View key={item.label}>
              <TouchableOpacity style={styles.activityRow}>
                <Ionicons name={item.icon as any} size={26} color={COLORS.primary} />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityLabel}>{item.label}</Text>
                  {item.progress !== null && (
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.outline} />
              </TouchableOpacity>
              {i < ACTIVITY_ITEMS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { key: 'home',    icon: 'home-outline',    label: 'Ana Sayfa' },
          { key: 'books',   icon: 'library',         label: 'Kitaplarım', active: true },
          { key: 'explore', icon: 'compass-outline', label: 'Keşfet' },
          { key: 'search',  icon: 'search-outline',  label: 'Arama' },
          { key: 'more',    icon: 'ellipsis-horizontal', label: 'Daha Fazla' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.navItem, tab.active && styles.navItemActive]}
          >
            <Ionicons
              name={tab.icon as any}
              size={22}
              color={tab.active ? COLORS.onSurfaceVariant : COLORS.outline}
            />
            <Text style={[styles.navLabel, tab.active && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

    </Wrapper>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.surface,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '600', color: COLORS.primary },
  iconBtn: { padding: 8, borderRadius: 20 },

  scroll: { paddingHorizontal: 16, paddingBottom: 90, paddingTop: 8 },

  sectionHeader: { alignItems: 'center', marginTop: 28, marginBottom: 16 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', letterSpacing: 2,
    color: COLORS.onSurface, textTransform: 'uppercase',
  },
  sectionLine: {
    width: 48, height: 2, backgroundColor: COLORS.primary,
    opacity: 0.3, marginTop: 4, borderRadius: 1,
  },

  progressBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 16,
    paddingVertical: 14, paddingHorizontal: 24,
    borderWidth: 2, borderColor: COLORS.primaryContainer,
    borderRadius: 12,
  },
  progressBtnText: { fontSize: 14, fontWeight: '500', color: COLORS.primary },

  shelfList: { gap: 10 },
  shelfCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(193,200,193,0.3)',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  shelfIcon: {
    width: 56, height: 56, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  shelfInfo: { flex: 1 },
  shelfLabel: { fontSize: 15, fontWeight: '500', color: COLORS.onSurface },
  shelfLabelBold: { fontWeight: '700', color: COLORS.primary },
  shelfCount: { fontSize: 12, color: COLORS.outline, marginTop: 2 },

  seeAllBtn: { alignItems: 'center', marginTop: 12 },
  seeAllText: {
    fontSize: 14, fontWeight: '700', color: COLORS.primary,
    letterSpacing: 0.5, textDecorationLine: 'underline',
  },

  tagsEmpty: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.outlineVariant,
    borderRadius: 24, padding: 32, alignItems: 'center',
  },
  tagsEmptyText: {
    fontSize: 15, color: COLORS.outline, fontStyle: 'italic', marginBottom: 12,
  },
  addTagBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addTagText: { fontSize: 14, fontWeight: '500', color: COLORS.primary },

  activityCard: {
    backgroundColor: '#fff', borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(193,200,193,0.2)',
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, paddingHorizontal: 20,
  },
  activityInfo: { flex: 1 },
  activityLabel: { fontSize: 15, fontWeight: '500', color: COLORS.onSurface },
  progressTrack: {
    marginTop: 6, height: 4, borderRadius: 4,
    backgroundColor: COLORS.outlineVariant, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  divider: { height: 1, backgroundColor: COLORS.outlineVariant, marginHorizontal: 20 },

  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16, paddingVertical: 8, paddingHorizontal: 4,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 8,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4, gap: 2 },
  navItemActive: {},
  navLabel: { fontSize: 11, fontWeight: '600', color: COLORS.outline },
  navLabelActive: { color: COLORS.onSurfaceVariant },
})

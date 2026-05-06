import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants/colors'
import { useLayout } from '../hooks/useLayout'
import MyBooksScreen from './MyBooksScreen'
import DiscoverScreen from './DiscoverScreen'
import SearchScreen from './SearchScreen'
import MoreScreen from './MoreScreen'

interface Props {
  onLogout?: () => void
}

export default function HomeScreen({ onLogout }: Props) {
  const layout = useLayout()
  const [showMore, setShowMore] = useState(false)
  const [activeTab, setActiveTab] = useState('home')

  return (
    <>
    <SafeAreaView style={styles.safe}>

      {/* TopAppBar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Ionicons name="book" size={24} color={COLORS.primary} />
          <Text style={styles.brandName}>Readora</Text>
        </View>

        {layout.isTablet && (
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.outline} style={{ marginRight: 6 }} />
            <TextInput
              placeholder="Başlık, yazar veya ISBN"
              placeholderTextColor={COLORS.outline}
              style={styles.searchInput}
            />
            <Ionicons name="camera-outline" size={18} color={COLORS.outline} style={{ marginLeft: 6 }} />
          </View>
        )}

        <View style={styles.topBarRight}>
          {!layout.isTablet && (
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'books'    && <MyBooksScreen embedded />}
      {activeTab === 'discover' && <DiscoverScreen embedded />}
      {activeTab === 'search'   && <SearchScreen embedded />}

      {activeTab === 'home' && <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <LinearGradient
          colors={['#7B9E87', '#5C8070']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Kitaplarla Yaşa 📖</Text>
            <Text style={styles.heroDesc}>
              Okuma yolculuğuna devam et. Raflarını düzenle, yorum yap, arkadaşlarını takip et.
            </Text>
            <TouchableOpacity style={styles.heroBtn}>
              <Text style={styles.heroBtnText}>Kitap Ara</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.heroImageBox}>
            <Ionicons name="library" size={64} color="rgba(255,255,255,0.5)" />
          </View>
        </LinearGradient>

        <View style={[styles.grid, layout.isTablet && styles.gridTablet]}>

          {/* Son Aktiviteler */}
          <View style={[styles.section, layout.isTablet && styles.sectionWide]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Tümünü gör</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="newspaper-outline" size={40} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>Henüz güncelleme yok</Text>
              <Text style={styles.emptyDesc}>
                Arkadaşlarını takip ederek veya öne çıkan okuyucuları keşfederek okuma güncellemelerini burada gör.
              </Text>
              <TouchableOpacity style={styles.findFriendsBtn}>
                <Text style={styles.findFriendsBtnText}>Arkadaş Bul</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hızlı Erişim */}
          <View style={[styles.section, layout.isTablet && styles.sectionNarrow]}>
            <Text style={[styles.sectionTitle, { marginBottom: 10, paddingHorizontal: 4 }]}>
              Hızlı Erişim
            </Text>
            <View style={styles.quickGrid}>
              {[
                { label: 'Okuyacağım', icon: 'bookmark-outline',       bg: '#D5E3D7', color: '#3d4a41' },
                { label: 'Okuyorum',   icon: 'book',                   bg: '#C6EBD1', color: COLORS.primary },
                { label: 'Okudum',     icon: 'checkmark-circle-outline', bg: '#D8E6DA', color: '#3d4a41' },
                { label: 'Favoriler',  icon: 'star',                   bg: '#FFDADB', color: '#643c3f' },
              ].map((item) => (
                <TouchableOpacity key={item.label} style={styles.quickCard}>
                  <View style={[styles.quickIconBox, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <Text style={styles.quickLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Şu an okunan */}
            <View style={styles.nowReadingCard}>
              <Text style={styles.nowReadingLabel}>ŞU AN OKUNAN</Text>
              <View style={styles.nowReadingRow}>
                <View style={styles.bookCover} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookTitle}>Yüzyıllık Yalnızlık</Text>
                  <Text style={styles.bookAuthor}>Gabriel García Márquez</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '65%' }]} />
                  </View>
                </View>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {[
          { key: 'home',     icon: 'home-outline',    iconActive: 'home',    label: 'Ana Sayfa' },
          { key: 'books',    icon: 'library-outline', iconActive: 'library', label: 'Kitaplarım' },
          { key: 'discover', icon: 'compass-outline', iconActive: 'compass', label: 'Keşfet' },
          { key: 'search',   icon: 'search-outline',  iconActive: 'search',  label: 'Arama' },
        ].map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={(isActive ? tab.iconActive : tab.icon) as any}
                size={22}
                color={isActive ? COLORS.onSurfaceVariant : COLORS.outline}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          )
        })}
        <TouchableOpacity style={styles.navItem} onPress={() => setShowMore(true)}>
          <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.outline} />
          <Text style={styles.navLabel}>Daha Fazla</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>

    <MoreScreen
      visible={showMore}
      onClose={() => setShowMore(false)}
      onLogout={onLogout}
    />
  </>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: COLORS.surface,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  brandName: { fontSize: 22, fontWeight: '600', color: COLORS.primary },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    marginHorizontal: 16, borderWidth: 1, borderColor: COLORS.outlineVariant,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.onSurface },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  iconBtn: { padding: 8, borderRadius: 20 },
  badge: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.error, borderWidth: 2, borderColor: COLORS.surface,
  },

  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  heroCard: {
    borderRadius: 20, padding: 24, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
  },
  heroContent: { flex: 1, gap: 10 },
  heroTitle: { fontSize: 22, fontWeight: '600', color: '#fff' },
  heroDesc: { fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10, alignSelf: 'flex-start',
  },
  heroBtnText: { fontSize: 14, fontWeight: '500', color: COLORS.primary },
  heroImageBox: {
    width: 80, height: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 16,
  },

  grid: { gap: 20 },
  gridTablet: { flexDirection: 'row', alignItems: 'flex-start' },
  section: {},
  sectionWide: { flex: 2, marginRight: 16 },
  sectionNarrow: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10, paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.onSurface },
  seeAll: { fontSize: 14, fontWeight: '500', color: COLORS.primary },

  emptyCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 32,
    alignItems: 'center', minHeight: 280, justifyContent: 'center',
    borderWidth: 1, borderColor: '#C8DDD0',
  },
  emptyIconBox: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.onSurface, marginBottom: 8 },
  emptyDesc: {
    fontSize: 14, color: COLORS.onSurfaceVariant,
    textAlign: 'center', lineHeight: 20, marginBottom: 20,
  },
  findFriendsBtn: {
    backgroundColor: COLORS.primary, borderRadius: 20,
    paddingHorizontal: 28, paddingVertical: 12,
  },
  findFriendsBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  quickCard: {
    width: '47%', backgroundColor: '#fff',
    borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: '#C8DDD0',
  },
  quickIconBox: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  quickLabel: { fontSize: 13, fontWeight: '500', color: COLORS.onSurface },

  nowReadingCard: {
    marginTop: 16, padding: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.outlineVariant,
  },
  nowReadingLabel: {
    fontSize: 11, fontWeight: '600', color: COLORS.primary,
    letterSpacing: 1, marginBottom: 10,
  },
  nowReadingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bookCover: {
    width: 48, height: 64, borderRadius: 6,
    backgroundColor: COLORS.outlineVariant,
  },
  bookTitle: { fontSize: 14, fontWeight: '500', color: COLORS.onSurface },
  bookAuthor: { fontSize: 12, color: COLORS.outline, marginTop: 2 },
  progressTrack: {
    marginTop: 8, height: 4, borderRadius: 4,
    backgroundColor: COLORS.outlineVariant, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },

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

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' },
  moreSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 24, paddingTop: 12,
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 48, height: 4, borderRadius: 4,
    backgroundColor: COLORS.outlineVariant, alignSelf: 'center', marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingVertical: 14, paddingHorizontal: 8, borderRadius: 16,
  },
  menuLabel: { fontSize: 14, fontWeight: '500', color: COLORS.onSurface },
  menuDivider: { height: 1, backgroundColor: COLORS.outlineVariant, marginVertical: 8, opacity: 0.5 },
})

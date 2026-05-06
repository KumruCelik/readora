import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants/colors'

interface Props {
  embedded?: boolean
}

const CATEGORIES = [
  { key: 'best',    label: 'En İyiler',       icon: 'star',              active: true },
  { key: 'romance', label: 'Romantik',         icon: 'heart-outline' },
  { key: 'fantasy', label: 'Fantastik',        icon: 'book-outline' },
  { key: 'thriller',label: 'Gerilim',          icon: 'warning-outline' },
  { key: 'selfhelp',label: 'Kişisel Gelişim',  icon: 'bulb-outline' },
  { key: 'history', label: 'Tarih',            icon: 'library-outline' },
]

const POPULAR_BOOKS = [
  { title: 'Gece Yarısı Kütüphanesi',       author: 'Matt Haig',          rating: 4.8, bg: '#C6EBD1' },
  { title: 'Bilinmeyen Bir Kadının Mektubu', author: 'Stefan Zweig',       rating: 4.9, bg: '#D5E3D7' },
  { title: 'Sapiens',                         author: 'Yuval Noah Harari',  rating: 4.7, bg: '#D8E6DA' },
  { title: 'Dune',                            author: 'Frank Herbert',      rating: 4.9, bg: '#FFDADB' },
]

const TURKISH_BOOKS = [
  { title: 'Kürk Mantolu Madonna', author: 'Sabahattin Ali', rating: 5.0 },
  { title: 'Tutunamayanlar',       author: 'Oğuz Atay',      rating: 4.9 },
  { title: 'İnce Memed',           author: 'Yaşar Kemal',    rating: 4.8 },
]

const DISCOVER_MORE = [
  { icon: 'gift-outline',   bg: '#C6EBD1', color: COLORS.primary,    title: 'Çekilişler',               desc: 'Haftalık kitap hediyelerimizi kaçırmayın.' },
  { icon: 'newspaper-outline', bg: '#D8E6DA', color: '#546258',      title: 'Haberler ve Röportajlar',  desc: 'Yazarlarla özel sohbetler ve edebiyat dünyasından haberler.' },
  { icon: 'list-outline',   bg: '#FFDADB', color: '#7e5356',          title: 'Öne Çıkan Listeler',      desc: 'Editörlerimizin seçtiği tematik okuma listeleri.' },
]

export default function DiscoverScreen({ embedded = false }: Props) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('best')
  const Wrapper = embedded ? View : SafeAreaView

  return (
    <Wrapper style={styles.safe}>

      {/* TopAppBar — sadece standalone modda */}
      {!embedded && (
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Ionicons name="book" size={22} color={COLORS.primary} />
            <Text style={styles.brandName}>Readora</Text>
          </View>
          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search-outline" size={22} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scroll, embedded && { paddingBottom: 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Arama */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={COLORS.outline} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Kitap, yazar veya tür ara..."
              placeholderTextColor={COLORS.outline}
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </View>

        {/* Kategoriler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setActiveCategory(cat.key)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={isActive ? '#fff' : COLORS.onSurfaceVariant}
                  />
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Popüler Kitaplar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popüler Kitaplar</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Hepsini Gör</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookRow}>
            {POPULAR_BOOKS.map((book) => (
              <TouchableOpacity key={book.title} style={styles.bookCard}>
                <View style={[styles.bookCover, { backgroundColor: book.bg }]}>
                  <Ionicons name="book" size={48} color="rgba(68,102,81,0.2)" />
                </View>
                <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#7e5356" />
                  <Text style={styles.ratingText}>{book.rating}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.moreBtn}>
            <Text style={styles.moreBtnText}>DAHA FAZLA GÖR</Text>
          </TouchableOpacity>
        </View>

        {/* Türkçe Kitaplar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Türkçe Kitaplar</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Hepsini Gör</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookRow}>
            {TURKISH_BOOKS.map((book) => (
              <TouchableOpacity key={book.title} style={styles.bookCard}>
                <View style={[styles.bookCover, { backgroundColor: COLORS.surfaceContainerHigh }]}>
                  <Ionicons name="book-outline" size={48} color="rgba(66,72,67,0.2)" />
                </View>
                <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#7e5356" />
                  <Text style={styles.ratingText}>{book.rating}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.moreBtn}>
            <Text style={styles.moreBtnText}>DAHA FAZLA GÖR</Text>
          </TouchableOpacity>
        </View>

        {/* Keşfetmeye Devam Et */}
        <View style={[styles.section, { paddingBottom: 8 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 14 }]}>Keşfetmeye Devam Et</Text>
          <View style={styles.discoverCard}>
            {DISCOVER_MORE.map((item, i) => (
              <View key={item.title}>
                <TouchableOpacity style={styles.discoverRow}>
                  <View style={[styles.discoverIcon, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <View style={styles.discoverInfo}>
                    <Text style={styles.discoverTitle}>{item.title}</Text>
                    <Text style={styles.discoverDesc}>{item.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
                </TouchableOpacity>
                {i < DISCOVER_MORE.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORS.surface,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandName: { fontSize: 20, fontWeight: '600', color: COLORS.primary },
  topBarRight: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8, borderRadius: 20 },

  scroll: { paddingBottom: 32 },

  searchWrapper: { paddingHorizontal: 16, paddingVertical: 12 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12, paddingHorizontal: 12, height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.onSurface },

  section: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.primary },
  seeAll: { fontSize: 14, fontWeight: '500', color: COLORS.primary },

  chips: { gap: 8, paddingVertical: 4, paddingRight: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: 999,
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.onSurfaceVariant },
  chipTextActive: { color: '#fff' },

  bookRow: { gap: 14, paddingBottom: 4, paddingRight: 8 },
  bookCard: { width: 144 },
  bookCover: {
    width: 144, height: 200, borderRadius: 12,
    marginBottom: 8, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#446651', shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  bookTitle: { fontSize: 13, fontWeight: '500', color: COLORS.onSurface },
  bookAuthor: { fontSize: 12, color: COLORS.outline, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  ratingText: { fontSize: 12, fontWeight: '700', color: COLORS.onSurface },

  moreBtn: {
    marginTop: 14,
    borderWidth: 2, borderColor: COLORS.primary,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  moreBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 },

  discoverCard: {
    backgroundColor: '#fff', borderRadius: 24,
    shadowColor: '#446651', shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
    overflow: 'hidden',
  },
  discoverRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, paddingHorizontal: 16,
  },
  discoverIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  discoverInfo: { flex: 1 },
  discoverTitle: { fontSize: 15, fontWeight: '500', color: COLORS.onSurface },
  discoverDesc: { fontSize: 12, color: COLORS.outline, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.outlineVariant, marginHorizontal: 16 },
})

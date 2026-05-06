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
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants/colors'

interface Props {
  embedded?: boolean
}

const GENRE_CARDS = [
  { label: 'Macera',         icon: 'compass',          colors: ['#1e3a8a', '#3b82f6'] as const },
  { label: 'Tarih',          icon: 'library',           colors: ['#581c87', '#a855f7'] as const },
  { label: 'Edebiyat',       icon: 'book',              colors: ['#14532d', '#22c55e'] as const },
  { label: 'Kısa Hikayeler', icon: 'sparkles-outline',  colors: ['#451a03', '#92400e'] as const },
]

const ALL_GENRES = [
  { label: 'Sanat',       icon: 'color-palette-outline' },
  { label: 'Biyografi',   icon: 'person-outline' },
  { label: 'İş Dünyası',  icon: 'briefcase-outline' },
  { label: 'Bilim',       icon: 'flask-outline' },
]

export default function SearchScreen({ embedded = false }: Props) {
  const [query, setQuery] = useState('')
  const [lang, setLang] = useState<'global' | 'tr'>('global')
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
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scroll, embedded && { paddingBottom: 90 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Arama Kutusu */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={20} color={COLORS.outline} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Başlık, yazar veya ISBN ara..."
              placeholderTextColor={COLORS.outline}
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                <Ionicons name="close" size={18} color={COLORS.outline} />
              </TouchableOpacity>
            )}
          </View>

          {/* Dil & Ara */}
          <View style={styles.langRow}>
            <View style={styles.langBtns}>
              <TouchableOpacity
                style={[styles.langBtn, lang === 'global' && styles.langBtnActive]}
                onPress={() => setLang('global')}
              >
                <Text style={[styles.langBtnText, lang === 'global' && styles.langBtnTextActive]}>
                  🌍 Global
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.langBtnAlt, lang === 'tr' && styles.langBtnActive]}
                onPress={() => setLang('tr')}
              >
                <Text style={[styles.langBtnText, lang === 'tr' && styles.langBtnTextActive]}>
                  🇹🇷 Türkçe
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>Ara</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Türe Göre Keşfet */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>TÜRE GÖRE KEŞFET</Text>
            <View style={styles.sectionLine} />
          </View>
          <Text style={styles.sectionDesc}>
            Popüler türlerde yeni çıkanları, en çok okunanları ve listeleri keşfet.
          </Text>

          {/* Bento Grid */}
          <View style={styles.bentoGrid}>
            {/* Küçük kartlar (2 sütun) */}
            <View style={styles.bentoRow}>
              {GENRE_CARDS.slice(0, 2).map((g) => (
                <TouchableOpacity key={g.label} style={styles.bentoSmall}>
                  <LinearGradient colors={g.colors} style={styles.bentoGradient}>
                    <Ionicons name={g.icon as any} size={28} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.bentoLabel}>{g.label}</Text>
                    <Ionicons
                      name={g.icon as any}
                      size={64}
                      color="rgba(255,255,255,0.15)"
                      style={styles.bentoBgIcon}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {/* Geniş kart */}
            <TouchableOpacity style={styles.bentoWide}>
              <LinearGradient colors={['#1e293b', '#446651']} style={styles.bentoWideGradient}>
                <View style={styles.bentoWideTag}>
                  <Ionicons name="book-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.bentoWideTagText}>ÖNE ÇIKAN</Text>
                </View>
                <Text style={styles.bentoWideTitle}>İlham Verici Kitaplar</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Küçük kartlar (2. sıra) */}
            <View style={styles.bentoRow}>
              {GENRE_CARDS.slice(2, 4).map((g) => (
                <TouchableOpacity key={g.label} style={styles.bentoSmall}>
                  <LinearGradient colors={g.colors} style={styles.bentoGradient}>
                    <Ionicons name={g.icon as any} size={28} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.bentoLabel}>{g.label}</Text>
                    <Ionicons
                      name={g.icon as any}
                      size={64}
                      color="rgba(255,255,255,0.15)"
                      style={styles.bentoBgIcon}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Tüm Türler */}
        <View style={styles.section}>
          <Text style={styles.allGenresTitle}>Tüm Türler</Text>
          <View style={styles.genreList}>
            {ALL_GENRES.map((g, i) => (
              <View key={g.label}>
                <TouchableOpacity style={styles.genreRow}>
                  <View style={styles.genreIconBox}>
                    <Ionicons name={g.icon as any} size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.genreLabel}>{g.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.outlineVariant} />
                </TouchableOpacity>
                {i < ALL_GENRES.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.moreBtn}>
            <Text style={styles.moreBtnText}>DAHA FAZLA TÜR KEŞFET</Text>
          </TouchableOpacity>
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
  iconBtn: { padding: 8, borderRadius: 20 },

  scroll: { paddingBottom: 32 },

  searchSection: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EEF2EC', borderRadius: 12,
    paddingHorizontal: 12, height: 48,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.onSurface },
  clearBtn: { padding: 4 },

  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  langBtns: { flexDirection: 'row', gap: 8 },
  langBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: 999,
  },
  langBtnAlt: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(193,200,193,0.3)',
  },
  langBtnActive: { backgroundColor: COLORS.primary },
  langBtnText: { fontSize: 13, fontWeight: '500', color: COLORS.onSurfaceVariant },
  langBtnTextActive: { color: '#fff' },
  searchBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 8,
  },
  searchBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  section: { paddingHorizontal: 16, paddingTop: 24 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    color: COLORS.onSurface, opacity: 0.6,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: COLORS.outlineVariant, opacity: 0.3 },
  sectionDesc: { fontSize: 15, color: COLORS.onSurfaceVariant, lineHeight: 22, marginBottom: 16 },

  bentoGrid: { gap: 10 },
  bentoRow: { flexDirection: 'row', gap: 10 },
  bentoSmall: { flex: 1, height: 120, borderRadius: 24, overflow: 'hidden' },
  bentoGradient: { flex: 1, padding: 14, justifyContent: 'flex-end' },
  bentoLabel: { fontSize: 15, fontWeight: '700', color: '#fff', marginTop: 4 },
  bentoBgIcon: { position: 'absolute', bottom: -10, right: -10 },

  bentoWide: { height: 148, borderRadius: 28, overflow: 'hidden' },
  bentoWideGradient: { flex: 1, padding: 20, justifyContent: 'flex-end' },
  bentoWideTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  bentoWideTagText: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.8)',
  },
  bentoWideTitle: { fontSize: 22, fontWeight: '600', color: '#fff' },

  allGenresTitle: { fontSize: 18, fontWeight: '600', color: COLORS.onSurface, marginBottom: 12 },
  genreList: {
    backgroundColor: '#fff', borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(193,200,193,0.3)',
    overflow: 'hidden',
  },
  genreRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 16,
  },
  genreIconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  genreLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: COLORS.onSurface },
  divider: { height: 1, backgroundColor: 'rgba(193,200,193,0.2)', marginHorizontal: 16 },

  moreBtn: {
    marginTop: 14,
    borderWidth: 2, borderColor: COLORS.primary,
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
  },
  moreBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.5 },
})

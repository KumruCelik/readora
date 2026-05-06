import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants/colors'
import { clearAll } from '../utils/storage'

interface Props {
  visible: boolean
  onClose: () => void
  onLogout?: () => void
}

const MENU_ITEMS = [
  { emoji: '👤', label: 'Profilim' },
  { emoji: '👥', label: 'Arkadaşlar' },
  { emoji: '👨‍👩‍👧‍👦', label: 'Gruplar' },
  { emoji: '📖', label: 'Okuma Meydan Okuması' },
  { emoji: '🎁', label: 'Çekilişler' },
  { emoji: '⭐', label: 'Sana Özel Seçimler' },
  { emoji: '🏆', label: 'Yılın En İyileri' },
  { emoji: '📷', label: 'Kitap Tara' },
  { emoji: '⚙️', label: 'Ayarlar' },
  { emoji: '❓', label: 'Yardım' },
]

export default function MoreScreen({ visible, onClose, onLogout }: Props) {
  async function handleLogout() {
    await clearAll()
    onClose()
    onLogout?.()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Arka plan overlay */}
      <Pressable style={styles.overlay} onPress={onClose} />

      {/* Bottom Sheet */}
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handleWrapper}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daha Fazla</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color={COLORS.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* İçerik */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* 3 Sütunlu Grid */}
          <View style={styles.grid}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.gridItem}
                onPress={onClose}
              >
                <View style={styles.gridIconBox}>
                  <Text style={styles.gridEmoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.gridLabel} numberOfLines={2}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ayırıcı */}
          <View style={styles.divider} />

          {/* Çıkış Yap */}
          <TouchableOpacity
            style={styles.logoutRow}
            onPress={handleLogout}
          >
            <Text style={styles.logoutEmoji}>🚪</Text>
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>

          {/* Versiyon */}
          <Text style={styles.version}>Readora v1.0.0</Text>
        </ScrollView>

        <View style={styles.safeBottom} />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 16,
  },
  handleWrapper: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant,
  },
  headerTitle: { fontSize: 20, fontWeight: '600', color: COLORS.onSurface },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingBottom: 8 },

  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, paddingTop: 24,
    gap: 0,
  },
  gridItem: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 8,
  },
  gridIconBox: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1, borderColor: COLORS.outlineVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  gridEmoji: { fontSize: 28 },
  gridLabel: {
    fontSize: 13, fontWeight: '500', color: COLORS.onSurface,
    textAlign: 'center', lineHeight: 17,
  },

  divider: {
    height: 1, backgroundColor: COLORS.outlineVariant,
    marginHorizontal: 20, marginTop: 24, marginBottom: 4,
  },

  logoutRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 24, paddingVertical: 16,
  },
  logoutEmoji: { fontSize: 20 },
  logoutText: { fontSize: 16, fontWeight: '500', color: COLORS.error },

  version: {
    textAlign: 'center', fontSize: 12,
    color: COLORS.outline, marginBottom: 8, marginTop: 4,
  },

  safeBottom: { height: 24, backgroundColor: COLORS.surface },
})

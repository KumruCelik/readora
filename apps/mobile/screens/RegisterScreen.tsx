import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants/colors'
import { useLayout } from '../hooks/useLayout'
import { saveToken, saveUser } from '../utils/storage'
import { API_URL } from '../constants/config'

interface Props {
  onNavigateToLogin: () => void
  onRegisterSuccess: () => void
}

export default function RegisterScreen({ onNavigateToLogin, onRegisterSuccess }: Props) {
  const layout = useLayout()
  const [name, setName]                       = useState('')
  const [username, setUsername]               = useState('')
  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword]       = useState(false)
  const [showConfirm, setShowConfirm]         = useState(false)
  const [loading, setLoading]                 = useState(false)

  async function handleRegister() {
    if (!username || !email || !password) {
      Alert.alert('Hata', 'Zorunlu alanları doldurun')
      return
    }
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor')
      return
    }
    if (password.length < 8) {
      Alert.alert('Hata', 'Şifre en az 8 karakter olmalı')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      })
      const data = await res.json()
      if (data.success) {
        await saveToken(data.data.accessToken)
        await saveUser(data.data.user)
        onRegisterSuccess()
      } else {
        Alert.alert('Hata', data.error?.message || 'Kayıt başarısız')
      }
    } catch {
      Alert.alert('Hata', 'Sunucuya bağlanılamadı. IP adresini kontrol et.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryContainer]}
            style={styles.hero}
          >
            <TouchableOpacity style={styles.backBtn} onPress={onNavigateToLogin}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Image
              source={require('../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.heroTitle, { fontSize: layout.fontSize.heroTitle }]}>
              Readora
            </Text>
            <Text style={[styles.heroSub, { fontSize: layout.fontSize.heroSub }]}>
              Kitaplarla Yaşa
            </Text>
          </LinearGradient>

          {/* Card */}
          <View style={[
            styles.cardWrapper,
            { marginTop: 16, marginHorizontal: layout.cardMx }
          ]}>
            <View style={[
              styles.card,
              { padding: layout.cardPadding },
              layout.isTablet && { maxWidth: layout.cardMaxWidth, alignSelf: 'center', width: '100%' },
            ]}>
              {/* Tabs */}
              <View style={styles.tabs}>
                <TouchableOpacity style={styles.tab} onPress={onNavigateToLogin}>
                  <Text style={[styles.tabText, { fontSize: layout.fontSize.button }]}>Giriş Yap</Text>
                </TouchableOpacity>
                <View style={[styles.tab, styles.tabActive]}>
                  <Text style={[styles.tabTextActive, { fontSize: layout.fontSize.button }]}>Kayıt Ol</Text>
                </View>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Ad Soyad */}
                <Field label="AD SOYAD" layout={layout}>
                  <Ionicons name="person-outline" size={20} color={COLORS.outline} style={styles.iconLeft} />
                  <TextInput
                    style={[styles.input, { fontSize: layout.fontSize.input }]}
                    placeholder="Adınız Soyadınız"
                    placeholderTextColor={COLORS.outlineVariant}
                    value={name}
                    onChangeText={setName}
                  />
                </Field>

                {/* Kullanıcı Adı */}
                <Field label="KULLANICI ADI *" layout={layout}>
                  <Ionicons name="at" size={20} color={COLORS.outline} style={styles.iconLeft} />
                  <TextInput
                    style={[styles.input, { fontSize: layout.fontSize.input }]}
                    placeholder="kullaniciadi"
                    placeholderTextColor={COLORS.outlineVariant}
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                  />
                </Field>

                {/* E-posta */}
                <Field label="E-POSTA *" layout={layout}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.outline} style={styles.iconLeft} />
                  <TextInput
                    style={[styles.input, { fontSize: layout.fontSize.input }]}
                    placeholder="ornek@email.com"
                    placeholderTextColor={COLORS.outlineVariant}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </Field>

                {/* Şifre */}
                <Field label="ŞİFRE *" layout={layout}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.outline} style={styles.iconLeft} />
                  <TextInput
                    style={[styles.input, { fontSize: layout.fontSize.input }]}
                    placeholder="En az 8 karakter"
                    placeholderTextColor={COLORS.outlineVariant}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.iconRight}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.outline}
                    />
                  </TouchableOpacity>
                </Field>

                {/* Şifre Tekrar */}
                <Field label="ŞİFRE TEKRAR *" layout={layout}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.outline} style={styles.iconLeft} />
                  <TextInput
                    style={[styles.input, { fontSize: layout.fontSize.input }]}
                    placeholder="Şifrenizi tekrar girin"
                    placeholderTextColor={COLORS.outlineVariant}
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(v => !v)} style={styles.iconRight}>
                    <Ionicons
                      name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.outline}
                    />
                  </TouchableOpacity>
                </Field>

                {/* Submit */}
                <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={loading}>
                  <Text style={[styles.submitText, { fontSize: layout.fontSize.button }]}>
                    {loading ? 'Kaydediliyor...' : 'Hesap Oluştur'}
                  </Text>
                </TouchableOpacity>

                {/* Terms */}
                <Text style={styles.termsText}>
                  Hesap oluşturarak{' '}
                  <Text style={styles.termsLink}>Kullanım Koşulları</Text>
                  {' '}ve{' '}
                  <Text style={styles.termsLink}>Gizlilik Politikası</Text>
                  {"'nı kabul etmiş olursunuz."}
                </Text>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>veya şununla kayıt ol</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google */}
                <TouchableOpacity style={styles.googleBtn}>
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                  <Text style={[styles.googleText, { fontSize: layout.fontSize.button }]}>
                    Google ile Kayıt Ol
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  )
}

function Field({
  label,
  layout,
  children,
}: {
  label: string
  layout: { fontSize: { label: number } }
  children: React.ReactNode
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={[styles.label, { fontSize: layout.fontSize.label }]}>{label}</Text>
      <View style={styles.inputRow}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  hero: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingBottom: 48,
    gap: 6,
  },
  backBtn: { position: 'absolute', top: 16, left: 16, padding: 8, borderRadius: 20 },
  logo: { width: 64, height: 64, marginBottom: 4 },
  heroTitle: { fontWeight: '600', color: '#ffffff', letterSpacing: -0.5 },
  heroSub: { fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  cardWrapper: {},
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
    borderWidth: 1, borderColor: 'rgba(193,200,193,0.3)',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant,
    marginBottom: 24,
  },
  tab: { flex: 1, paddingBottom: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primaryContainer },
  tabText: { fontWeight: '500', color: 'rgba(66,72,67,0.6)' },
  tabTextActive: { fontWeight: '700', color: COLORS.primary },
  form: { gap: 16 },
  label: { fontWeight: '600', color: COLORS.onSurfaceVariant, letterSpacing: 0.8, paddingLeft: 4 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EEF2EC',
    borderRadius: 12, borderWidth: 1, borderColor: 'transparent', paddingHorizontal: 4,
  },
  iconLeft: { paddingLeft: 12, paddingRight: 4 },
  iconRight: { paddingRight: 12, paddingLeft: 4 },
  input: { flex: 1, color: COLORS.onSurface, paddingVertical: 12, paddingHorizontal: 8 },
  submitBtn: {
    backgroundColor: '#7B9E87', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
  },
  submitText: { fontWeight: '700', color: '#fff' },
  termsText: { fontSize: 12, color: COLORS.onSurfaceVariant, textAlign: 'center', lineHeight: 18, paddingHorizontal: 8 },
  termsLink: { color: COLORS.primary, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.outlineVariant },
  dividerText: { fontSize: 12, color: COLORS.onSurfaceVariant },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    borderWidth: 1, borderColor: 'rgba(193,200,193,0.3)',
    borderRadius: 16, paddingVertical: 14, backgroundColor: COLORS.surfaceContainerLow,
  },
  googleText: { fontWeight: '600', color: COLORS.onSurface },
})

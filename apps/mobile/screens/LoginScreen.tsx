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
  onNavigateToRegister: () => void
  onLoginSuccess: () => void
}

export default function LoginScreen({ onNavigateToRegister, onLoginSuccess }: Props) {
  const layout = useLayout()
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe]     = useState(false)
  const [loading, setLoading]           = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre zorunludur')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.success) {
        await saveToken(data.data.accessToken)
        await saveUser(data.data.user)
        onLoginSuccess()
      } else {
        Alert.alert('Hata', data.error?.message || 'Giriş başarısız')
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
            colors={[COLORS.primaryContainer, '#5C8070']}
            style={[styles.hero, { height: layout.heroHeight }]}
          >
            <View style={styles.logoCircle}>
              <Image
                source={require('../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
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
            { marginTop: layout.cardMarginTop, marginHorizontal: layout.cardMx }
          ]}>
            <View style={[
              styles.card,
              { padding: layout.cardPadding },
              layout.isTablet && { maxWidth: layout.cardMaxWidth, alignSelf: 'center', width: '100%' },
            ]}>
              {/* Tabs */}
              <View style={styles.tabs}>
                <View style={[styles.tab, styles.tabActive]}>
                  <Text style={[styles.tabTextActive, { fontSize: layout.fontSize.button }]}>
                    Giriş Yap
                  </Text>
                </View>
                <TouchableOpacity style={styles.tab} onPress={onNavigateToRegister}>
                  <Text style={[styles.tabText, { fontSize: layout.fontSize.button }]}>
                    Kayıt Ol
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Email */}
                <View style={styles.field}>
                  <Text style={[styles.label, { fontSize: layout.fontSize.label }]}>E-POSTA</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name="at" size={20} color={COLORS.onSurfaceVariant} style={styles.iconLeft} />
                    <TextInput
                      style={[styles.input, { fontSize: layout.fontSize.input }]}
                      placeholder="ornek@email.com"
                      placeholderTextColor={COLORS.outlineVariant}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                {/* Şifre */}
                <View style={styles.field}>
                  <Text style={[styles.label, { fontSize: layout.fontSize.label }]}>ŞİFRE</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.onSurfaceVariant} style={styles.iconLeft} />
                    <TextInput
                      style={[styles.input, { fontSize: layout.fontSize.input }]}
                      placeholder="Şifrenizi girin"
                      placeholderTextColor={COLORS.outlineVariant}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.iconRight}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={COLORS.onSurfaceVariant}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Beni hatırla & Şifremi unuttum */}
                <View style={styles.rowBetween}>
                  <TouchableOpacity style={styles.checkRow} onPress={() => setRememberMe(v => !v)}>
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                    <Text style={[styles.checkLabel, { fontSize: layout.fontSize.button }]}>
                      Beni hatırla
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={[styles.forgotText, { fontSize: layout.fontSize.button }]}>
                      Şifreni mi unuttun?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Submit */}
                <LinearGradient
                  colors={[COLORS.primaryContainer, '#5C8070']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} disabled={loading}>
                    <Text style={[styles.submitText, { fontSize: layout.fontSize.button }]}>
                      {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>veya şununla devam et</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Google */}
                <TouchableOpacity style={styles.googleBtn}>
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                  <Text style={[styles.googleText, { fontSize: layout.fontSize.button }]}>
                    Google ile Giriş Yap
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  hero: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  logo: { width: 56, height: 56 },
  heroTitle: { fontWeight: '600', color: '#fff', letterSpacing: -0.5 },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  cardWrapper: {},
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
    borderWidth: 1, borderColor: 'rgba(193,200,193,0.3)',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant,
    marginBottom: 24,
  },
  tab: { flex: 1, paddingBottom: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontWeight: '500', color: 'rgba(66,72,67,0.6)' },
  tabTextActive: { fontWeight: '600', color: COLORS.primary },
  form: { gap: 18 },
  field: { gap: 6 },
  label: { fontWeight: '600', color: COLORS.onSurfaceVariant, letterSpacing: 0.8, paddingLeft: 4 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12, borderWidth: 1, borderColor: 'transparent', paddingHorizontal: 4,
  },
  iconLeft: { paddingLeft: 12, paddingRight: 4 },
  iconRight: { paddingRight: 12, paddingLeft: 4 },
  input: { flex: 1, color: COLORS.onSurface, paddingVertical: 14, paddingHorizontal: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: COLORS.outline,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkLabel: { color: COLORS.onSurfaceVariant },
  forgotText: { fontWeight: '600', color: COLORS.primaryContainer },
  submitGradient: { borderRadius: 16, overflow: 'hidden' },
  submitBtn: { paddingVertical: 16, alignItems: 'center' },
  submitText: { fontWeight: '700', color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.outlineVariant },
  dividerText: { fontSize: 12, color: COLORS.onSurfaceVariant },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    borderWidth: 1, borderColor: 'rgba(193,200,193,0.6)',
    borderRadius: 16, paddingVertical: 14, backgroundColor: COLORS.surface,
  },
  googleText: { fontWeight: '600', color: COLORS.onSurfaceVariant },
})

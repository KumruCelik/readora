import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import LoginScreen from './screens/LoginScreen'
import RegisterScreen from './screens/RegisterScreen'
import HomeScreen from './screens/HomeScreen'
import { getToken } from './utils/storage'
import { COLORS } from './constants/colors'

type Screen = 'login' | 'register' | 'home'

export default function App() {
  const [screen, setScreen] = useState<Screen>('login')
  const [loading, setLoading] = useState(true)

  useEffect(() => { checkToken() }, [])

  async function checkToken() {
    try {
      const token = await getToken()
      if (token) setScreen('home')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={screen === 'home' ? 'dark' : 'light'} />
      {screen === 'login' && (
        <LoginScreen
          onNavigateToRegister={() => setScreen('register')}
          onLoginSuccess={() => setScreen('home')}
        />
      )}
      {screen === 'register' && (
        <RegisterScreen
          onNavigateToLogin={() => setScreen('login')}
          onRegisterSuccess={() => setScreen('home')}
        />
      )}
      {screen === 'home' && (
        <HomeScreen onLogout={() => setScreen('login')} />
      )}
    </SafeAreaProvider>
  )
}

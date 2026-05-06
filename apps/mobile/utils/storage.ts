import AsyncStorage from '@react-native-async-storage/async-storage'

export async function saveToken(token: string) {
  await AsyncStorage.setItem('accessToken', token)
}

export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('accessToken')
}

export async function removeToken() {
  await AsyncStorage.removeItem('accessToken')
}

export async function saveUser(user: any) {
  await AsyncStorage.setItem('user', JSON.stringify(user))
}

export async function getUser() {
  const data = await AsyncStorage.getItem('user')
  return data ? JSON.parse(data) : null
}

export async function removeUser() {
  await AsyncStorage.removeItem('user')
}

export async function clearAll() {
  await AsyncStorage.multiRemove(['accessToken', 'user'])
}
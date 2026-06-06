import { signInSchema } from '@omi/api'
import { theme } from '@omi/design-tokens'
import { Stack, useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { mobileAuthClient } from '../lib/mobile-services'

export default function LoginScreen() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  async function signIn() {
    const parsed = signInSchema.safeParse({ username, password })
    if (!parsed.success) {
      setError('아이디와 8자 이상의 비밀번호를 확인해주세요.')
      return
    }
    setPending(true)
    setError(undefined)
    try {
      await mobileAuthClient.signIn(parsed.data)
      router.replace('/(tabs)/account')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '로그인하지 못했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: true, title: '' }} />
      <View style={styles.wrap}>
        <Text style={styles.label}>MY OMI</Text>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.body}>주문과 배송, 저장한 상품을 이어서 확인하세요.</Text>
        <View style={styles.form}>
          <TextInput autoCapitalize="none" autoComplete="username" accessibilityLabel="아이디" onChangeText={setUsername} placeholder="아이디" style={styles.input} value={username} />
          <TextInput autoCapitalize="none" autoComplete="current-password" accessibilityLabel="비밀번호" onChangeText={setPassword} placeholder="비밀번호" secureTextEntry style={styles.input} value={password} />
          {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
          <Pressable accessibilityRole="button" disabled={pending} onPress={signIn} style={styles.button}><Text style={styles.buttonText}>{pending ? 'Signing in…' : 'Sign in'}</Text></Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.paper },
  wrap: { flex: 1, justifyContent: 'center', padding: 24 },
  label: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1.4 },
  title: { fontFamily: 'serif', fontSize: 62, marginVertical: 12 },
  body: { color: theme.colors.muted, lineHeight: 22 },
  form: { marginTop: 38, gap: 18 },
  input: { minHeight: 52, borderBottomWidth: 1, borderColor: theme.colors.ink, color: theme.colors.ink },
  error: { color: '#8b2f20', fontSize: 12 },
  button: { minHeight: 52, backgroundColor: theme.colors.ink, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: theme.colors.white, fontWeight: '700' },
})

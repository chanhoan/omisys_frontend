import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { MobileCartProvider } from '../components/mobile-cart-provider'
import { useAppTheme } from '../lib/use-app-theme'

export default function RootLayout() {
  const theme = useAppTheme()
  return (
    <SafeAreaProvider>
      <MobileCartProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ contentStyle: { backgroundColor: theme.colors.background }, headerShown: false, headerStyle: { backgroundColor: theme.colors.surface }, headerTintColor: theme.colors.text }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="products/[productId]" />
          <Stack.Screen name="cart" options={{ presentation: 'modal' }} />
          <Stack.Screen name="login" />
          <Stack.Screen name="orders/[orderId]" />
          <Stack.Screen name="checkout/result" />
        </Stack>
      </MobileCartProvider>
    </SafeAreaProvider>
  )
}

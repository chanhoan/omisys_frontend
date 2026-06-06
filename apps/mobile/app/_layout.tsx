import { Stack } from 'expo-router'
import { theme } from '@omi/design-tokens'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: theme.colors.paper }, headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="products/[productId]" />
        <Stack.Screen name="cart" options={{ presentation: 'modal' }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="orders/[orderId]" />
        <Stack.Screen name="checkout/result" />
      </Stack>
    </SafeAreaProvider>
  )
}

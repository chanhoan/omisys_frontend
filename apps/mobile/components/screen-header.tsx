import { Link } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '../lib/use-app-theme'
import { useMobileCart } from './mobile-cart-provider'

export function ScreenHeader({ title = 'OMI' }: { title?: string }) {
  const theme = useAppTheme()
  const { itemCount } = useMobileCart()
  return (
    <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      <Text accessibilityRole="header" style={[styles.wordmark, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.actions}>
        <Link accessibilityLabel="검색" href="/(tabs)/search" style={[styles.action, { color: theme.colors.text }]}>검색</Link>
        <Link accessibilityLabel={`장바구니, ${itemCount}개`} href="/cart" style={[styles.action, { color: theme.colors.text }]}>백 · {itemCount}</Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { minHeight: 52, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  wordmark: { fontSize: 21, fontWeight: '800', letterSpacing: -0.8 },
  actions: { flexDirection: 'row', gap: 18 },
  action: { fontSize: 12, lineHeight: 44 },
})

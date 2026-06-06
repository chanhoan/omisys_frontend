import { Link } from 'expo-router'
import { theme } from '@omi/design-tokens'
import { StyleSheet, Text, View } from 'react-native'

export function ScreenHeader({ title = 'OMI' }: { title?: string }) {
  return (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={styles.wordmark}>{title}</Text>
      <View style={styles.actions}>
        <Link accessibilityLabel="검색" href="/(tabs)/search" style={styles.action}>Search</Link>
        <Link accessibilityLabel="장바구니" href="/cart" style={styles.action}>Bag · 0</Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { minHeight: 56, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.paper },
  wordmark: { color: theme.colors.ink, fontFamily: 'serif', fontSize: 25, fontWeight: '700', letterSpacing: 2 },
  actions: { flexDirection: 'row', gap: 18 },
  action: { color: theme.colors.ink, fontSize: 11, lineHeight: 44, textTransform: 'uppercase' },
})

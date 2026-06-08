import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '../lib/use-app-theme'
import { useMobileCart } from './mobile-cart-provider'

export function ScreenHeader({ title = 'OMI' }: { title?: string }) {
  const theme = useAppTheme()
  const { itemCount } = useMobileCart()
  return (
    <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      <Text accessibilityRole="header" style={[styles.wordmark, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.actions}>
        <Link asChild href="/(tabs)/search">
          <Pressable accessibilityLabel="검색" accessibilityRole="button" style={styles.iconLink}>
            <View style={[styles.searchIcon, { borderColor: theme.colors.text }]}>
              <View style={[styles.searchHandle, { backgroundColor: theme.colors.text }]} />
            </View>
          </Pressable>
        </Link>
        <Link asChild href="/cart">
          <Pressable accessibilityLabel={`장바구니, ${itemCount}개`} accessibilityRole="button" style={styles.cartLink}>
            <View style={[styles.bagIcon, { borderColor: theme.colors.text }]}>
              <View style={[styles.bagHandle, { borderColor: theme.colors.text }]} />
            </View>
            {itemCount > 0 ? <Text style={styles.cartCount}>{itemCount}</Text> : null}
          </Pressable>
        </Link>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { minHeight: 52, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  wordmark: { fontSize: 21, fontWeight: '800', letterSpacing: -0.8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconLink: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  searchIcon: { width: 17, height: 17, borderWidth: 1.5, borderRadius: 9, marginBottom: 3, marginRight: 3 },
  searchHandle: { position: 'absolute', width: 7, height: 1.5, right: -5, bottom: -3, borderRadius: 2, transform: [{ rotate: '45deg' }] },
  cartLink: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  bagIcon: { width: 18, height: 17, borderWidth: 1.5, borderRadius: 3, marginTop: 4 },
  bagHandle: { position: 'absolute', left: 4, top: -6, width: 8, height: 7, borderWidth: 1.5, borderBottomWidth: 0, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  cartCount: { position: 'absolute', right: -2, top: -2, minWidth: 17, height: 17, paddingHorizontal: 4, borderRadius: 9, overflow: 'hidden', backgroundColor: '#000', color: '#fff', textAlign: 'center', lineHeight: 17, fontSize: 9, fontWeight: '700' },
})

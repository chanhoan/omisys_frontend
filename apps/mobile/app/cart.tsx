import { formatWon } from '@omi/domain'
import { Link, Stack } from 'expo-router'
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useMobileCart } from '../components/mobile-cart-provider'
import { useAppTheme } from '../lib/use-app-theme'

export default function CartScreen() {
  const theme = useAppTheme()
  const { state, subtotal, setQuantity, remove } = useMobileCart()

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: '장바구니', headerStyle: { backgroundColor: theme.colors.surface }, headerTintColor: theme.colors.text }} />
      {state.items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.title, { color: theme.colors.text }]}>장바구니가 비어 있습니다.</Text>
          <Text style={[styles.body, { color: theme.colors.textMuted }]}>마음에 드는 제품을 담아보세요.</Text>
          <Link href="/(tabs)/shop" style={[styles.primaryLink, { backgroundColor: theme.colors.accent }]}>쇼핑하기</Link>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {state.items.map(({ product, quantity }) => (
            <View key={product.productId} style={[styles.item, { borderBottomColor: theme.colors.border }]}>
              <Image source={{ uri: product.thumbnailImgUrl }} style={styles.thumb} />
              <View style={styles.itemCopy}>
                <Text style={[styles.name, { color: theme.colors.text }]}>{product.productName}</Text>
                <Text style={[styles.meta, { color: theme.colors.textMuted }]}>{product.mainColor} · {product.size}</Text>
                <Text style={[styles.price, { color: theme.colors.text }]}>{formatWon(product.discountedPrice * quantity)}</Text>
                <View style={styles.actions}>
                  <Pressable onPress={() => setQuantity(product.productId, quantity - 1)}><Text style={[styles.action, { color: theme.colors.accent }]}>−</Text></Pressable>
                  <Text style={{ color: theme.colors.text }}>{quantity}</Text>
                  <Pressable onPress={() => setQuantity(product.productId, quantity + 1)}><Text style={[styles.action, { color: theme.colors.accent }]}>＋</Text></Pressable>
                  <Pressable onPress={() => remove(product.productId)}><Text style={[styles.remove, { color: theme.colors.textMuted }]}>삭제</Text></Pressable>
                </View>
              </View>
            </View>
          ))}
          <View style={[styles.summary, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.summaryRow}><Text style={{ color: theme.colors.textMuted }}>소계</Text><Text style={[styles.total, { color: theme.colors.text }]}>{formatWon(subtotal)}</Text></View>
            <Text style={[styles.note, { color: theme.colors.textMuted }]}>배송비는 결제 단계에서 계산됩니다.</Text>
            <Link href="/checkout/result?status=pending" style={[styles.primaryLink, { backgroundColor: theme.colors.accent }]}>결제 계속하기</Link>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -1 }, body: { marginTop: 10 },
  primaryLink: { color: '#fff', borderRadius: 999, overflow: 'hidden', marginTop: 26, paddingHorizontal: 24, lineHeight: 48, textAlign: 'center', fontWeight: '700' },
  content: { padding: 18, gap: 18 }, item: { flexDirection: 'row', gap: 16, paddingBottom: 18, borderBottomWidth: StyleSheet.hairlineWidth },
  thumb: { width: 110, aspectRatio: .8, borderRadius: 16 }, itemCopy: { flex: 1, paddingVertical: 4 },
  name: { fontSize: 17, fontWeight: '700' }, meta: { fontSize: 12, marginTop: 5 }, price: { fontWeight: '700', marginTop: 12 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 15 }, action: { fontSize: 22 }, remove: { marginLeft: 'auto', fontSize: 12 },
  summary: { marginTop: 8, borderRadius: 24, padding: 22 }, summaryRow: { flexDirection: 'row', justifyContent: 'space-between' }, total: { fontSize: 20, fontWeight: '700' }, note: { fontSize: 12, marginTop: 12 },
})

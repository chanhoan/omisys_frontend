import { catalogProducts } from '@omi/domain'
import { theme } from '@omi/design-tokens'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProductCard } from '../../components/product-card'
import { ScreenHeader } from '../../components/screen-header'
import { useAppTheme } from '../../lib/use-app-theme'

export default function SearchScreen() {
  const appTheme = useAppTheme()
  return <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: appTheme.colors.background }]}><ScreenHeader title="검색" /><ScrollView><View style={styles.search}><Text style={[styles.label, { color: appTheme.colors.textMuted }]}>DISCOVER</Text><TextInput accessibilityLabel="상품 검색" placeholder="상품명, 색상, 카테고리" placeholderTextColor={appTheme.colors.textMuted} style={[styles.input, { color: appTheme.colors.text, backgroundColor: appTheme.colors.surface }]} /></View><Text style={[styles.heading, { color: appTheme.colors.text }]}>지금 인기 있는 제품.</Text><View style={styles.grid}>{catalogProducts.slice(0, 2).map((product) => <ProductCard key={product.productId} product={product} />)}</View></ScrollView></SafeAreaView>
}
const styles = StyleSheet.create({ safe: { flex: 1 }, search: { padding: 24, paddingTop: 54 }, label: { fontSize: 9, letterSpacing: 1.4 }, input: { marginTop: 20, minHeight: 54, borderRadius: 999, paddingHorizontal: 20, fontSize: 17 }, heading: { paddingHorizontal: 18, marginTop: 54, marginBottom: 20, fontSize: 34, fontWeight: '700', letterSpacing: -1.4 }, grid: { padding: 12, flexDirection: 'row', justifyContent: 'space-between' } })

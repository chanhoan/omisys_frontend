import { catalogProducts } from '@omi/domain'
import { theme } from '@omi/design-tokens'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProductCard } from '../../components/product-card'
import { ScreenHeader } from '../../components/screen-header'
import { useAppTheme } from '../../lib/use-app-theme'

export default function ShopScreen() {
  const appTheme = useAppTheme()
  return <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: appTheme.colors.background }]}><ScreenHeader /><ScrollView><View style={styles.title}><Text style={[styles.eyebrow, { color: appTheme.colors.textMuted }]}>ALL PRODUCTS</Text><Text style={[styles.display, { color: appTheme.colors.text }]}>스토어.</Text><Text style={[styles.count, { color: appTheme.colors.textMuted }]}>{catalogProducts.length}개 제품 · 최신순</Text></View><View style={[styles.filters, { borderColor: appTheme.colors.border }]}><Text style={[styles.filter, { backgroundColor: appTheme.colors.surface, color: appTheme.colors.text }]}>카테고리</Text><Text style={[styles.filter, { backgroundColor: appTheme.colors.surface, color: appTheme.colors.text }]}>사이즈</Text><Text style={[styles.filter, { backgroundColor: appTheme.colors.surface, color: appTheme.colors.text }]}>색상</Text><Text style={[styles.filter, { backgroundColor: appTheme.colors.text, color: appTheme.colors.background }]}>정렬 ↓</Text></View><View style={styles.grid}>{catalogProducts.map((product) => <ProductCard key={product.productId} product={product} />)}</View></ScrollView></SafeAreaView>
}

const styles = StyleSheet.create({ safe: { flex: 1 }, title: { padding: 24, paddingTop: 50 }, eyebrow: { fontSize: 9, letterSpacing: 1.4 }, display: { fontSize: 58, fontWeight: '700', letterSpacing: -2.4 }, count: { fontSize: 11 }, filters: { minHeight: 62, paddingHorizontal: 12, gap: 8, flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth }, filter: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, overflow: 'hidden', fontSize: 11 }, grid: { padding: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 30 } })

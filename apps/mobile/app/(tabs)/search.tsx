import { catalogProducts } from '@omi/domain'
import { theme } from '@omi/design-tokens'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProductCard } from '../../components/product-card'
import { ScreenHeader } from '../../components/screen-header'

export default function SearchScreen() {
  return <SafeAreaView edges={['top']} style={styles.safe}><ScreenHeader title="Search" /><ScrollView><View style={styles.search}><Text style={styles.label}>DISCOVER</Text><TextInput accessibilityLabel="상품 검색" placeholder="상품명, 색상, 카테고리" placeholderTextColor={theme.colors.muted} style={styles.input} /></View><Text style={styles.heading}>Trending now</Text><View style={styles.grid}>{catalogProducts.slice(0, 2).map((product) => <ProductCard key={product.productId} product={product} />)}</View></ScrollView></SafeAreaView>
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: theme.colors.paper }, search: { padding: 24, paddingTop: 70 }, label: { fontSize: 9, color: theme.colors.muted, letterSpacing: 1.4 }, input: { marginTop: 20, minHeight: 58, borderBottomWidth: 1, borderColor: theme.colors.ink, color: theme.colors.ink, fontSize: 19 }, heading: { paddingHorizontal: 18, marginTop: 60, marginBottom: 20, fontFamily: 'serif', fontSize: 38 }, grid: { padding: 12, flexDirection: 'row', justifyContent: 'space-between' } })

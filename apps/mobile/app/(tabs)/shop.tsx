import { catalogProducts } from '@omi/domain'
import { theme } from '@omi/design-tokens'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProductCard } from '../../components/product-card'
import { ScreenHeader } from '../../components/screen-header'

export default function ShopScreen() {
  return <SafeAreaView edges={['top']} style={styles.safe}><ScreenHeader /><ScrollView><View style={styles.title}><Text style={styles.eyebrow}>ALL PRODUCTS</Text><Text style={styles.display}>Shop</Text><Text style={styles.count}>{catalogProducts.length} items · Newest</Text></View><View style={styles.filters}><Text>Category</Text><Text>Size</Text><Text>Color</Text><Text>Sort ↓</Text></View><View style={styles.grid}>{catalogProducts.map((product) => <ProductCard key={product.productId} product={product} />)}</View></ScrollView></SafeAreaView>
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: theme.colors.paper }, title: { padding: 24, paddingTop: 50 }, eyebrow: { fontSize: 9, color: theme.colors.muted, letterSpacing: 1.4 }, display: { fontFamily: 'serif', fontSize: 68, color: theme.colors.ink }, count: { color: theme.colors.muted, fontSize: 11 }, filters: { minHeight: 52, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.line }, grid: { padding: 12, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 30 } })

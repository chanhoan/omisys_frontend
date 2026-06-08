import type { Product } from '@omi/api'
import { formatWon, getProductBadge } from '@omi/domain'
import { Link } from 'expo-router'
import { Image, StyleSheet, Text, View } from 'react-native'

import { useAppTheme } from '../lib/use-app-theme'

export function ProductCard({ product }: { product: Product }) {
  const theme = useAppTheme()
  const badge = getProductBadge(product)

  return (
    <Link
      accessibilityLabel={`${product.productName} 상품 보기`}
      href={{ pathname: '/products/[productId]', params: { productId: product.productId } }}
      style={[styles.card, { color: theme.colors.text }]}
    >
      <View>
        <View style={[styles.imageWrap, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Image accessibilityLabel={`${product.productName} 제품 이미지`} source={{ uri: product.thumbnailImgUrl }} style={styles.image} />
          {badge ? <Text style={[styles.badge, { backgroundColor: theme.colors.surface, color: theme.colors.text }, product.soldout && styles.soldout]}>{badge}</Text> : null}
        </View>
        <View style={styles.copy}>
          <Text style={[styles.brand, { color: theme.colors.textMuted }]}>{product.brandName}</Text>
          <Text numberOfLines={1} style={[styles.name, { color: theme.colors.text }]}>{product.productName}</Text>
          <Text style={[styles.price, { color: theme.colors.text }]}>{formatWon(product.discountedPrice)}</Text>
          <View style={styles.meta}><Text style={[styles.metaText, { color: theme.colors.textMuted }]}>{product.mainColor}</Text><Text style={[styles.metaText, { color: theme.colors.textMuted }]}>{product.soldout ? '품절' : `${product.stock}개`}</Text></View>
        </View>
      </View>
    </Link>
  )
}

const styles = StyleSheet.create({
  card: { width: '49%' },
  imageWrap: { aspectRatio: 0.8, position: 'relative', borderRadius: 18, overflow: 'hidden' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  badge: { position: 'absolute', top: 9, left: 9, paddingHorizontal: 7, paddingVertical: 5, fontSize: 8, letterSpacing: 1 },
  soldout: { backgroundColor: '#1d1d1f', color: '#ffffff' },
  copy: { paddingTop: 10, gap: 3 },
  brand: { fontSize: 8, letterSpacing: 1.2 },
  name: { fontSize: 13, fontWeight: '600' },
  price: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  metaText: { fontSize: 8, textTransform: 'uppercase' },
})

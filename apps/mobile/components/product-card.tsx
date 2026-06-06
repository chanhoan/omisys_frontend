import type { Product } from '@omi/api'
import { theme } from '@omi/design-tokens'
import { formatWon, getProductBadge } from '@omi/domain'
import { Link } from 'expo-router'
import { Image, StyleSheet, Text, View } from 'react-native'

export function ProductCard({ product }: { product: Product }) {
  const badge = getProductBadge(product)

  return (
    <Link
      accessibilityLabel={`${product.productName} 상품 보기`}
      href={{ pathname: '/products/[productId]', params: { productId: product.productId } }}
      style={styles.card}
    >
      <View>
        <View style={styles.imageWrap}>
          <Image accessibilityLabel={`${product.productName} 제품 이미지`} source={{ uri: product.thumbnailImgUrl }} style={styles.image} />
          {badge ? <Text style={[styles.badge, product.soldout && styles.soldout]}>{badge}</Text> : null}
        </View>
        <View style={styles.copy}>
          <Text style={styles.brand}>{product.brandName}</Text>
          <Text numberOfLines={1} style={styles.name}>{product.productName}</Text>
          <Text style={styles.price}>{formatWon(product.discountedPrice)}</Text>
          <View style={styles.meta}><Text style={styles.metaText}>{product.mainColor}</Text><Text style={styles.metaText}>{product.soldout ? '품절' : `${product.stock} left`}</Text></View>
        </View>
      </View>
    </Link>
  )
}

const styles = StyleSheet.create({
  card: { width: '49%', color: theme.colors.ink },
  imageWrap: { aspectRatio: 0.8, backgroundColor: '#e5e1d8', position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  badge: { position: 'absolute', top: 9, left: 9, backgroundColor: theme.colors.surface, paddingHorizontal: 7, paddingVertical: 5, fontSize: 8, letterSpacing: 1 },
  soldout: { backgroundColor: theme.colors.ink, color: theme.colors.white },
  copy: { paddingTop: 10, gap: 3 },
  brand: { color: theme.colors.muted, fontSize: 8, letterSpacing: 1.2 },
  name: { color: theme.colors.ink, fontSize: 13, fontWeight: '600' },
  price: { color: theme.colors.ink, fontSize: 12, fontWeight: '700', marginTop: 3 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  metaText: { color: theme.colors.muted, fontSize: 8, textTransform: 'uppercase' },
})

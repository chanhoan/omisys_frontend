import { catalogProducts } from '@omi/domain'
import { theme } from '@omi/design-tokens'
import { Link } from 'expo-router'
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProductCard } from '../../components/product-card'
import { ScreenHeader } from '../../components/screen-header'
import { useAppTheme } from '../../lib/use-app-theme'

export default function HomeScreen() {
  const appTheme = useAppTheme()
  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: appTheme.colors.background }]}>
      <ScreenHeader />
      <ScrollView>
        <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85' }} style={styles.hero}>
          <View style={styles.overlay} />
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrowLight}>F/W 2026 · NIGHT SHIFT</Text>
            <Text style={styles.heroTitle}>Drop 04</Text>
            <Text style={styles.heroBody}>새벽의 무드. 절제된 색과 느슨한 실루엣.</Text>
            <Link href="/(tabs)/shop" style={styles.heroButton}>Shop the drop  →</Link>
          </View>
        </ImageBackground>
        <View style={[styles.intro, { backgroundColor: appTheme.colors.surface, borderBottomColor: appTheme.colors.border }]}>
          <Text style={[styles.eyebrow, { color: appTheme.colors.textMuted }]}>OMI SERVICES</Text>
          <Text style={[styles.display, { color: appTheme.colors.text }]}>입을수록 분명해지는 옷.</Text>
          <Text style={[styles.body, { color: appTheme.colors.textMuted }]}>무료 배송, 14일 이내 반품, 안전한 결제까지 한 번에.</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.heading}><View><Text style={[styles.eyebrow, { color: appTheme.colors.textMuted }]}>LATEST EDIT</Text><Text style={[styles.sectionTitle, { color: appTheme.colors.text }]}>새로 나온 제품.</Text></View><Link href="/(tabs)/shop" style={[styles.viewAll, { color: appTheme.colors.accent }]}>모두 보기 ›</Link></View>
          <View style={styles.grid}>{catalogProducts.map((product) => <ProductCard key={product.productId} product={product} />)}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.paper },
  hero: { height: 620, justifyContent: 'flex-end' },
  overlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,.35)' },
  heroCopy: { padding: 22, paddingBottom: 46 },
  eyebrowLight: { color: '#eeeae1', fontSize: 9, letterSpacing: 1.5, fontWeight: '600' },
  heroTitle: { color: theme.colors.white, fontFamily: 'serif', fontSize: 72, lineHeight: 80, marginTop: 8 },
  heroBody: { color: theme.colors.white, fontSize: 13, marginBottom: 24 },
  heroButton: { color: theme.colors.ink, backgroundColor: theme.colors.white, paddingHorizontal: 18, lineHeight: 48, width: 170, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  intro: { margin: 12, paddingHorizontal: 22, paddingVertical: 40, borderRadius: 26, borderBottomWidth: StyleSheet.hairlineWidth },
  eyebrow: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1.5, fontWeight: '600' },
  display: { fontSize: 38, lineHeight: 41, fontWeight: '700', letterSpacing: -1.7, marginVertical: 18 },
  body: { color: theme.colors.muted, lineHeight: 23, fontSize: 13 },
  section: { paddingHorizontal: 12, paddingVertical: 54 },
  heading: { paddingHorizontal: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  sectionTitle: { fontSize: 34, fontWeight: '700', letterSpacing: -1.4, marginTop: 6 },
  viewAll: { color: theme.colors.ink, fontSize: 11, lineHeight: 44 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 30 },
})

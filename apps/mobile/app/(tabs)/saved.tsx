import { Link } from 'expo-router'
import { theme } from '@omi/design-tokens'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ScreenHeader } from '../../components/screen-header'

export default function SavedScreen() { return <SafeAreaView edges={['top']} style={styles.safe}><ScreenHeader title="Saved" /><View style={styles.empty}><Text style={styles.label}>YOUR EDIT</Text><Text style={styles.title}>Saved</Text><Text style={styles.body}>마음에 둔 상품을 한곳에서 다시 볼 수 있습니다.</Text><Link href="/(tabs)/shop" style={styles.button}>Explore shop</Link></View></SafeAreaView> }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: theme.colors.paper }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }, label: { fontSize: 9, color: theme.colors.muted, letterSpacing: 1.4 }, title: { fontFamily: 'serif', fontSize: 68, marginVertical: 16 }, body: { color: theme.colors.muted, textAlign: 'center', lineHeight: 22 }, button: { marginTop: 28, color: theme.colors.white, backgroundColor: theme.colors.ink, width: 180, textAlign: 'center', lineHeight: 50, fontWeight: '700' } })

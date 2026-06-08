import { Link } from 'expo-router'
import { theme } from '@omi/design-tokens'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ScreenHeader } from '../../components/screen-header'
import { useAppTheme } from '../../lib/use-app-theme'

export default function SavedScreen() { const appTheme = useAppTheme(); return <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: appTheme.colors.background }]}><ScreenHeader title="저장" /><View style={styles.empty}><Text style={[styles.label, { color: appTheme.colors.textMuted }]}>YOUR EDIT</Text><Text style={[styles.title, { color: appTheme.colors.text }]}>저장한 제품.</Text><Text style={[styles.body, { color: appTheme.colors.textMuted }]}>마음에 둔 상품을 한곳에서 다시 볼 수 있습니다.</Text><Link href="/(tabs)/shop" style={[styles.button, { backgroundColor: appTheme.colors.accent }]}>스토어 둘러보기</Link></View></SafeAreaView> }
const styles = StyleSheet.create({ safe: { flex: 1 }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }, label: { fontSize: 9, letterSpacing: 1.4 }, title: { fontSize: 42, fontWeight: '700', letterSpacing: -1.8, marginVertical: 16 }, body: { textAlign: 'center', lineHeight: 22 }, button: { marginTop: 28, color: '#fff', borderRadius: 999, overflow: 'hidden', width: 180, textAlign: 'center', lineHeight: 50, fontWeight: '700' } })

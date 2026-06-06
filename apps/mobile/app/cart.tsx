import { Stack } from 'expo-router'
import { theme } from '@omi/design-tokens'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
export default function CartScreen() { return <SafeAreaView style={styles.safe}><Stack.Screen options={{ headerShown: true, title: 'Bag' }} /><View style={styles.empty}><Text style={styles.title}>Your bag is quiet.</Text><Text style={styles.body}>상품을 담으면 배송지, 쿠폰, 포인트를 확인하고 결제를 진행합니다.</Text></View></SafeAreaView> }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: theme.colors.paper }, empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }, title: { fontFamily: 'serif', fontSize: 38 }, body: { color: theme.colors.muted, textAlign: 'center', lineHeight: 22, marginTop: 14 } })

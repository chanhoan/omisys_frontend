import { Stack, useLocalSearchParams } from 'expo-router'
import { theme } from '@omi/design-tokens'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
export default function OrderScreen() { const { orderId } = useLocalSearchParams<{ orderId: string }>(); return <SafeAreaView style={styles.safe}><Stack.Screen options={{ headerShown: true, title: `Order ${orderId}` }} /><View style={styles.wrap}><Text style={styles.label}>PAYMENT COMPLETE</Text><Text style={styles.title}>Thank you.</Text><Text style={styles.body}>주문 상태를 확인하고 배송이 시작되면 알려드릴게요.</Text></View></SafeAreaView> }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: theme.colors.paper }, wrap: { flex: 1, justifyContent: 'center', padding: 28 }, label: { color: theme.colors.muted, fontSize: 9, letterSpacing: 1.4 }, title: { fontFamily: 'serif', fontSize: 58, marginVertical: 16 }, body: { color: theme.colors.muted, lineHeight: 22 } })

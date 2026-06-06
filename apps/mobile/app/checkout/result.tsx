import { Stack, useLocalSearchParams } from 'expo-router'
import { theme } from '@omi/design-tokens'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
export default function CheckoutResultScreen() { const { orderId } = useLocalSearchParams<{ orderId: string }>(); return <SafeAreaView style={styles.safe}><Stack.Screen options={{ headerShown: true, title: 'Payment' }} /><View style={styles.wrap}><Text style={styles.title}>결제를 완료하지 못했습니다.</Text><Text style={styles.body}>주문 {orderId}의 상태를 다시 확인한 뒤 재시도해주세요. 중복 결제를 방지하기 위해 먼저 주문 내역을 조회합니다.</Text></View></SafeAreaView> }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: theme.colors.paper }, wrap: { flex: 1, justifyContent: 'center', padding: 28 }, title: { fontFamily: 'serif', fontSize: 38, lineHeight: 44 }, body: { color: theme.colors.muted, lineHeight: 23, marginTop: 18 } })

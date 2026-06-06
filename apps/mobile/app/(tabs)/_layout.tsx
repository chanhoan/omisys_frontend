import { Tabs } from 'expo-router'
import { theme } from '@omi/design-tokens'
import { type ColorValue, Text } from 'react-native'

function tabIcon(label: string) {
  function TabIcon({ color }: { color: ColorValue }) {
    return <Text style={{ color, fontSize: 10, fontWeight: '700' }}>{label.slice(0, 1)}</Text>
  }
  return TabIcon
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.colors.ink,
      tabBarInactiveTintColor: '#9b9890',
      tabBarStyle: { backgroundColor: theme.colors.paper, borderTopColor: theme.colors.line, height: 72, paddingTop: 8 },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600', paddingBottom: 8 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('Home') }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop', tabBarIcon: tabIcon('Shop') }} />
      <Tabs.Screen name="search" options={{ title: 'Search', tabBarIcon: tabIcon('Search') }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: tabIcon('Saved') }} />
      <Tabs.Screen name="account" options={{ title: 'You', tabBarIcon: tabIcon('You') }} />
    </Tabs>
  )
}

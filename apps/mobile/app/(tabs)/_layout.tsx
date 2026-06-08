import { Tabs } from 'expo-router'
import { type ColorValue, Text } from 'react-native'

import { useAppTheme } from '../../lib/use-app-theme'

const icons: Record<string, string> = { Home: '⌂', Shop: '▦', Search: '⌕', Saved: '♡', You: '◎' }

function tabIcon(label: string) {
  function TabIcon({ color }: { color: ColorValue }) {
    return <Text style={{ color, fontSize: 21, fontWeight: '500' }}>{icons[label]}</Text>
  }
  return TabIcon
}

export default function TabLayout() {
  const theme = useAppTheme()
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.colors.accent,
      tabBarInactiveTintColor: theme.colors.textMuted,
      tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, height: 78, paddingTop: 7 },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600', paddingBottom: 7 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('Home') }} />
      <Tabs.Screen name="shop" options={{ title: 'Shop', tabBarIcon: tabIcon('Shop') }} />
      <Tabs.Screen name="search" options={{ title: 'Search', tabBarIcon: tabIcon('Search') }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: tabIcon('Saved') }} />
      <Tabs.Screen name="account" options={{ title: 'You', tabBarIcon: tabIcon('You') }} />
    </Tabs>
  )
}

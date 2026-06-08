import { darkTheme, lightTheme } from '@omi/design-tokens'
import { useColorScheme } from 'react-native'

export function useAppTheme() {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme
}

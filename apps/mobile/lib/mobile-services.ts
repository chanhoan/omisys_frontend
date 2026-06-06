import { AuthSession } from './auth-session'
import { MobileAuthClient } from './mobile-auth-client'
import { secureTokenStore } from './secure-token-store'

const gatewayUrl = process.env.EXPO_PUBLIC_OMISYS_GATEWAY_URL ?? 'http://localhost:19091'

export const authSession = new AuthSession(secureTokenStore)
export const mobileAuthClient = new MobileAuthClient({
  baseUrl: gatewayUrl,
  session: authSession,
})

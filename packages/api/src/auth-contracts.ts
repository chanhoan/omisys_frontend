import { z } from 'zod'

export const signInSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(100),
})

export const signUpSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(100),
  email: z.string().trim().email().max(254),
  nickname: z.string().trim().min(1).max(30),
}).transform((value) => ({ ...value, role: 'ROLE_USER' as const }))

export const tokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
})

export type SignInRequest = z.infer<typeof signInSchema>
export type SignUpRequest = z.infer<typeof signUpSchema>
export type TokenPair = z.infer<typeof tokenPairSchema>

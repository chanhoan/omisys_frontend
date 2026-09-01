import { z } from 'zod'

// 가입은 백엔드 @Pattern 과 같아야 "폼 통과 = 서버 통과" 가 성립한다.
// SOURCE: ../omisys UserRequest.java:17,22 (UserRequest.Create)
const USERNAME_PATTERN = /^[a-z0-9]{4,10}$/
const PASSWORD_PATTERN = /^[a-zA-Z0-9_#$%^!-]{8,15}$/
const USERNAME_MESSAGE = '아이디는 영문 소문자와 숫자 4~10자입니다.'
const PASSWORD_MESSAGE = '비밀번호는 8~15자이며 영문·숫자·_#$%^!- 만 사용합니다.'

// 로그인은 가입과 다르다. AuthRequest.SignIn 은 @NotBlank 뿐이고 @Pattern 이 없다.
// 여기에 가입 규칙을 걸면 백엔드에 없는 제약을 프론트가 만들어내는 셈이고, 시드 관리자처럼
// 규칙 밖 자격증명을 가진 계정이 웹으로 로그인할 수 없게 된다.
// SOURCE: ../omisys AuthRequest.java:15-19
export const signInSchema = z.object({
  username: z.string().trim().min(1, '아이디를 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
})

// `role` 은 보내지 않는다 — UserRequest.Create 에 없는 필드라 서버가 조용히 무시했다.
export const signUpSchema = z.object({
  username: z.string().trim().regex(USERNAME_PATTERN, USERNAME_MESSAGE),
  password: z.string().regex(PASSWORD_PATTERN, PASSWORD_MESSAGE),
  email: z.string().trim().email().max(254),
  nickname: z.string().trim().min(1).max(30),
})

export const tokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
})

export type SignInRequest = z.infer<typeof signInSchema>
export type SignUpRequest = z.infer<typeof signUpSchema>
export type TokenPair = z.infer<typeof tokenPairSchema>

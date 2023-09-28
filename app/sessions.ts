import { createCookieSessionStorage } from "@vercel/remix"
import { SECRET_KEY } from "~/lib/env"

type SessionData = {
  accessToken: string
  refreshToken: string
}

type SessionFlashData = {
  authorizationState: string
}

const { getSession, commitSession, destroySession } = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: "__muse_taste_session",
    // domain: "localhost",
    httpOnly: true,
    maxAge: 60,
    path: "/",
    sameSite: "lax",
    secrets: [SECRET_KEY],
    secure: true
  }
})

export { commitSession, destroySession, getSession }

import { createCookieSessionStorage, redirect, type Session } from "@vercel/remix"
import { SECRET_KEY } from "~/lib/env"

type SessionData = {
  accessToken: string
  refreshToken: string
}

type SessionFlashData = {
  message: { type: "error"; content: string }
  authorizationState: string
}

export type RootSession = Session<SessionData, SessionFlashData>

export const { getSession, commitSession, destroySession } = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: "__muse_taste_session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secrets: [SECRET_KEY],
    secure: true
  }
})

export const requireAuthorization = async (session: RootSession) => {
  if (!session.has("accessToken")) {
    session.flash("message", { type: "error", content: "unauthorized" })
    throw redirect("/connect", {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    })
  }
}

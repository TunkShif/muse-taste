import { redirect, type LoaderFunctionArgs } from "@vercel/remix"
import { Spotify } from "~/lib/spotify.server"
import { commitSession, getSession } from "~/sessions.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"))
  const searchParams = new URL(request.url).searchParams

  if (
    searchParams.has("error") ||
    !searchParams.has("code") ||
    !searchParams.get("state") ||
    searchParams.get("state") !== session.get("authorizationState")
  ) {
    // TODO: display error
    return redirect("/connect", {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    })
  }

  const authorizationCode = searchParams.get("code")!
  const { access_token, refresh_token } = await Spotify.requestAccessToken(authorizationCode)

  session.set("accessToken", access_token)
  session.set("refreshToken", refresh_token)

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  })
}

import { redirect, type LoaderFunctionArgs } from "@vercel/remix"
import { Spotify } from "~/lib/spotify.server"
import { generateRandomString } from "~/lib/utils"
import { commitSession, getSession } from "~/sessions.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"))

  const state = generateRandomString(16)

  session.flash("authorizationState", state)

  return redirect(Spotify.generateAuthorizationUrl(state), {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  })
}

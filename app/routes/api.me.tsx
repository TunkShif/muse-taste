import { json, type LoaderFunctionArgs } from "@vercel/remix"
import { createSpotifyClient } from "~/lib/spotify.server"
import { commitSession, getSession } from "~/sessions.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"))
  const spotify = createSpotifyClient(session)
  const response = await spotify.getCurrentUserProfile()

  return json(response, {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  })
}

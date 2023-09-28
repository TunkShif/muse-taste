import { Link, useLoaderData } from "@remix-run/react"
import { json, type LoaderFunctionArgs, type MetaFunction } from "@vercel/remix"
import { createSpotifyClient } from "~/lib/spotify.server"
import { getSession, requireAuthorization } from "~/sessions.server"

export const meta: MetaFunction = () => {
  return [
    { title: "Home - MUSE Taste" },
    { name: "description", content: "Welcome to MUSE Taste!" }
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"))
  await requireAuthorization(session)

  const spotify = createSpotifyClient(session)

  const [profile, artists] = await Promise.all([
    spotify.getCurrentUserProfile(),
    spotify.getTopItems("artists", { limit: 3 })
  ])

  return json({ profile, artists }, {})
}

export default function Home() {
  const { profile, artists } = useLoaderData<typeof loader>()
  // const avatarUrl = profile.images.sort((a, b) => a.width - b.width)[0]
  const avatarUrl = profile.images[0].url

  return (
    <main className="p-6 space-y-8">
      <header className="w-full flex items-center gap-3">
        <Link to={profile.external_urls.spotify} target="_blank">
          <img
            src={avatarUrl}
            alt="user profile avatar"
            className="rounded-full border w-10 h-10"
          />
        </Link>
        <h1 className="text-xl font-semibold text-primary">Welcome, {profile.display_name}</h1>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Top Artists</h2>
        <div className="-mx-6">
          <ul className="flex justify-center items-center gap-6">
            {artists.items.map((artist) => (
              <li key={artist.id}>
                <div className="inline-flex flex-col gap-3 justify-center items-center">
                  <img
                    src={artist.images[0].url}
                    alt={artist.name}
                    className="rounded-full border w-24 h-24 aspect-square"
                  />
                  <h3 className="text-sm font-medium">{artist.name}</h3>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}

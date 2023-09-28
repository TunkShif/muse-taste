import { Link } from "@remix-run/react"
import { redirect, type LoaderFunctionArgs } from "@vercel/remix"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card"
import { SpotifyIcon } from "~/components/ui/icons"
import { getSession } from "~/sessions.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"))

  if (session.has("accessToken")) {
    return redirect("/home")
  }

  return null
}

export default function Connect() {
  return (
    <main className="min-h-screen grid place-items-center px-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Connect to Spotify</CardTitle>
          <CardDescription>Synchronize your listening history.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-center items-center gap-6">
            <SpotifyIcon className="text-primary w-32 h-10" />
            <Button className="w-full" asChild>
              <Link to="/oauth/authorization">Connect</Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm">
            <span className="not-sr-only">*</span> We will not save any of your data from Spotify.
          </p>
        </CardFooter>
      </Card>
    </main>
  )
}

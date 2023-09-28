import { redirect, type LoaderFunctionArgs } from "@vercel/remix"
import { commitSession, getSession } from "~/sessions"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"))
  const searchParams = new URL(request.url).searchParams

  console.log(session.get("authorizationState"))
  console.log(searchParams)

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  })
}

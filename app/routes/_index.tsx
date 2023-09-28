import { redirect, type LoaderFunctionArgs } from "@vercel/remix"
import { getSession, requireAuthorization } from "~/sessions.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"))

  await requireAuthorization(session)

  return redirect("/home")
}

import { IS_DEVELOPMENT, SPOTIFY_CLIENT_ID } from "~/lib/env"

export class Spotify {
  // TODO: production redirect callback url
  static clientId = SPOTIFY_CLIENT_ID
  static redirectUrl = IS_DEVELOPMENT ? "http://localhost:3000/oauth/callback" : ""

  static generateAuthorizationUrl(state: string) {
    // TODO: add scope

    const url = new URL("https://accounts.spotify.com/authorize")
    url.searchParams.append("response_type", "code")
    url.searchParams.append("client_id", this.clientId)
    url.searchParams.append("redirect_uri", this.redirectUrl)
    url.searchParams.append("state", state)

    return url.toString()
  }
}

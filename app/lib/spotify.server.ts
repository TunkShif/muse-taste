import ky from "ky"
import { IS_DEVELOPMENT, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "~/lib/env"
import type { RootSession } from "~/sessions.server"

export type TokenData = {
  access_token: string
  token_type: string
  scope: string
  expires_in: number
  refresh_token: string
}

export type CurrentUserData = {
  display_name: string
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  images: ImageObject[]
  type: string
  uri: string
  followers: {
    href: string | null
    total: number
  }
}

type TopItemsMap = {
  artists: ArtistObject
  tracks: TrackObject
}
export type TopItemsType = "artists" | "tracks"
export type TopItemsTimeRange = `${"long" | "medium" | "short"}_term`
export type TopItemsData<Type extends TopItemsType> = {
  href: string
  limit: number
  offset: number
  next: string | null
  previous: string | null
  total: number
  items: TopItemsMap[Type][]
}

export type ImageObject = {
  url: string
  height: number
  width: number
}

export type ArtistObject = {
  external_urls: {
    spotify: string
  }
  followers: {
    href: string
    total: number
  }
  genres: string[]
  href: string
  id: string
  images: ImageObject[]
  name: string
  popularity: number
  type: string
  uri: string
}

export type TrackObject = {
  album: {
    album_type: string
    total_tracks: number
    available_markets: string[]
    external_urls: {
      spotify: string
    }
    href: string
    id: string
    images: ImageObject[]
    name: string
    release_date: string
    release_date_precision: string
    type: string
    uri: string
    artists: ArtistObject[]
  }
  artists: ArtistObject[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_ids: {
    isrc: string
  }
  external_urls: {
    spotify: string
  }
  href: string
  id: string
  name: string
  popularity: number
  preview_url: string | null
  track_number: number
  type: string
  uri: string
  is_local: boolean
}

export class Spotify {
  // TODO: production redirect callback url
  private static clientId = SPOTIFY_CLIENT_ID
  private static clientSecret = SPOTIFY_CLIENT_SECRET
  private static redirectUrl = IS_DEVELOPMENT ? "http://localhost:3000/oauth/callback" : ""

  private accessToken: string
  private refreshToken: string
  private httpClient: typeof ky

  constructor(private session: RootSession) {
    this.accessToken = this.session.get("accessToken")!
    this.refreshToken = this.session.get("refreshToken")!

    this.httpClient = ky.create({
      prefixUrl: "https://api.spotify.com/v1",
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      },
      retry: {
        limit: 3,
        statusCodes: [401]
      },
      hooks: {
        beforeRetry: [
          async ({ request }) => {
            const { access_token, refresh_token } = await Spotify.refreshAccessToken(
              this.refreshToken
            )
            this.accessToken = access_token
            this.refreshToken = refresh_token
            this.session.set("accessToken", access_token)
            this.session.set("refreshToken", refresh_token)
            request.headers.set("Authorization", `Bearer ${this.accessToken}`)
          }
        ]
      }
    })
  }

  static generateAuthorizationUrl(state: string) {
    const url = new URL("https://accounts.spotify.com/authorize")
    url.searchParams.append("response_type", "code")
    url.searchParams.append("client_id", this.clientId)
    url.searchParams.append("redirect_uri", this.redirectUrl)
    url.searchParams.append("state", state)
    url.searchParams.append("scope", "user-read-private user-read-email user-top-read")

    return url.toString()
  }

  static requestAccessToken(authorizationCode: string) {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")
    const formData = new URLSearchParams()
    formData.append("grant_type", "authorization_code")
    formData.append("code", authorizationCode)
    formData.append("redirect_uri", this.redirectUrl)

    return ky
      .post("https://accounts.spotify.com/api/token", {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      })
      .json<TokenData>()
  }

  static refreshAccessToken(refreshToken: string) {
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")
    const formData = new URLSearchParams()
    formData.append("grant_type", "refresh_token")
    formData.append("refresh_token", refreshToken)

    return ky
      .post("https://accounts.spotify.com/api/token", {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      })
      .json<TokenData>()
  }

  getCurrentUserProfile() {
    return this.httpClient.get("me").json<CurrentUserData>()
  }

  getTopItems<Type extends TopItemsType>(
    type: Type,
    params?: { range?: TopItemsTimeRange; limit?: number; offset?: number }
  ) {
    return this.httpClient
      .get(`me/top/${type}`, {
        searchParams: {
          time_range: params?.range ?? "short_term",
          limit: params?.limit ?? 50,
          offset: params?.offset ?? 0
        }
      })
      .json<TopItemsData<Type>>()
  }
}

export const createSpotifyClient = (session: RootSession) => {
  // assume user is already authed when creating the client
  return new Spotify(session)
}

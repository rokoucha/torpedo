import axios, { AxiosInstance } from 'axios'

/**
 * Authorization
 */
export interface Authorization {
  access_token: string
  clientId: string
  clientSecret: string
  stateText: string
  token_type: string
}

/**
 * Body
 */
export interface Body {
  text: string
}

/**
 * Post
 */
export interface Post {
  application: Application
  createdAt: string
  id: number
  text: string
  updatedAt: string
  user: User
}

/**
 * Application
 */
export interface Application {
  id: number
  name: string
}

/**
 * User
 */
export interface User {
  createdAt: string
  id: number
  name: string
  postsCount: number
  screenName: string
  updatedAt: string
}

/**
 * User settings
 */
export interface UserSettings {
  name: string
}

/**
 * Account
 */
export interface Account {
  createdAt: string
  id: number
  name: string
  postsCount: number
  screenName: string
  updatedAt: string
}

/**
 * SeaClient
 */
export default class SeaClient {
  private axios: AxiosInstance
  private endpoint: string
  private auth: Authorization

  /**
   * Constructor
   *
   * @param {string} endpoint API FQDN
   * @param {Object} params Params
   * @param {string} params.accessToken Application's acccess token
   * @param {string} params.clientId Application's client id
   * @param {string} params.clientSecret Application's client id
   * @param {string} params.tokenType Access token type(default: Bearer)
   */
  constructor(
    endpoint: string,
    {
      accessToken,
      clientId,
      clientSecret,
      tokenType
    }: {
      accessToken?: string
      clientId?: string
      clientSecret?: string
      tokenType?: string
    } = {}
  ) {
    this.endpoint = new URL(`https://${endpoint}`).href

    this.auth = <Authorization>{
      access_token: accessToken || '',
      clientId: clientId || '',
      clientSecret: clientSecret || '',
      stateText: this.getStateText(),
      token_type: tokenType || 'Bearer'
    }

    this.axios = axios.create({
      baseURL: this.endpoint
    })

    if (accessToken !== '') {
      this.axios.defaults.headers.common['Authorization'] = `${
        this.auth.token_type
      } ${this.auth.access_token}`
    }
  }

  /**
   * Make state parameter fot authorize
   * https://tools.ietf.org/html/draft-ietf-oauth-v2-31#section-10.12
   *
   * @returns {string}
   */
  private getStateText(): string {
    // TODO 安全で良い感じのランダムテキスト吐く奴考えて
    return 'hoge'
  }

  /**
   * Make authorize url
   *
   * @returns {string}
   */
  public getAuthorizeUrl(): string {
    return new URL(
      `/oauth/authorize?client_id=${
        this.auth.clientId
      }&response_type=code&state=${this.auth.stateText}`,
      this.endpoint
    ).href
  }

  /**
   * Authorize with authorization code
   *
   * @param {string} authCode authorization_code
   *
   * @returns {Promise<string>} access_token
   */
  public async authorize(authCode: string): Promise<string> {
    const res = await this.axios.post<Authorization>(
      `/oauth/token?client_id=${this.auth.clientId}&response_type=code&state=${
        this.auth.stateText
      }`,
      {
        client_id: this.auth.clientId,
        client_secret: this.auth.clientSecret,
        code: authCode,
        grant_type: 'authorization_code',
        state: this.auth.stateText
      }
    )

    this.auth.access_token = res.data.access_token
    this.axios.defaults.headers.common['Authorization'] = `${
      this.auth.token_type
    } ${this.auth.access_token}`

    return res.data.access_token
  }

  /**
   * Post
   *
   * @param {Body} post post body
   *
   * @returns {Promise<Post>}
   */
  public async post(post: Body): Promise<Post> {
    const res = await this.axios.post<Post>('/api/v1/posts', post)

    return res.data
  }

  /**
   * Get timeline
   *
   * @param {number} sinceId id
   * @param {number} count count
   *
   * @returns {Promise<Post[]>}
   */
  public async getTimeline(sinceId?: number, count?: number): Promise<Post[]> {
    const res = await this.axios.get<Post[]>(`/api/v1/timelines/public`, {
      params: {
        sinceId,
        count
      }
    })

    return res.data
  }

  /**
   * Change user settings
   *
   * @param {UserSettings} setting user settings
   *
   * @returns {Promise<User>}
   */
  public async postUserSettings(setting: UserSettings): Promise<User> {
    const res = await this.axios.patch<User>(`/api/v1/account`, setting)

    return res.data
  }

  /**
   * Get my info
   *
   * @returns {Promise<User>}
   */
  public async getMyInfo(): Promise<User> {
    const res = await this.axios.get<User>(`/api/v1/account`)

    return res.data
  }
}

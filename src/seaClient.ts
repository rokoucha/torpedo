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
export class SeaClient {
  private axios: AxiosInstance
  private endpoint: string
  private auth: Authorization

  /**
   * Constructor
   *
   * @param accessToken {string} Application's acccess token
   * @param clientId {string} Application's client id
   * @param clientSecret {string} Application's client id
   * @param endpoint {string} API FQDN
   */
  constructor(
    accessToken: string,
    clientId: string,
    clientSecret: string,
    endpoint: string,
    tokenType: string = 'Bearer'
  ) {
    this.endpoint = new URL(`https://${endpoint}`).href

    this.auth = <Authorization>{
      access_token: accessToken,
      clientId,
      clientSecret,
      stateText: this.getStateText(),
      token_type: tokenType
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
  public getAuthorizeUrl(): URL {
    return new URL(
      `/oauth/authorize?client_id=${
        this.auth.clientId
      }&response_type=code&state=${this.auth.stateText}`,
      this.endpoint
    )
  }

  /**
   * Authorize with authorization code
   *
   * @param authCode {string} authorization_code
   *
   * @returns {Promise<void>}
   */
  public async authorize(authCode: string): Promise<void> {
    const res = await this.axios.post<Authorization>(
      `/oauth/authorize?client_id=${
        this.auth.clientId
      }&response_type=code&state=${this.auth.stateText}`,
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
  }

  /**
   * Post
   *
   * @param post {Body} post body
   *
   * @returns {Promise<Post>}
   */
  public async post(post: Body): Promise<Post> {
    const res = await this.axios.post<Post>(
      '/api/v1/posts',
      JSON.stringify(post)
    )

    return res.data
  }

  /**
   * Get timeline
   *
   * @param sinceId {number | null} id
   * @param count {number| null} count
   *
   * @returns {Promise<Post[]>}
   */
  public async getTimeline(
    sinceId: number | null,
    count: number | null
  ): Promise<Post[]> {
    const res = await this.axios.get<Post[]>(`/api/v1/1`, {
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
   * @param setting {UserSettings} user settings
   *
   * @returns {Promise<User>}
   */
  public async postUserSettings(setting: UserSettings): Promise<User> {
    const res = await this.axios.patch<User>(
      `/api/v1/account`,
      JSON.stringify(setting)
    )

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

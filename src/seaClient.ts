import { ReadStream } from 'fs'
import $ from 'cafy'
import axios, { AxiosInstance } from 'axios'
import FormData from 'form-data'

/**
 * Validator for cafy
 */
class Validator {
  /**
   * Validate date string
   */
  public static isValidDate = $.str.pipe(
    (str: string): boolean => !isNaN(new Date(str).getTime())
  )

  /**
   * Validate url string
   */
  public static isValidUrl = $.str.pipe(
    (str: string): boolean => {
      try {
        new URL(str)
        return true
      } catch (error) {
        return false
      }
    }
  )
}

/**
 * Application
 */
export class Application {
  public id: number
  public name: string

  /**
   * Validate
   *
   * @param {Partial<Application>} application object
   */
  private validate(application: Partial<Application>) {
    return $.obj({
      id: $.num,
      name: $.str
    }).throw(application)
  }

  /**
   * Constructor
   *
   * @param {Partial<Application>} a object
   */
  constructor(a: Partial<Application>) {
    const application = this.validate(a)

    this.id = application.id
    this.name = application.name
  }
}

/**
 * Authorization
 */
export class Authorization {
  public access_token: string
  public clientId: string
  public clientSecret: string
  public stateText: string
  public token_type: string

  /**
   * Validate
   *
   * @param {Partial<Authorization>} authorization object
   */
  private validate(authorization: Partial<Authorization>) {
    return $.obj({
      access_token: $.str,
      clientId: $.str,
      clientSecret: $.str,
      stateText: $.str,
      token_type: $.str
    }).throw(authorization)
  }

  /**
   * Constructor
   *
   * @param {Partial<Authorization>} a object
   */
  constructor(a: Partial<Authorization>) {
    const authorization = this.validate(a)

    this.access_token = authorization.access_token
    this.clientId = authorization.clientId
    this.clientSecret = authorization.clientSecret
    this.stateText = authorization.stateText
    this.token_type = authorization.token_type
  }
}

/**
 * File
 */
export class File {
  public id: number
  public name: string
  public variants: {
    id: number
    score: number
    extension: string
    type: string
    size: number
    url: URL
    mime: string
  }[]

  /**
   * Validate
   *
   * @param {Partial<File>} file object
   */
  private validate(file: Partial<File>) {
    return $.obj({
      id: $.num,
      name: $.str,
      variants: $.array(
        $.obj({
          id: $.num,
          score: $.num,
          extension: $.str,
          type: $.str,
          size: $.num,
          url: Validator.isValidUrl,
          mime: $.str
        })
      )
    }).throw(file)
  }

  /**
   * Constructor
   *
   * @param {Partial<File>} f object
   */
  constructor(f: Partial<File>) {
    const file = this.validate(f)

    this.id = file.id
    this.name = file.name
    this.variants = file.variants.map(variant => {
      return {
        id: variant.id,
        score: variant.score,
        extension: variant.extension,
        type: variant.type,
        size: variant.size,
        url: new URL(variant.url),
        mime: variant.mime
      }
    })
  }
}

/**
 * Post
 */
export class Post {
  public application: Application
  public createdAt: Date
  public id: number
  public text: string
  public updatedAt: Date
  public user: User
  public files: File[]

  /**
   * Validate
   *
   * @param {Partial<Post>} post object
   */
  private validate(post: Partial<Post>) {
    return $.obj({
      application: $.any,
      createdAt: Validator.isValidDate,
      id: $.num,
      text: $.str.max(512),
      updatedAt: Validator.isValidDate,
      user: $.any,
      files: $.arr($.any)
    }).throw(post)
  }

  /**
   * Constructor
   *
   * @param {Partial<Post>} p object
   */
  constructor(p: Partial<Post>) {
    const post = this.validate(p)

    this.application = new Application(post.application)
    this.createdAt = new Date(post.createdAt)
    this.id = post.id
    this.text = post.text
    this.updatedAt = new Date(post.updatedAt)
    this.user = new User(post.user)
    this.files = []

    this.files = post.files.map(file => new File(file))
  }
}

/**
 * Post body
 */
export class PostBody {
  public text: string
  public fileIds?: number[]

  /**
   * Validate
   *
   * @param {Partial<PostBody>} postBody object
   */
  private validate(postBody: Partial<PostBody>) {
    return $.obj({
      text: $.str.max(512),
      fileIds: $.optional.array($.num)
    }).throw(postBody)
  }

  /**
   * Constructor
   *
   * @param {Partial<PostBody>} p object
   */
  constructor(p: Partial<PostBody>) {
    const postBody = this.validate(p)

    this.text = postBody.text
    this.fileIds = postBody.fileIds
  }
}

/**
 * User class
 */
export class User {
  public createdAt: Date
  public id: number
  public name: string
  public postsCount: number
  public screenName: string
  public updatedAt: Date

  /**
   * Validate
   *
   * @param {Partial<User>} account object
   */
  private validate(account: Partial<User>) {
    return $.obj({
      createdAt: Validator.isValidDate,
      id: $.num,
      name: $.str.range(1, 20),
      postsCount: $.num,
      screenName: $.str.match(/^[0-9a-zA-Z_]{1,20}$/),
      updatedAt: Validator.isValidDate
    }).throw(account)
  }

  /**
   * Constructor
   *
   * @param {Partial<User>} a object
   */
  constructor(a: Partial<User>) {
    const account = this.validate(a)

    this.createdAt = new Date(account.createdAt)
    this.id = account.id
    this.name = account.name
    this.postsCount = account.postsCount
    this.screenName = account.screenName
    this.updatedAt = new Date(account.updatedAt)
  }
}

/**
 * User settings
 */
export class UserSettings {
  public name: string

  /**
   * Validate
   *
   * @param {Partial<UserSettings>} userSettings object
   */
  private validate(userSettings: Partial<UserSettings>) {
    return $.obj({
      name: $.str.range(1, 20)
    }).throw(userSettings)
  }

  /**
   * Constructor
   *
   * @param {Partial<UserSettings>} p object
   */
  constructor(u: Partial<UserSettings>) {
    const userSettings = this.validate(u)

    this.name = userSettings.name
  }
}

/**
 * SeaClient
 */
export default class SeaClient {
  private axios: AxiosInstance
  private endpoint: URL
  private auth: Authorization

  /**
   * Constructor
   *
   * @param {URL} endpoint API endpoint
   * @param {Object} params Params
   * @param {string} params.accessToken Application's acccess token
   * @param {string} params.clientId Application's client id
   * @param {string} params.clientSecret Application's client id
   * @param {string} params.tokenType Access token type(default: Bearer)
   */
  constructor(
    endpoint: URL,
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
    this.endpoint = endpoint

    this.auth = new Authorization({
      access_token: accessToken || '',
      clientId: clientId || '',
      clientSecret: clientSecret || '',
      stateText: this.getStateText(),
      token_type: tokenType || 'Bearer'
    })

    this.axios = axios.create({
      baseURL: this.endpoint.origin
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
   * @returns {URL}
   */
  public getAuthorizeUrl(): URL {
    if (this.auth.clientId === '') throw Error('clientId is not set')

    return new URL(
      `/oauth/authorize?client_id=${
        this.auth.clientId
      }&response_type=code&state=${this.auth.stateText}`,
      this.endpoint.origin
    )
  }

  /**
   * Authorize with authorization code
   *
   * @param {string} authCode authorization_code
   *
   * @returns {Promise<string>} access_token
   */
  public async authorize(authCode: string): Promise<string> {
    if (this.auth.clientId === '') throw Error('clientId is not set')
    if (this.auth.clientSecret === '') throw Error('clientSecret is not set')

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
   * @param {PostBody} post post body
   *
   * @returns {Promise<Post>}
   */
  public async post(post: PostBody): Promise<Post> {
    const res = await this.axios.post<Post>('/api/v1/posts', post)

    return new Post(res.data)
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
    if (count !== undefined && count > 100)
      throw new Error('count must be less than or equal to 100')
    if (count !== undefined && count < 1)
      throw new Error('count must be greater than or equal to 1')

    const res = await this.axios.get(`/api/v1/timelines/public`, {
      params: {
        sinceId,
        count
      }
    })

    return res.data.map((post: Post) => new Post(post))
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

    return new User(res.data)
  }

  /**
   * Post file
   *
   * @param {string} name File name
   * @param {ReadStream} file File stream
   * @param {boolean} addDate Add date string when name conflict
   * @param {number} folderId Folder Id
   *
   * @returns {Promise<File>}
   */
  public async postFile(
    name: string,
    file: ReadStream,
    addDate: boolean,
    folderId?: number
  ): Promise<File> {
    const form = new FormData()

    form.append('name', name)
    form.append('file', file)

    if (folderId !== undefined) form.append('folderId', folderId)
    if (addDate === true) form.append('ifNameConflicted', 'add-date-string')
    else form.append('ifNameConflicted', 'error')

    const res = await this.axios.post<File>(`/api/v1/album/files`, form, {
      headers: form.getHeaders()
    })

    return new File(res.data)
  }
}

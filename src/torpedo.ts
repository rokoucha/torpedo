import { createReadStream } from 'fs'
import { prompt } from 'enquirer'
import Hydrobond, { PostBody, Post } from 'hydrobond'
import readline from 'readline'

/**
 * Authorize
 */
export const authorize = async (hydrobond: Hydrobond): Promise<void> => {
  console.log(`Open ${hydrobond.getAuthorizeUrl()} and authorize!`)

  const response: { authCode: string } = await prompt({
    type: 'input',
    name: 'authCode',
    message: `Enter authorization code`
  })

  const accessToken = await hydrobond.authorize(response.authCode)

  console.log(`Your access token is ${accessToken}`)
}

/**
 * Post file
 */
export const postFile = async (
  hydrobond: Hydrobond,
  fileName: string
): Promise<number> => {
  const file = createReadStream(fileName)

  const res = await hydrobond.postFile(fileName, file, true)

  return res.id
}

/**
 * Post
 */
export const post = async (
  hydrobond: Hydrobond,
  text: string,
  options: {
    '--': any[]
    file?: string
  }
): Promise<void> => {
  const message = text

  const fileIds = options.file ? [await postFile(hydrobond, options.file)] : []

  await hydrobond.post(
    new PostBody({
      text: message,
      fileIds
    })
  )
}

/**
 * stream
 */
export const stream = async (hydrobond: Hydrobond): Promise<void> => {
  const socket = hydrobond.stream('v1/timelines/public')
  console.log('oppening...')

  socket.addListener(
    'connect',
    (): void => {
      console.log('Connected!')
    }
  )
  socket.addListener(
    'message',
    (post: Post): void => {
      console.log(`${post.user.name}(${post.user.screenName}): ${post.text}`)
    }
  )

  socket.addListener(
    'close',
    (): void => {
      setTimeout((): void => {
        console.log('Reconnecting...')
        stream(hydrobond)
      }, 1000)
    }
  )

  const loop = (): void => {
    setTimeout(loop, 10000)
  }
  loop()
}

/**
 * timeline
 */
export const timeline = async (hydrobond: Hydrobond): Promise<void> => {
  const posts = await hydrobond.getTimeline()

  posts.forEach(
    (post: Post): void => {
      console.log(`${post.user.name}(${post.user.screenName}): ${post.text}`)
    }
  )
}

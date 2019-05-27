import { authorize, post, stream, timeline } from './torpedo'
import cac from 'cac'
import Hydrobond, { Authorization } from 'hydrobond'

/**
 * Main
 */
const main = async (): Promise<void> => {
  // Config
  const CONFIG = {
    API_ENDPOINT: new URL(process.env.TORPEDO_SEA_API_ENDPOINT || ''),
    OAUTH_ENDPOINT: new URL(process.env.TORPEDO_SEA_OAUTH_ENDPOINT || ''),
    AUTHORIZATION: new Authorization({
      accessToken: process.env.TORPEDO_ACCESS_TOKEN || '',
      clientId: process.env.TORPEDO_CLIENT_ID || '',
      clientSecret: process.env.TORPEDO_CLIENT_SECRET || ''
    })
  }

  // Make Hydrobond instance
  const hydrobond = new Hydrobond(
    CONFIG.API_ENDPOINT,
    CONFIG.OAUTH_ENDPOINT,
    CONFIG.AUTHORIZATION
  )

  // Parse command line
  const cli = cac()
  cli.help()

  // Authorize
  cli.command('authorize', 'Authorize torpedo').action(
    async (): Promise<void> => {
      await authorize(hydrobond)
    }
  )

  // Post
  cli
    .command('post [text]', 'Post to sea')
    .option('--file <file>', 'Attachments')
    .action(
      async (text, options): Promise<void> => {
        await post(hydrobond, text, options)
      }
    )

  // Timeline
  cli.command('timeline', 'Show timeline').action(
    async (): Promise<void> => {
      await timeline(hydrobond)
    }
  )

  // Timeline steam
  cli.command('stream', 'Show timeline with WebSocket').action(
    async (): Promise<void> => {
      await stream(hydrobond)
    }
  )

  cli.parse()
}

main().catch(
  (e): void => {
    console.log(e)
  }
)

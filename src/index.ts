import { authorize, post, stream } from './torpedo'
import cac from 'cac'
import Hydrobond, { Authorization } from './hydrobond/hydrobond'

/**
 * Main
 */
const main = async () => {
  // Config
  const ENDPOINT = new URL(process.env.TORPEDO_SEA_ENDPOINT || '')
  const AUTHORIZATION = new Authorization({
    accessToken: process.env.TORPEDO_ACCESS_TOKEN || '',
    clientId: process.env.TORPEDO_CLIENT_ID || '',
    clientSecret: process.env.TORPEDO_CLIENT_SECRET || ''
  })

  // Make Hydrobond instance
  const hydrobond = new Hydrobond(ENDPOINT, AUTHORIZATION)

  // Parse command line
  const cli = cac()
  cli.help()

  // Authorize
  cli.command('authorize', 'Authorize torpedo').action(() => {
    authorize(hydrobond)
  })

  // Post
  cli
    .command('post [text]', 'Post to sea')
    .option('--file <file>', 'Attachments')
    .action((text, options) => {
      post(hydrobond, text, options)
    })

  // Timeline
  cli.command('stream', 'Show timeline with WebSocket').action(() => {
    stream(hydrobond)
  })

  cli.parse()
}

main().catch(e => console.log(e))

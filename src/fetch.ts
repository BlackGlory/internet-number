import getUri = require('get-uri')
import { Domain, Registry, createExtendedLatestChecksumURL, createExtendedLatestURL } from './url'

export class UnknownChecksumError extends Error {
  name = this.constructor.name
}

export async function fetchLatestChecksum(domain: Domain, registry: Registry): Promise<string> {
  const url = createExtendedLatestChecksumURL(domain, registry)
  const stream = await createReadStreamFromURL(url)
  const text = await readStringFromStream(stream)
  const result = parseChecksum(text)
  return result

  function parseChecksum(text: string) {
    const re = /MD5 \([\w\-]+\) = ([a-z0-9]{32})/
    const result = text.match(re)
    if (result) {
      return result[1]
    } else {
      throw new UnknownChecksumError(text)
    }
  }

  function readStringFromStream(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      stream.once('error', reject)
      stream.on('data', chunk => chunks.push(chunk))
      stream.once('end', () => resolve(toASCII(chunks)))
    })

    function toASCII(buffer: Buffer[]): string {
      return Buffer.concat(buffer).toString('ascii')
    }
  }
}

export async function fetchLatestStatisticsFile(domain: Domain, registry: Registry): Promise<NodeJS.ReadableStream> {
  const url = createExtendedLatestURL(domain, registry)
  return await createReadStreamFromURL(url)
}

function createReadStreamFromURL(url: string): Promise<NodeJS.ReadableStream> {
  return getUri(url, {})
}

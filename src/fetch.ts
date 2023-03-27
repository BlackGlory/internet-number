import getUri from 'get-uri'
import { Domain, Registry, createExtendedLatestChecksumURL, createExtendedLatestURL } from './url.js'
import { CustomError } from '@blackglory/errors'
import { assert } from '@blackglory/errors'

/**
 * @throws {UnknownChecksumError}
 */
export async function fetchLatestChecksum(
  domain: Domain
, registry: Registry
): Promise<string> {
  const url = createExtendedLatestChecksumURL(domain, registry)
  const stream = await createReadStreamFromURL(url)
  const text = await readStringFromStream(stream)
  const result = parseChecksum(text)
  return result

  function parseChecksum(text: string) {
    const re = /MD5 \([\w-]+\) = ([a-z0-9]{32})/
    const result = text.match(re)
    if (result) {
      return result[1]
    } else {
      throw new UnknownChecksumError(text)
    }
  }

  async function readStringFromStream(
    stream: NodeJS.ReadableStream
  ): Promise<string> {
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      assert(chunk instanceof Buffer, 'The chunk should be a Buffer')

      chunks.push(chunk)
    }
    return toASCII(chunks)

    function toASCII(buffer: Buffer[]): string {
      return Buffer.concat(buffer).toString('ascii')
    }
  }
}

export async function fetchLatestStatisticsFile(
  domain: Domain
, registry: Registry
): Promise<NodeJS.ReadableStream> {
  const url = createExtendedLatestURL(domain, registry)
  return await createReadStreamFromURL(url)
}

function createReadStreamFromURL(url: string): Promise<NodeJS.ReadableStream> {
  return getUri(url, {})
}

export class UnknownChecksumError extends CustomError {}

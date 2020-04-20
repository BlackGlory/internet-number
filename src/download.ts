import * as fs from 'fs'
import getUri = require('get-uri')
import md5File = require('md5-file')
import { Domain, Registry, createExtendedLatestChecksumURL, createExtendedLatestURL } from './url'

export class UnknownChecksumError extends Error {
  name = this.constructor.name
}

export class ChecksumIncorrectError extends Error {
  name = this.constructor.name

  constructor(expected: string, actual: string) {
    super(`${actual} != ${expected}`)
  }
}

export async function downloadLatestStatisticsFile(domain: Domain, registry: Registry, filename: string): Promise<string> {
  const checksum = await fetchChecksum(domain, registry)
  const stream = await fetchFile(domain, registry)
  await saveFile(stream, filename)
  await checkFile(filename, checksum)
  return filename

  async function checkFile(filename: string, checksum: string): Promise<void> {
    const fileChecksum = await md5File(filename)
    if (fileChecksum !== checksum) throw new ChecksumIncorrectError(checksum, fileChecksum)
  }

  async function fetchFile(domain: Domain, registry: Registry): Promise<NodeJS.ReadableStream> {
    const url = createExtendedLatestURL(domain, registry)
    return await createReadStreamFromURL(url)
  }
}

function createReadStreamFromURL(url: string): Promise<NodeJS.ReadableStream> {
  return getUri(url, {})
}

async function saveFile(readStream: NodeJS.ReadableStream, filename: string): Promise<string> {
  const writeStream = fs.createWriteStream(filename)
  await pipeStream(readStream, writeStream)
  return filename

  function pipeStream(readStream: NodeJS.ReadableStream, writeStream: NodeJS.WritableStream) {
    return new Promise((resolve, reject) => {
      writeStream.once('error', reject)
      writeStream.once('close', resolve)
      readStream.pipe(writeStream)
    })
  }
}

async function fetchChecksum(domain: Domain, registry: Registry): Promise<string> {
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

import fs from 'fs'
import { checksumFile } from 'extra-filesystem'
import { fetchLatestChecksum, fetchLatestStatisticsFile } from './fetch.js'
import { Domain, Registry } from './url.js'
import { CustomError } from '@blackglory/errors'
import { pipeline } from 'stream/promises'

/**
 * @throws {ChecksumIncorrectError}
 */
export async function downloadLatestStatisticsFile(
  domain: Domain
, registry: Registry
, filename: string
): Promise<string> {
  const checksum = await fetchLatestChecksum(domain, registry)
  const stream = await fetchLatestStatisticsFile(domain, registry)
  await saveFile(stream, filename)
  await checkFile(filename, checksum)
  return filename

  async function checkFile(filename: string, checksum: string): Promise<void> {
    const fileChecksum = await checksumFile('md5', filename)
    if (fileChecksum !== checksum) {
      // 此处不会自动删除文件, 调用者知道文件名, 因此可以自行决定是否删除.
      throw new ChecksumIncorrectError(checksum, fileChecksum)
    }
  }

  async function saveFile(
    readStream: NodeJS.ReadableStream
  , filename: string
  ): Promise<string> {
    const writeStream = fs.createWriteStream(filename)
    await pipeline(readStream, writeStream)
    return filename
  }
}

export class ChecksumIncorrectError extends CustomError {
  constructor(expected: string, actual: string) {
    super(`${actual} != ${expected}`)
  }
}

import * as fs from 'fs'
import md5File from 'md5-file'
import { fetchLatestChecksum, fetchLatestStatisticsFile } from './fetch'
import { Domain, Registry } from './url'
import { CustomError } from '@blackglory/errors'

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
    const fileChecksum = await md5File(filename)
    if (fileChecksum !== checksum) {
      throw new ChecksumIncorrectError(checksum, fileChecksum)
    }
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
}

export class ChecksumIncorrectError extends CustomError {
  constructor(expected: string, actual: string) {
    super(`${actual} != ${expected}`)
  }
}

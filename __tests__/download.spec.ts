import { PassThrough } from 'stream'
import * as path from 'path'
import { fs as memfs } from 'memfs'
import { Domain, Registry } from '@src/url'
import { downloadLatestStatisticsFile, ChecksumIncorrectError, UnknownChecksumError } from '@src/download'
import { getAsyncError } from '@test/return-style'
import { createExtendedLatestURL, createExtendedLatestChecksumURL } from '@src/url'
import * as fs from 'fs'
import { nanoid } from 'nanoid'

jest.mock('fs', () => memfs)

let uriToText: { [index: string]: string } = {}
jest.mock('get-uri', () => {
  return async function getUri(uri: string): Promise<NodeJS.ReadableStream> {
    if (uri in uriToText) {
      const readableStream = new PassThrough()
      setImmediate(() => {
        readableStream.emit('data', Buffer.from(uriToText[uri]))
        readableStream.emit('end')
      })
      return readableStream
    } else {
      throw new Error('Bad URL')
    }
  }
})

describe('downloadData(domain: Domain, registry: Registry, filename: string) -> Promise<string>', () => {
  describe('checksum is right', () => {
    it('download file and return filename', async () => {
      const fakeFile = new FakeFile()
      const domain = Domain.AFRINIC
      const registry = Registry.AFRINIC
      const filename = fakeFile.getFilename()
      const mockFetch = new MockFetch({
        [createExtendedLatestURL(domain, registry)]: getStatisticsFileContent()
      , [createExtendedLatestChecksumURL(domain, registry)]: getChecksumFileContent()
      })
      fakeFile.setup()
      mockFetch.setup()

      const resultFilename = await downloadLatestStatisticsFile(domain, registry, filename)
      const content = fakeFile.getContent()

      fakeFile.teardown()
      mockFetch.teardown()
      expect(resultFilename).toBe(filename)
      expect(content).toBe(getStatisticsFileContent())
    })
  })

  describe('checksum is unknown', () => {
    it('not download file and throw UnknownChecksumError', async () => {
      const fakeFile = new FakeFile()
      const domain = Domain.AFRINIC
      const registry = Registry.AFRINIC
      const filename = fakeFile.getFilename()
      const mockFetch = new MockFetch({ [createExtendedLatestURL(domain, registry)]: getStatisticsFileContent()
      , [createExtendedLatestChecksumURL(domain, registry)]: ''
      })
      fakeFile.setup()
      mockFetch.setup()

      const err = await getAsyncError(() => downloadLatestStatisticsFile(domain, registry, filename))
      const isFileWritten = fakeFile.isExist()

      fakeFile.teardown()
      mockFetch.teardown()
      expect(isFileWritten).toBe(false)
      expect(err).toBeInstanceOf(UnknownChecksumError)
    })
  })

  describe('checksum is incorrect', () => {
    it('download file and throw ChecksumIncorrectError', async () => {
      const fakeFile = new FakeFile()
      const domain = Domain.AFRINIC
      const registry = Registry.AFRINIC
      const filename = fakeFile.getFilename()
      const incorrectChecksum = 'MD5 (delegated-afrinic-latest) = 00000000000000000000000000000000'
      const mockFetch = new MockFetch({
        [createExtendedLatestURL(domain, registry)]: getStatisticsFileContent()
      , [createExtendedLatestChecksumURL(domain, registry)]: incorrectChecksum
      })
      fakeFile.setup()
      mockFetch.setup()

      const err = await getAsyncError(() => downloadLatestStatisticsFile(domain, registry, filename))
      const isFileWritten = fakeFile.isExist()

      fakeFile.teardown()
      mockFetch.teardown()
      expect(isFileWritten).toBe(true)
      expect(err).toBeInstanceOf(ChecksumIncorrectError)
    })
  })
})

function getStatisticsFileContent(): string {
  const fs = jest.requireActual('fs')
  return fs.readFileSync(path.join(__dirname, './fixtures/statistics.txt'), { encoding: 'utf8'} )
}

function getChecksumFileContent(): string {
  const fs = jest.requireActual('fs')
  return fs.readFileSync(path.join(__dirname, './fixtures/checksum.md5'), { encoding: 'utf8' })
}

class FakeFile {
  #id = nanoid()

  setup() {
    void 0
  }

  teardown() {
    if (fs.existsSync(this.getFilename())) fs.unlinkSync(this.getFilename())
  }

  getFilename(): string {
    return `/fake-${this.#id}.txt`
  }

  isExist(): boolean {
    return fs.existsSync(this.getFilename())
  }

  getContent(): string {
    return fs.readFileSync(this.getFilename(), { encoding: 'utf8' })
  }
}

class MockFetch {
  #map: { [index: string]: string }

  constructor(urlToText: { [index: string]: string }) {
    this.#map = urlToText
  }

  setup() {
    uriToText = this.#map
  }

  teardown() {
    uriToText = {}
  }
}

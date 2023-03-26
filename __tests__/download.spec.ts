import { PassThrough } from 'stream'
import { Domain, Registry } from '@src/url.js'
import { downloadLatestStatisticsFile, ChecksumIncorrectError } from '@src/download.js'
import { UnknownChecksumError } from '@src/fetch.js'
import { getErrorPromise } from 'return-style'
import { createExtendedLatestURL, createExtendedLatestChecksumURL } from '@src/url.js'
import { getChecksumFileContent, getStatisticsFileContent, FakeFile } from '@test/utils.js'

let uriToText: { [index: string]: string } = {}
vi.mock('get-uri', () => {
  return {
    default: async function getUri(uri: string): Promise<NodeJS.ReadableStream> {
      if (uri in uriToText) {
        const pass = new PassThrough()
        pass.write(uriToText[uri])
        pass.end()
        return pass
      } else {
        throw new Error('Bad URL')
      }
    }
  }
})

describe('downloadLatestStatisticsFile', () => {
  describe('checksum is right', () => {
    it('download file and return filename', async () => {
      const fakeFile = new FakeFile()
      const domain = Domain.AFRINIC
      const registry = Registry.AFRINIC
      const filename = fakeFile.getFilename()
      const mockFetch = new MockFetch({
        [createExtendedLatestURL(domain, registry)]: await getStatisticsFileContent()
      , [createExtendedLatestChecksumURL(domain, registry)]: await getChecksumFileContent()
      })
      fakeFile.setup()
      mockFetch.setup()

      try {
        const resultFilename = await downloadLatestStatisticsFile(
          domain
        , registry
        , filename
        )
        const content = fakeFile.getContent()

        expect(resultFilename).toBe(filename)
        expect(content).toBe(await getStatisticsFileContent())
      } finally {
        fakeFile.teardown()
        mockFetch.teardown()
      }
    })
  })

  describe('checksum is unknown', () => {
    it('not download file and throw UnknownChecksumError', async () => {
      const fakeFile = new FakeFile()
      const domain = Domain.AFRINIC
      const registry = Registry.AFRINIC
      const filename = fakeFile.getFilename()
      const mockFetch = new MockFetch({
        [createExtendedLatestURL(domain, registry)]: await getStatisticsFileContent()
      , [createExtendedLatestChecksumURL(domain, registry)]: ''
      })
      fakeFile.setup()
      mockFetch.setup()

      try {
        const err = await getErrorPromise(
          downloadLatestStatisticsFile(domain, registry, filename)
        )
        const isFileWritten = fakeFile.exists()

        expect(isFileWritten).toBe(false)
        expect(err).toBeInstanceOf(UnknownChecksumError)
      } finally {
        fakeFile.teardown()
        mockFetch.teardown()
      }
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
        [createExtendedLatestURL(domain, registry)]: await getStatisticsFileContent()
      , [createExtendedLatestChecksumURL(domain, registry)]: incorrectChecksum
      })
      fakeFile.setup()
      mockFetch.setup()

      try {
        const err = await getErrorPromise(
          downloadLatestStatisticsFile(domain, registry, filename)
        )
        const isFileWritten = fakeFile.exists()

        expect(isFileWritten).toBe(true)
        expect(err).toBeInstanceOf(ChecksumIncorrectError)
      } finally {
        fakeFile.teardown()
        mockFetch.teardown()
      }
    })
  })
})

class MockFetch {
  private map: { [index: string]: string }

  constructor(urlToText: { [index: string]: string }) {
    this.map = urlToText
  }

  setup() {
    uriToText = this.map
  }

  teardown() {
    uriToText = {}
  }
}

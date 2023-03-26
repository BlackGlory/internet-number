import { PassThrough } from 'stream'
import * as stream from 'stream'
import { Domain, Registry, createExtendedLatestChecksumURL, createExtendedLatestURL } from '@src/url.js'
import { getChecksum, getChecksumFileContent, getStatisticsFileContent } from '@test/utils.js'
import { getErrorPromise } from 'return-style'
import { fetchLatestChecksum, fetchLatestStatisticsFile, UnknownChecksumError } from '@src/fetch.js'

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

describe('fetchChecksum', () => {
  describe('checksum is normal', () => {
    it('return checksum', async () => {
      const domain = Domain.AFRINIC
      const registry = Registry.AFRINIC
      const mockFetch = new MockFetch({
        [createExtendedLatestChecksumURL(domain, registry)]: await getChecksumFileContent()
      })
      mockFetch.setup()

      try {
        const result = await fetchLatestChecksum(domain, registry)

        expect(result).toBe(await getChecksum())
      } finally {
        mockFetch.teardown()
      }
    })
  })

  describe('checksum is unknown', () => {
    it('throw UnknownChecksumError', async () => {
      const domain = Domain.AFRINIC
      const registry = Registry.AFRINIC
      const incorrectChecksum = ''
      const mockFetch = new MockFetch({
        [createExtendedLatestChecksumURL(domain, registry)]: incorrectChecksum
      })
      mockFetch.setup()

      try {
        const err = await getErrorPromise(fetchLatestChecksum(domain, registry))

        expect(err).toBeInstanceOf(UnknownChecksumError)
      } finally {
        mockFetch.teardown()
      }
    })
  })
})

describe('fetchLatestStatisticsFile', () => {
  describe('call', () => {
    it('return ReadableStream', async () => {
      const domain = Domain.AFRINIC
      const registry = Registry.AFRINIC
      const mockFetch = new MockFetch({
        [createExtendedLatestURL(domain, registry)]: await getStatisticsFileContent()
      })
      mockFetch.setup()

      try {
        const result = await fetchLatestStatisticsFile(domain, registry)

        expect(result).toBeInstanceOf(stream.Readable)
      } finally {
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

import { fs as memfs } from 'memfs'
import { PassThrough } from 'stream'
import * as stream from 'stream'
import { Domain, Registry, createExtendedLatestChecksumURL, createExtendedLatestURL } from '@src/url'
import { getChecksum, getChecksumFileContent, getStatisticsFileContent } from '@test/utils'
import { getErrorAsync } from 'return-style'
import { fetchLatestChecksum, fetchLatestStatisticsFile, UnknownChecksumError } from '@src/fetch'

jest.mock('fs', () => memfs)

let uriToText: { [index: string]: string } = {}
jest.mock('get-uri', () => {
  return async function getUri(uri: string): Promise<NodeJS.ReadableStream> {
    if (uri in uriToText) {
      const readableStream = new PassThrough()
      const data = Buffer.from(uriToText[uri])
      setImmediate(() => {
        readableStream.emit('data', data)
        readableStream.emit('end')
      })
      return readableStream
    } else {
      throw new Error('Bad URL')
    }
  }
})

describe('fetchChecksum(domain: Domain, registry: Registry): Promise<string>', () => {
  describe('checksum is normal', () => {
    it('return checksum', async () => {
      const domain = Domain.AFRINIC
      const registry = Registry.AFRINIC
      const mockFetch = new MockFetch({
        [createExtendedLatestChecksumURL(domain, registry)]: getChecksumFileContent()
      })
      mockFetch.setup()

      try {
        const result = await fetchLatestChecksum(domain, registry)

        expect(result).toBe(getChecksum())
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
        const err = await getErrorAsync(fetchLatestChecksum(domain, registry))

        expect(err).toBeInstanceOf(UnknownChecksumError)
      } finally {
        mockFetch.teardown()
      }
    })
  })
})

describe('fetchLatestStatisticsFile(domain: Domain, registry: Registry): Promise<NodeJS.ReadableStream>', () => {
  describe('call', () => {
    it('return ReadableStream', async () => {
      const domain = Domain.AFRINIC
      const registry = Registry.AFRINIC
      const mockFetch = new MockFetch({
        [createExtendedLatestURL(domain, registry)]: getStatisticsFileContent()
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

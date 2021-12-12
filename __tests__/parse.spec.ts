import { parseFormat, parseFormatAsync, parseStatisticsFile } from '@src/parse'
import { isVersion, isSummary, isRecord } from '@src/parse'
import { IRecord, ISummary, IVersion } from '@src/types'
import * as path from 'path'
import * as fs from 'fs'
import { toArray, toArrayAsync } from 'iterable-operator'
import '@blackglory/jest-matchers'

describe('parseFormat(lines: Iterable<string>) -> Iterable<IVersion | ISummary | IRecord>', () => {
  describe('call', () => {
    it('return Iterable', () => {
      const iterable = textToLineIterable(getStatistics())

      const iter = parseFormat(iterable)
      const result = toArray(iter)

      expect(iter).toBeIterable()
      expect(result).toEqual(getExpected())
    })
  })
})

describe('parseFormatAsync(lines: AsyncIterable<string>) -> AsyncIterable<IVersion | Isummary | IRecord>', () => {
  describe('call', () => {
    it('return AsyncIterable', async () => {
      const iterable = textToLineAsyncIterable(getStatistics())

      const iter = parseFormatAsync(iterable)
      const result = await toArrayAsync(iter)

      expect(iter).toBeAsyncIterable()
      expect(result).toEqual(getExpected())
    })
  })
})

describe('parseStatisticsFile(filename: string) -> AsyncIterable<Version | Summary | Record>', () => {
  describe('call', () => {
    it('return AsyncIterable', async () => {
      const filename = getStatisticsFilename()

      const iter = parseStatisticsFile(filename)
      const result = await toArrayAsync(iter)

      expect(iter).toBeAsyncIterable()
      expect(result).toEqual(getExpected())
    })
  })
})

describe('isVersion(val: IVersion | ISummary | IRecord) -> boolean', () => {
  describe('val is IVersion', () => {
    it('return true', () => {
      const val: IVersion = {
        version: '2'
      , registry: 'afrinic'
      , serial: '20200418'
      , records: '11367'
      , startdate: '00000000'
      , enddate: '20200418'
      , UTCoffset: '00000'
      }

      const result = isVersion(val)

      expect(result).toBe(true)
    })
  })

  describe('val isnt IVersion', () => {
    it('return false', () => {
      const val: ISummary = {
        registry: 'afrinic'
      , type: 'asn'
      , count: '3326'
      , summary: 'summary'
      }

      const result = isVersion(val)

      expect(result).toBe(false)
    })
  })
})

describe('isSummary(val: IVersion | ISummary | IRecord) -> boolean', () => {
  describe('val is Summary', () => {
    it('return true', () => {
      const val: ISummary = {
        registry: 'afrinic'
      , type: 'asn'
      , count: '3326'
      , summary: 'summary'
      }

      const result = isSummary(val)

      expect(result).toBe(true)
    })
  })

  describe('val isnt IVersion', () => {
    it('return false', () => {
      const val: IVersion = {
        version: '2'
      , registry: 'afrinic'
      , serial: '20200418'
      , records: '11367'
      , startdate: '00000000'
      , enddate: '20200418'
      , UTCoffset: '00000'
      }

      const result = isSummary(val)

      expect(result).toBe(false)
    })
  })
})

describe('isVersion(val: IVersion | ISummary | IRecord) -> boolean', () => {
  describe('val is IVersion', () => {
    it('return true', () => {
      const val: IRecord = {
        registry: 'afrinic'
      , cc: 'ZA'
      , type: 'asn'
      , start: '2018'
      , value: '1'
      , date: '20010307'
      , status: 'allocated'
      , extensions: ['F36B9F4B']
      }

      const result = isRecord(val)

      expect(result).toBe(true)
    })
  })

  describe('val isnt IVersion', () => {
    it('return false', () => {
      const val: ISummary = {
        registry: 'afrinic'
      , type: 'asn'
      , count: '3326'
      , summary: 'summary'
      }

      const result = isRecord(val)

      expect(result).toBe(false)
    })
  })
})

function getStatisticsFilename() {
  return path.join(__dirname, './fixtures/statistics.txt')
}

function getStatistics(): string {
  return fs.readFileSync(getStatisticsFilename(), { encoding: 'utf8' })

}

function getExpected(): unknown[] {
  return require('./fixtures/expected.json')
}

function textToLineIterable(text: string): Iterable<string> {
  return text.split('\n')
}

async function* textToLineAsyncIterable(text: string): AsyncIterable<string> {
  for await (const line of text.split('\n')) yield line
}

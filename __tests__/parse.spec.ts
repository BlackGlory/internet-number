import { parseFormat, parseFormatAsync, parseStatisticsFile } from '@src/parse.js'
import { isVersion, isSummary, isRecord } from '@src/parse.js'
import { IRecord, ISummary, IVersion } from '@src/types.js'
import path from 'path'
import { toArray, toArrayAsync } from 'iterable-operator'
import { fileURLToPath } from 'url'
import { readJSONFileSync, readFileLineByLine, readFileLineByLineSync } from 'extra-filesystem'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('parseFormat', () => {
  describe('call', () => {
    it('return Iterable', () => {
      const iterable = readFileLineByLineSync(getStatisticsFilename())

      const iter = parseFormat(iterable)
      const result = toArray(iter)

      expect(result).toEqual(getExpected())
    })
  })
})

describe('parseFormatAsync', () => {
  describe('call', () => {
    it('return AsyncIterable', async () => {
      const iterable = readFileLineByLine(getStatisticsFilename())

      const iter = parseFormatAsync(iterable)
      const result = await toArrayAsync(iter)

      expect(result).toEqual(getExpected())
    })
  })
})

describe('parseStatisticsFile', () => {
  describe('call', () => {
    it('return AsyncIterable', async () => {
      const filename = getStatisticsFilename()

      const iter = parseStatisticsFile(filename)
      const result = await toArrayAsync(iter)

      expect(result).toEqual(getExpected())
    })
  })
})

describe('isVersion', () => {
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

describe('isSummary', () => {
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

describe('isVersion', () => {
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

function getExpected(): unknown[] {
  return readJSONFileSync(path.join(__dirname, './fixtures/expected.json'))
}

import { parseFormat, parseFormatAsync, parseStatisticsFile } from '@src/parse'
import * as path from 'path'
import * as fs from 'fs'

describe('parseFormat(lines: Iterable<string>) -> Iterable<IVersion | ISummary | IRecord>', () => {
  describe('call', () => {
    it('return Iterable', () => {
      const iterable = textToLineIterable(getStatistics())

      const iter = parseFormat(iterable)
      const isIter = isIterable(iter)
      const result = toArray(iter)

      expect(isIter).toBe(true)
      expect(result).toEqual(getExpected())
    })
  })
})

describe('parseFormatAsync(lines: AsyncIterable<string>) -> AsyncIterable<IVersion | Isummary | IRecord>', () => {
  describe('call', () => {
    it('return AsyncIterable', async () => {
      const iterable = textToLineAsyncIterable(getStatistics())

      const iter = parseFormatAsync(iterable)
      const isIter = isAsyncIterable(iter)
      const result = await toArrayAsync(iter)

      expect(isIter).toBe(true)
      expect(result).toEqual(getExpected())
    })
  })
})

describe('parseStatisticsFile(filename: string) -> AsyncIterable<Version | Summary | Record>', () => {
  describe('call', () => {
    it('return AsyncIterable', async () => {
      const filename = getStatisticsFilename()

      const iter = parseStatisticsFile(filename)
      const isIter = isAsyncIterable(iter)
      const result = await toArrayAsync(iter)

      expect(isIter).toBe(true)
      expect(result).toEqual(getExpected())
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

function toArray<T>(iterable: Iterable<T>): T[] {
  return Array.from(iterable)
}

async function toArrayAsync<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const result = []
  for await (const element of iterable) result.push(element)
  return result
}

function isIterable<T>(val: any): val is Iterable<T> {
  return typeof val[Symbol.iterator] === 'function'
}

function isAsyncIterable<T>(val: any): val is Iterable<T> {
  return typeof val[Symbol.asyncIterator] === 'function'
}

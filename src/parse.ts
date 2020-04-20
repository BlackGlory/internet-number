import * as fs from 'fs'
import * as readline from 'readline'

interface IVersion {
  version: string
  registry: string
  serial: string
  records: string
  startdate: string
  enddate: string
  UTCoffset: string
}

interface ISummary {
  registry: string
  type: string
  count: string
  summary: string
}

interface IRecord {
  registry: string
  cc: string
  type: string
  start: string
  value: string
  date: string
  status: string
  extensions: string[]
}

export function* parseFormat(lines: Iterable<string>): Iterable<IVersion | ISummary | IRecord> {
  let isFileHeader = true
  for (const line of lines) {
    if (isEmpty(line)) continue
    if (isComment(line)) continue
    if (isFileHeader) {
      if (isVersion(line)) {
        yield parseVersion(line)
        continue
      }
      if (isSummary(line)) {
        yield parseSummary(line)
        continue
      }
      isFileHeader = false
    }
    if (isRecord(line)) yield parseRecord(line)
  }
}

export async function* parseFormatAsync(lines: AsyncIterable<string>): AsyncIterable<IVersion | ISummary | IRecord> {
  let isFileHeader = true
  for await (const line of lines) {
    if (isEmpty(line)) continue
    if (isComment(line)) continue
    if (isFileHeader) {
      if (isVersion(line)) {
        yield parseVersion(line)
        continue
      }
      if (isSummary(line)) {
        yield parseSummary(line)
        continue
      }
      isFileHeader = false
    }
    if (isRecord(line)) yield parseRecord(line)
  }
}

export function parseStatisticsFile(filename: string): AsyncIterable<IVersion | ISummary | IRecord> {
  return parseFormatAsync(processFileByLine(filename))

  function processFileByLine(filename: string): AsyncIterable<string> {
    const stream = fs.createReadStream(filename)
    const rl = readline.createInterface({
      input: stream
    , crlfDelay: Infinity
    })
    return rl
  }
}

function isEmpty(line: string): boolean {
  return  /^\s*$/.test(line)
}

function isComment(line: string) {
  return line.startsWith('#')
}

function isVersion(line: string): boolean {
  // version|registry|serial|records|startdate|enddate|UTCoffset
  return hasSixVerticalLine(line) && /^\s*\d+\s*\|/.test(line)

  function hasSixVerticalLine(text: string) {
    return getNumberOfVerticalBar(text) === 6
  }
}

function parseVersion(line: string): IVersion {
  // version|registry|serial|records|startdate|enddate|UTCoffset
  const [ version, registry, serial, records, startdate, enddate, UTCoffset ] = line.split('|')
  return { version, registry, serial, records, startdate, enddate, UTCoffset }
}

function isSummary(line: string): boolean {
  // registry|*|type|*|count|summary
  return hasFiveVerticalLine(line) && /\|\s*summary\s*$/.test(line)

  function hasFiveVerticalLine(text: string) {
    return getNumberOfVerticalBar(text) === 5
  }
}

function parseSummary(line: string): ISummary {
  // registry|*|type|*|count|summary
  const [registry,, type,, count, summary] = line.split('|')

  return { registry, type, count, summary }
}

function isRecord(line: string): boolean {
  // registry|cc|type|start|value|date|status[|extensions...]
  return hasSixOrSevenVerticalLine(line)

  function hasSixOrSevenVerticalLine(text: string) {
    const n = getNumberOfVerticalBar(text)
    return n === 6 || n === 7
  }
}

function parseRecord(line: string): IRecord {
  // registry|cc|type|start|value|date|status[|extensions...]
  const [registry, cc, type, start, value, date, status, ...extensions] = line.split('|')
  return { registry, cc, type, start, value, date, status, extensions }
}

function getNumberOfVerticalBar(text: string): number {
  const NOT_FOUND = -1
  let count = 0
  let position = 0
  while (true) {
    const index = text.indexOf('|', position)
    if (index === NOT_FOUND) return count
    count++
    position = index + 1
  }
}

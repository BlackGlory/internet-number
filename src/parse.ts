import * as fs from 'fs'
import * as readline from 'readline'
import { IRecord, ISummary, IVersion } from './types'

export function* parseFormat(
  lines: Iterable<string>
): Iterable<IVersion | ISummary | IRecord> {
  let isFileHeader = true
  for (const line of lines) {
    if (isEmptyString(line)) continue
    if (isCommentString(line)) continue
    if (isFileHeader) {
      if (isVersionString(line)) {
        yield parseVersionString(line)
        continue
      }

      if (isSummaryString(line)) {
        yield parseSummaryString(line)
        continue
      }

      isFileHeader = false
    }
    if (isRecordString(line)) yield parseRecordString(line)
  }
}

export async function* parseFormatAsync(
  lines: AsyncIterable<string>
): AsyncIterable<IVersion | ISummary | IRecord> {
  let isFileHeader = true
  for await (const line of lines) {
    if (isEmptyString(line)) continue
    if (isCommentString(line)) continue
    if (isFileHeader) {
      if (isVersionString(line)) {
        yield parseVersionString(line)
        continue
      }

      if (isSummaryString(line)) {
        yield parseSummaryString(line)
        continue
      }

      isFileHeader = false
    }
    if (isRecordString(line)) yield parseRecordString(line)
  }
}

export function parseStatisticsFile(
  filename: string
): AsyncIterable<IVersion | ISummary | IRecord> {
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

export function isVersion(val: IVersion | ISummary | IRecord): val is IVersion {
  return 'version' in val
}

export function isSummary(val: IVersion | ISummary | IRecord): val is ISummary {
  return 'summary' in val
}

export function isRecord(val: IVersion | ISummary | IRecord): val is IRecord {
  return !isVersion(val) && !isSummary(val)
}

function isEmptyString(line: string): boolean {
  return  /^\s*$/.test(line)
}

function isCommentString(line: string) {
  return line.startsWith('#')
}

function isVersionString(line: string): boolean {
  // version|registry|serial|records|startdate|enddate|UTCoffset
  return hasSixVerticalLine(line) && /^\s*\d+\s*\|/.test(line)

  function hasSixVerticalLine(text: string) {
    return getNumberOfVerticalBar(text) === 6
  }
}

function parseVersionString(line: string): IVersion {
  // version|registry|serial|records|startdate|enddate|UTCoffset
  const [version, registry, serial, records, startdate, enddate, UTCoffset] = line.split('|')
  return { version, registry, serial, records, startdate, enddate, UTCoffset }
}

function isSummaryString(line: string): boolean {
  // registry|*|type|*|count|summary
  return hasFiveVerticalLine(line) && /\|\s*summary\s*$/.test(line)

  function hasFiveVerticalLine(text: string) {
    return getNumberOfVerticalBar(text) === 5
  }
}

function parseSummaryString(line: string): ISummary {
  // registry|*|type|*|count|summary
  const [registry,, type,, count, summary] = line.split('|')

  return { registry, type, count, summary }
}

function isRecordString(line: string): boolean {
  // registry|cc|type|start|value|date|status[|extensions...]
  return hasSixOrSevenVerticalLine(line)

  function hasSixOrSevenVerticalLine(text: string) {
    const n = getNumberOfVerticalBar(text)
    return n === 6 || n === 7
  }
}

function parseRecordString(line: string): IRecord {
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

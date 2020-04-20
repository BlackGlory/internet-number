# internet-number [![npm](https://img.shields.io/npm/v/internet-number.svg?maxAge=2592000)](https://www.npmjs.com/package/internet-number) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/BlackGlory/internet-number/master/LICENSE) [![Build Status](https://travis-ci.org/BlackGlory/internet-number.svg?branch=master)](https://travis-ci.org/BlackGlory/internet-number) [![Coverage Status](https://coveralls.io/repos/github/BlackGlory/internet-number/badge.svg)](https://coveralls.io/github/BlackGlory/internet-number)

Utility for fethcing and parsing latest statistics files from RIR

## Installation

```sh
yarn add internet-number
```

```javascript
// Constant
import { Domian, Registry } from 'internet-number'

// Fetcher
import { downloadLatestStatisticsFile } from 'internet-number'

// Parser
import {
  parseStatisticsFile, parseFormat, parseFomratAsync
  isVersion, isSummary, isRecord
} from 'internet-number'

// Exception
import { ChecksumIncorrectError, UnknownChecksumError } from 'internet-number'
```

## Usage

```typescript
const filename = await downloadLatestStatisticsFile(Domian.AFRINIC, Registry.AFRINIC, '/tmp/latest')

for await (const value of parseStatisticsFile(filename)) {
  if (isVersion(value)) ...
  if (isSummary(value)) ...
  if (isRecord(value)) ...
}
```

## API

* `downloadLatestStatisticsFile(domain: Domain, registry: Registry, filename: string): Promise<string>`
* `function parseStatisticsFile(filename: string): AsyncIterable<IVersion | ISummary | IRecord>`
* `function parseFormat(lines: Iterable<string>): Iterable<IVersion | ISummary | IRecord>`
* `function parseFormatAsync(lines: AsyncIterable<string>): AsyncIterable<IVersion | ISummary | IRecord>`
* `function isVersion(val: IVersion | ISummary | IRecord): boolean`
* `function isSummary(val: IVersion | ISummary | IRecord): boolean`
* `function isRecord(val: IVersion | ISummary | IRecord): boolean`

## Structure

```ts
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
```

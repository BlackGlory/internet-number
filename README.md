# internet-number [![npm](https://img.shields.io/npm/v/internet-number.svg?maxAge=86400)](https://www.npmjs.com/package/internet-number) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/BlackGlory/internet-number/master/LICENSE)

Utilities for fethcing and parsing latest statistics files from RIR

## Install

```sh
npm install --save internet-number
# or
yarn add internet-number
```

## Usage

```typescript
const filename = await downloadLatestStatisticsFile(
  Domian.AFRINIC
, Registry.AFRINIC
, '/tmp/latest'
)

for await (const value of parseStatisticsFile(filename)) {
  if (isVersion(value)) ...
  if (isSummary(value)) ...
  if (isRecord(value)) ...
}
```

## API

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

### downloadLatestStatisticsFile

```ts
function downloadLatestStatisticsFile(
  domain: Domain
, registry: Registry
, filename: string
): Promise<string>
```

### fetchLatestChecksum

```ts
function fetchLatestChecksum(domain: Domain, registry: Registry): Promise<string>
```

### fetchLatestStatisticsFile

```ts
function fetchLatestStatisticsFile(
  domain: Domain
, registry: Registry
): Promise<NodeJS.ReadableStream>
```

### parseStatisticsFile

```ts
function parseStatisticsFile(
  filename: string
): AsyncIterable<IVersion | ISummary | IRecord>
```

### parseFormat

```ts
function parseFormat(lines: Iterable<string>): Iterable<IVersion | ISummary | IRecord>
```

### parseFormatAsync

```ts
function parseFormatAsync(
  lines: AsyncIterable<string>
): AsyncIterable<IVersion | ISummary | IRecord>
```

### isVersion

```ts
function isVersion(val: IVersion | ISummary | IRecord): boolean
```

### isSummary

```ts
function isSummary(val: IVersion | ISummary | IRecord): boolean
```

### isRecord

```ts
function isRecord(val: IVersion | ISummary | IRecord): boolean
```

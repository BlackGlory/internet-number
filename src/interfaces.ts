export interface IVersion {
  version: string
  registry: string
  serial: string
  records: string
  startdate: string
  enddate: string
  UTCoffset: string
}

export interface ISummary {
  registry: string
  type: string
  count: string
  summary: string
}

export interface IRecord {
  registry: string
  cc: string
  type: string
  start: string
  value: string
  date: string
  status: string
  extensions: string[]
}

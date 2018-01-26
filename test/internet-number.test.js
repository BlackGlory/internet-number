import getInternetNumber from '../src/internet-number'

jest.setTimeout(1000 * 60 * 5)

test('getInternetNumber()', async () => {
  const {
    header: {
      version
    , summaries
    }
  , records
  } = await getInternetNumber()

  expect(typeof version.version).toBe('string')
  expect(typeof version.registry).toBe('string')
  expect(typeof version.serial).toBe('string')
  expect(typeof version.serial).toBe('string')
  expect(typeof version.records).toBe('string')
  expect(typeof version.startdate).toBe('string')
  expect(typeof version.enddate).toBe('string')
  expect(typeof version.UTCoffset).toBe('string')

  for (const summary of summaries) {
    expect(typeof summary.registry).toBe('string')
    expect(typeof summary.type).toBe('string')
    expect(typeof summary.count).toBe('string')
    expect(summary.summary).toBe('summary')
  }

  for (const record of records) {
    expect(typeof record.registry).toBe('string')
    expect(typeof record.cc).toBe('string')
    expect(record.cc.length).toBe(2)
    expect(typeof record.type).toBe('string')
    expect(typeof record.start).toBe('string')
    expect(typeof record.value).toBe('string')
    expect(typeof record.date).toBe('string')
    expect(typeof record.status).toBe('string')
    expect(Array.isArray(record.extensions)).toBeTruthy()
  }
})

import * as fs from 'fs'
import * as path from 'path'
import { tmpNameSync } from 'tmp-promise'

export function getStatisticsFileContent(): string {
  const fs = jest.requireActual('fs')
  return fs.readFileSync(path.join(__dirname, './fixtures/statistics.txt'), { encoding: 'utf8'} )
}

export function getChecksum(): string {
  return getChecksumFileContent().match(/[\w\d]{32}/)![0]
}

export function getChecksumFileContent(): string {
  const fs = jest.requireActual('fs')
  return fs.readFileSync(path.join(__dirname, './fixtures/checksum.md5'), { encoding: 'utf8' })
}

export class FakeFile {
  filename = tmpNameSync()

  setup() {}

  teardown() {
    if (fs.existsSync(this.getFilename())) fs.unlinkSync(this.getFilename())
  }

  getFilename(): string {
    return this.filename
  }

  exists(): boolean {
    return fs.existsSync(this.getFilename())
  }

  getContent(): string {
    return fs.readFileSync(this.getFilename(), { encoding: 'utf8' }) as string
  }
}

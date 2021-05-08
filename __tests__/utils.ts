import * as fs from 'fs'
import * as path from 'path'
import { createTempFilenameSync } from 'extra-filesystem'

export function getStatisticsFileContent(): string {
  const fs = jest.requireActual('fs')
  const filename = path.join(__dirname, './fixtures/statistics.txt')
  return fs.readFileSync(filename, 'utf-8')
}

export function getChecksum(): string {
  return getChecksumFileContent().match(/[\w\d]{32}/)![0]
}

export function getChecksumFileContent(): string {
  const fs = jest.requireActual('fs')
  const filename = path.join(__dirname, './fixtures/checksum.md5')
  return fs.readFileSync(filename, 'utf-8')
}

export class FakeFile {
  filename = createTempFilenameSync()

  setup() {}

  teardown() {
    if (fs.existsSync(this.getFilename())) {
      fs.rmSync(this.getFilename())
    }
  }

  getFilename(): string {
    return this.filename
  }

  exists(): boolean {
    return fs.existsSync(this.getFilename())
  }

  getContent(): string {
    return fs.readFileSync(this.getFilename(), 'utf-8') as string
  }
}

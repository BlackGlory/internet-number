import * as fs from 'fs'
import { nanoid } from 'nanoid'
import * as path from 'path'

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
  #id = nanoid()

  setup() {}

  teardown() {
    if (fs.existsSync(this.getFilename())) fs.unlinkSync(this.getFilename())
  }

  getFilename(): string {
    return `/fake-${this.#id}.txt`
  }

  isExist(): boolean {
    return fs.existsSync(this.getFilename())
  }

  getContent(): string {
    return fs.readFileSync(this.getFilename(), { encoding: 'utf8' }) as string
  }
}

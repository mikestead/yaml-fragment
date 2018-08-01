const expect = require('expect')
const fs = require('fs')
const { replaceFileRefs } = require('../src/indexGenerator')
const { applyDefaultOptions } = require('../src/options')

const DEFAULT_OPTIONS = applyDefaultOptions({
  rootDir: './test/_fixture',
  openapi: true
})

console.log('DEFAULT_OPTIONS', DEFAULT_OPTIONS)

describe('indexGenerator', () => {
  describe('replaceFileRefs', () => {
    it('should render yaml document from referenced fragments', () => {
      const contents = replaceFileRefs(DEFAULT_OPTIONS)
      expect(contents).toBe(fs.readFileSync('./test/_fixture/index-orig.yml', 'utf8'))
    })
  })
})

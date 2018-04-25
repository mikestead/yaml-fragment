const expect = require('expect')
const fs = require('fs')
const gen = require('../src/indexGenerator')
const util = require('../src/util')

const DEFAULT_OPTIONS = util.applyDefaultOptions({ autoGenComment: '' })

describe('indexGenerator', () => {
  describe('renderIndex', () => {
    it('should render yaml document from referenced fragments', () => {
      const contents = gen.renderIndex('./test/_fixture/index.yml', DEFAULT_OPTIONS)
      expect(contents).toBe(fs.readFileSync('./test/_fixture/index-orig.yml', 'utf8'))
    })
  })
})

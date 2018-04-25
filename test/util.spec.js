const expect = require('expect')
const util = require('../src/util')

describe('util', () => {
  describe('applyDefaultOptions', () => {
    it('should apply default format key option', () => {
      const options = util.applyDefaultOptions({})
      expect(options.formatMapKey).toBeA('function')
      expect(options.formatMapKey({ name: 'a' })).toBe('a')
    })

    it('should apply default indent', () => {
      const options = util.applyDefaultOptions({})
      expect(options.indent).toBe('  ')
    })

    it('should apply default auto gen comment', () => {
      const options = util.applyDefaultOptions({})
      expect(options.autoGenComment).toBe('# Auto Generated')
    })

    it('should prioritize custom options', () => {
      const autoGenComment = 'a'
      const formatMapKey = a => a
      const indent = '\t'
      const options = util.applyDefaultOptions({ autoGenComment, formatMapKey, indent })

      expect(options.autoGenComment).toBe(autoGenComment)
      expect(options.formatMapKey).toBe(formatMapKey)
      expect(options.indent).toBe(indent)
    })
  })
})

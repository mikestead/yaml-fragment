const expect = require('expect')
const { applyDefaultOptions } = require('../src/options')

describe('options', () => {
  describe('applyDefaultOptions', () => {
    it('should apply default format key option', () => {
      const opt = applyDefaultOptions({})
      expect(opt.formatMapKey).toBeA('function')
      expect(opt.formatMapKey()).toBeA('function')
      expect(opt.formatMapKey()({ name: 'a' })).toBe('a')
    })

    it('should apply default indent', () => {
      const opt = applyDefaultOptions({})
      expect(opt.indent).toBe('  ')
    })

    it('should prioritize custom options', () => {
      const autoGenComment = 'a'
      const formatMapKey = b => a => a
      const indent = '\t'
      const opt = applyDefaultOptions({ autoGenComment, formatMapKey, indent })

      expect(opt.autoGenComment).toBe(autoGenComment)
      expect(opt.formatMapKey).toBe(formatMapKey)
      expect(opt.indent).toBe(indent)
    })
  })
})

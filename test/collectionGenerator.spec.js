const expect = require('expect')
const { renderCollectionFile } = require('../src/collectionGenerator')
const { applyDefaultOptions } = require('../src/options')

const formatMapKey = dir => file => file.name.split('_').join('/')
const ROOT_DIR = './test/_fixture'
const DEFAULT_OPTIONS = applyDefaultOptions({ rootDir: ROOT_DIR })
const PATH_FORMAT_OPTIONS = applyDefaultOptions({ rootDir: ROOT_DIR, formatMapKey })
const DEFINITIONS_MAP = `Error:
  $ref: ./Error.yml
Pet:
  $ref: ./Pet.yml
Pets:
  $ref: ./Pets.yml
`
const DEFINITIONS_LIST = `- $ref: ./Error.yml
- $ref: ./Pet.yml
- $ref: ./Pets.yml
`
const PATHS_MAP = `/pets:
  $ref: ./_pets.yml
/pets/{petId}:
  $ref: ./_pets_{petId}.yml
`

const EXPECTED_FILES = [
  { path: './test/_fixture/definitions/.list.yml', expectedContents: DEFINITIONS_LIST },
  { path: './test/_fixture/definitions/.map.yml', expectedContents: DEFINITIONS_MAP },
  { path: './test/_fixture/paths/.map.yml', expectedContents: PATHS_MAP }
]

describe('collectionGenerator', () => {
  describe('renderCollectionFile', () => {
    it('should scan parent folder for yaml fragments and render yaml MAP of refs to them', () => {
      const contents = renderCollectionFile('./test/_fixture/definitions/.map.yml', DEFAULT_OPTIONS)
      expect(contents).toBe(DEFINITIONS_MAP)
    })

    it('should scan parent folder for yaml fragments and render yaml LIST of refs to them', () => {
      const contents = renderCollectionFile(
        './test/_fixture/definitions/.list.yml',
        DEFAULT_OPTIONS
      )
      expect(contents).toBe(DEFINITIONS_LIST)
    })

    it('should support custom formatting of keys in yaml MAP generation', () => {
      const contents = renderCollectionFile('./test/_fixture/paths/.map.yml', PATH_FORMAT_OPTIONS)
      expect(contents).toBe(PATHS_MAP)
    })
  })
})

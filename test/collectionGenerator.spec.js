const expect = require('expect')
const fs = require('fs')
const gen = require('../src/collectionGenerator')
const util = require('../src/util')

const autoGenComment = ''
const formatMapKey = file => file.name.split('_').join('/')
const DEFAULT_OPTIONS = util.applyDefaultOptions({ autoGenComment })
const PATH_FORMAT_OPTIONS = util.applyDefaultOptions({ formatMapKey, autoGenComment })
const BASE_DIR = './test/_fixture'
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
  describe('findCollectionFiles', () => {
    it('should locate all .list.yml and .map.yml in directory tree', () =>
      gen
        .findCollectionFiles('./test/_fixture')
        .then(files => expect(files).toEqual(EXPECTED_FILES.map(file => file.path))))
  })

  describe('renderCollectionFile', () => {
    it('should scan parent folder for yaml fragments and render yaml MAP of refs to them', () =>
      gen
        .renderCollectionFile(BASE_DIR, './test/_fixture/definitions/.map.yml', DEFAULT_OPTIONS)
        .then(contents => expect(contents).toBe(DEFINITIONS_MAP)))

    it('should scan parent folder for yaml fragments and render yaml LIST of refs to them', () =>
      gen
        .renderCollectionFile(BASE_DIR, './test/_fixture/definitions/.list.yml', DEFAULT_OPTIONS)
        .then(contents => expect(contents).toBe(DEFINITIONS_LIST)))

    it('should support custom formatting of keys in yaml MAP generation', () =>
      gen
        .renderCollectionFile(BASE_DIR, './test/_fixture/paths/.map.yml', PATH_FORMAT_OPTIONS)
        .then(contents => expect(contents).toBe(PATHS_MAP)))
  })

  describe('genCollectionFiles', () => {
    it('should render and save all .list.yml and .map.yml collection files', () =>
      gen
        .genCollectionFiles(BASE_DIR, PATH_FORMAT_OPTIONS)
        .then(() =>
          EXPECTED_FILES.forEach(file =>
            expect(fs.readFileSync(file.path, 'utf8')).toBe(file.expectedContents)
          )
        ))
  })
})

# Yaml Fragment

[![Build Status](https://travis-ci.org/mikestead/yaml-fragment.svg?branch=master)](https://travis-ci.org/mikestead/yaml-fragment)

A tool to construct a yaml document from smaller yaml documents.

The aim is to generate a single yaml document which is formatted exactly as you wrote
your referenced fragments, making it easy to consume by human eye or machine.

Transforming to json and back to yaml can lose some original formatting, because of this no 
transformation is done, instead each fragment is inserted where it's referenced in 
a parent document.

[Swagger](http://swagger.io/) [spec](https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md)
generation is a primary use case, but it can be used anywhere you have an unwieldy yaml document 
which would be easier to maintain in fragments.
 

## Installation

```
npm install --save yaml-fragment
```

## Usage

```javascript
import yamlFragment from 'yaml-fragment'

yamlFragment.genDocument(
	'./spec',             // base directory of your fragments
	'./spec/index.yml',   // the root document which references fragments
	'./spec.yml',         // The file to generate
	options)              // Optional options object
```

#### Available options

- **indent**: Indentation string to use in yaml. Defaults to two spaces.
- **autoGenComment**: A comment to place at the top of any generated file. Defaults to `# Auto Generated`.
- **formatMapKey**: Function to format a [parsed path object](https://nodejs.org/api/path.html#path_path_parse_pathstring) to a yaml map key. Defaults to return raw filename.
- **quoteMapKeyRegex**: Regex to test map keys. If it fails the key will be wrapped in quotes. Defaults to wrap anything starting with a number.
- **relativePaths**: True if using relative paths in generated collection files. Defaults to true.

### Fragments

Start with a base document which includes `$ref`s to local fragments. 

Note: To be replaced, `$ref`s must begin with `./` or `../`.

#### index.yml

```yaml
swagger: "2.0"
info:
  $ref: ./info.yml
host: petstore.swagger.io
basePath: /v1
schemes:
  - http
consumes:
  - application/json
produces:
  - application/json
paths:
  $ref: ./paths/.map.yml
definitions:
  $ref: ./definitions/.map.yml
```

#### Lists

To generate a list based on each yaml file in a fragment directory, add a `.list.yml`
file to the folder and reference this file in a parent document.

During document pre-generation any `.list.yml` will be populated with references to each
yaml fragment file in the same directory, e.g.

```yaml
- $ref: ./Error.yml
- $ref: ./Pet.yml
- $ref: ./Pets.yml
```

#### Maps

To generate a map based on each yaml file in a fragment directory, add a `.map.yml`
file to the folder and reference this file in a parent document.

During document pre-generation any `.map.yml` will be populated with references to each
yaml fragment file in the same directory, e.g.

```yaml
Error:
  $ref: ./Error.yml
Pet:
  $ref: ./Pet.yml
Pets:
  $ref: ./Pets.yml
```

The key for each defaults to the filename it references, however you can process these names
via the option `formatMapKey`. For example if our key is a swagger path we can use underscores 
in the filename to represent forward slash and then replace these during generation.

	options.formatMapKey = file => file.name.split('_').join('/')
	
#### Example

[See here](https://github.com/mikestead/yaml-fragment/tree/master/test/_fixture) for a more complete
example of fragments.

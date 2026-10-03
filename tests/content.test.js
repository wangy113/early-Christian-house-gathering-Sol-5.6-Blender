import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { experience } from '../src/content/experience.js'
import { encounters } from '../src/content/encounters.js'
import { sources } from '../src/content/sources.js'
import { validateContent } from '../src/content/validate.js'

test('authored content passes structural validation', () => {
  assert.deepEqual(validateContent({ experience, encounters, sources }), [])
})

test('the six stable IDs keep the specified order and kinds', () => {
  assert.deepEqual(experience.order, ['letter', 'meal', 'reading', 'diversity', 'care', 'pressure'])
  assert.deepEqual(
    experience.order.map((id) => encounters[id].kind),
    ['deep', 'deep', 'brief', 'brief', 'deep', 'brief'],
  )
})

test('every encounter uses its own original image, and the file exists', () => {
  const paths = experience.order.map((id) => encounters[id].image.originalPath)
  assert.equal(new Set(paths).size, 6)
  for (const path of paths) {
    assert.ok(!path.includes('-blender'), `${path} must be a non-Blender original`)
    assert.ok(existsSync(new URL(`../public/${path}`, import.meta.url)), `${path} is missing`)
  }
})

test('source manifest matches the content specification table', () => {
  const expected = { letter: ['S3', 'S4'], meal: ['S2', 'S1'], reading: ['S1', 'S2'], diversity: ['S2', 'S3'], care: ['S1'], pressure: ['S5'] }
  for (const [id, ids] of Object.entries(expected)) assert.deepEqual(encounters[id].sourceIds, ids)
  assert.equal(encounters.diversity.recall.encounterId, 'meal')
  assert.equal(encounters.care.recall.encounterId, 'letter')
})

test('E6 marks exactly one supported caption, as explanation not score', () => {
  const supported = encounters.pressure.choices.filter((choice) => choice.support === 'supported')
  assert.deepEqual(supported.map((choice) => choice.id), ['context'])
  assert.ok(!JSON.stringify(encounters.pressure).match(/point|score|correct/i))
})

test('validator reports broken references', () => {
  const broken = structuredClone(encounters)
  broken.meal.sourceIds = ['S9']
  broken.care.choices.push({ ...broken.care.choices[0] })
  const problems = validateContent({ experience, encounters: broken, sources })
  assert.ok(problems.some((p) => p.includes('unknown source "S9"')))
  assert.ok(problems.some((p) => p.includes('repeats choice id')))
})

import { test, expect } from '@playwright/test'
import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const KEY = 'at-the-threshold:notebook:v1'
const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const progressText = (page) => page.locator('.progress-text')
const heading = (page) => page.locator('#page-heading')

test('every navigation route records visits the same way', async ({ page }) => {
  await page.goto('./')
  await expect(page).toHaveURL(/#\/start$/)
  await expect(progressText(page)).toHaveText('0 of 6 encounters visited · notes in 0')

  await page.getByRole('link', { name: 'Begin at the threshold' }).click()
  await expect(heading(page)).toHaveText('A traveler at the threshold')
  await expect(heading(page)).toBeFocused()

  await page.getByRole('link', { name: /^Next: E2/ }).click()
  await expect(heading(page)).toHaveText('A shared table, an uneven welcome')

  await page.locator('.contents').getByRole('link', { name: /E3/ }).click()
  await expect(heading(page)).toHaveText('Hearing together, interpreting differently')

  await page.goto('./#/encounter/care')
  await expect(heading(page)).toHaveText('Care when needs do not match resources')
  await expect(progressText(page)).toHaveText('4 of 6 encounters visited · notes in 0')

  await page.goBack()
  await expect(heading(page)).toHaveText('Hearing together, interpreting differently')
  await page.goForward()
  await page.reload()
  await expect(progressText(page)).toHaveText('4 of 6 encounters visited · notes in 0')
  await expect(page.locator('.contents')).toContainText('visited')
})

test('meal: first response is preserved through reveal, revision, reload, and export', async ({ page }) => {
  await page.goto('./#/encounter/meal')
  await page.getByLabel('I can see… (optional)').fill('Three people passing bread.')
  await page.getByLabel('I am assuming… (optional)').fill('Everyone is welcome.')
  await page.getByRole('radio', { name: 'Wait for those who have not arrived.' }).check()
  await page.getByLabel('My reason (optional)').fill('Nobody should be left out.')
  await page.getByRole('button', { name: 'Consider another perspective' }).click()

  await expect(page.locator('.response')).toContainText('Then the person who must leave may miss the meal.')
  await expect(page.locator('.response')).toContainText('Who carries the burden of waiting?')
  await expect(page.getByRole('button', { name: 'Consider another perspective' })).toHaveCount(0)
  await expect(page.locator('.sources .source-card')).toHaveCount(2)
  await expect(page.locator('.snapshot')).toContainText('Nobody should be left out.')

  await page.locator('.current').getByRole('radio', { name: 'Still unsure' }).check()
  await page.getByLabel('My thinking now (optional)').fill('Waiting has a cost for the person who must leave.')
  await page.locator('.source-card summary').first().click()
  await expect(page.locator('.save-status').first()).toHaveText('Saved on this browser')

  await page.reload()
  await expect(page.locator('.snapshot')).toContainText('Nobody should be left out.')
  await expect(page.locator('.snapshot')).toContainText('Wait for those who have not arrived.')
  await expect(page.getByLabel('My thinking now (optional)')).toHaveValue('Waiting has a cost for the person who must leave.')
  await expect(page.locator('.current').getByRole('radio', { name: 'Still unsure' })).toBeChecked()

  const stored = JSON.parse(await page.evaluate((key) => localStorage.getItem(key), KEY))
  expect(stored.entries.meal.firstSnapshot.choiceId).toBe('wait')
  expect(stored.entries.meal.revisedChoiceId).toBe('unsure')
  expect(stored.entries.meal.sourceIdsOpened).toEqual(['S2'])

  await page.getByRole('link', { name: 'My notes' }).last().click()
  await expect(heading(page)).toHaveText('My observations and thinking')
  await expect(page.locator('main')).toContainText('Waiting has a cost for the person who must leave.')
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download notes' }).first().click()])
  const text = await readFile(await download.path(), 'utf8')
  expect(text).toContain('> Nobody should be left out.')
  expect(text).toContain('> Waiting has a cost for the person who must leave.')
  expect(text).toContain('Still unsure')
  expect(text).not.toMatch(/rubric|grade|submit|canvas/i)
})

test('a blank reveal works and shows neutral feedback', async ({ page }) => {
  await page.goto('./#/encounter/letter')
  await page.getByRole('button', { name: 'Consider another perspective' }).click()
  await expect(page.locator('.response')).toContainText('Welcoming and checking a claim can each impose costs.')
  await expect(page.locator('.snapshot')).toContainText('No note recorded.')
  await expect(progressText(page)).toContainText('notes in 0')
})

test('recall quotes only what the learner wrote, or links back', async ({ page }) => {
  await page.goto('./#/encounter/diversity')
  await expect(page.locator('.recall')).toContainText('You have not recorded a reason in E2 yet.')
  await page.goto('./#/encounter/meal')
  await page.getByLabel('My reason (optional)').fill('Shared presence matters more than portions.')
  await page.goto('./#/encounter/diversity')
  await expect(page.locator('.recall blockquote')).toHaveText('Shared presence matters more than portions.')
  await expect(page.locator('.recall')).toContainText('Does this conversation complicate your earlier view of participation?')
})

test('E6 explains support without scoring; brief note persists', async ({ page }) => {
  await page.goto('./#/encounter/pressure')
  await page.getByRole('radio', { name: 'This proves a raid is imminent.' }).check()
  await page.getByRole('button', { name: 'See a response' }).click()
  await expect(page.locator('.response')).toContainText('Not supported by what is depicted')
  await page.getByRole('radio', { name: /religious surroundings/ }).check()
  await expect(page.locator('.response')).toContainText('Supported by what is depicted')
  await expect(page.locator('main')).not.toContainText(/points|score|correct!/i)
  await page.getByLabel('My note (optional)').fill('I can describe a shrine.')
  await page.getByRole('link', { name: 'Look back' }).last().click()
  await expect(heading(page)).toHaveText('Look back at the gathering')
  await page.reload()
  await page.goto('./#/encounter/pressure')
  await expect(page.getByLabel('My note (optional)')).toHaveValue('I can describe a shrine.')
})

test('storage that refuses writes keeps text, warns, and still exports', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('blocked', 'SecurityError')
    }
  })
  await page.goto('./#/encounter/reading')
  await page.getByLabel('My note (optional)').fill('Unsaved but still here.')
  const alert = page.getByRole('alert')
  await expect(alert).toContainText('Not saved on this browser')
  await expect(alert).toContainText('reloading or closing it can lose anything not saved')
  await expect(page.locator('.save-status').first()).toHaveText('Not saved on this browser')
  await expect(page.getByLabel('My note (optional)')).toHaveValue('Unsaved but still here.')
  const [download] = await Promise.all([page.waitForEvent('download'), alert.getByRole('button', { name: 'Download notes' }).click()])
  expect(await readFile(await download.path(), 'utf8')).toContain('Unsaved but still here.')
})

test('quota failure is reported as storage full', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('full', 'QuotaExceededError')
    }
  })
  await page.goto('./#/start')
  await page.getByLabel(/What might make a gathering a community/).fill('x')
  await expect(page.getByRole('alert')).toContainText('Browser storage is full')
})

test('malformed stored data is offered for download and never overwritten', async ({ page }) => {
  await page.addInitScript((key) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(key, '{"schemaVersion": 1, broken')
      sessionStorage.setItem('seeded', '1')
    }
  }, KEY)
  await page.goto('./#/encounter/reading')
  await expect(page.getByRole('alert')).toContainText('Saved notes could not be opened')
  await page.getByLabel('My note (optional)').fill('new text')
  await page.waitForTimeout(600)
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe('{"schemaVersion": 1, broken')
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download the stored data' }).click()])
  expect(await readFile(await download.path(), 'utf8')).toBe('{"schemaVersion": 1, broken')
  await page.getByRole('button', { name: 'Begin fresh…' }).click()
  await page.getByRole('button', { name: 'Begin fresh and replace stored data' }).click()
  await expect(page.locator('.save-status').first()).toHaveText('Saved on this browser')
  expect(JSON.parse(await page.evaluate((key) => localStorage.getItem(key), KEY)).entries.reading.note).toBe('new text')
})

test('future-version data is not overwritten', async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ schemaVersion: 9, experienceId: 'at-the-threshold' }))
  }, KEY)
  await page.goto('./#/start')
  await expect(page.getByRole('alert')).toContainText('format version 9')
  await page.getByLabel(/What might make a gathering a community/).fill('x')
  await page.waitForTimeout(600)
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toContain('"schemaVersion":9')
})

test('backup import validates before replacing; reset can be cancelled; legacy key untouched', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('house-evidence')) localStorage.setItem('house-evidence', '["meal"]')
  })
  await page.goto('./#/start')
  await page.getByLabel(/What might make a gathering a community/).fill('Original thought')
  await page.goto('./#/notebook')

  const bad = testInfo.outputPath('bad.json')
  await writeFile(bad, JSON.stringify({ experienceId: 'something-else' }))
  await page.getByLabel(/Restore backup/).setInputFiles(bad)
  await expect(page.locator('.restore')).toContainText('different activity. Nothing was changed.')
  await expect(page.locator('main')).toContainText('Original thought')

  const [backupDownload] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download backup' }).click()])
  const backup = JSON.parse(await readFile(await backupDownload.path(), 'utf8'))
  backup.openingThought = 'Restored thought'
  const good = testInfo.outputPath('good.json')
  await writeFile(good, JSON.stringify(backup))
  await page.getByLabel(/Restore backup/).setInputFiles(good)
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.locator('main')).toContainText('Original thought')
  await page.getByLabel(/Restore backup/).setInputFiles(good)
  await page.getByRole('button', { name: 'Replace with backup' }).click()
  await expect(page.locator('main')).toContainText('Restored thought')

  await page.getByRole('button', { name: 'Start over…' }).click()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.locator('main')).toContainText('Restored thought')
  await page.getByRole('button', { name: 'Start over…' }).click()
  await page.getByRole('button', { name: 'Delete my notes and start over' }).click()
  await expect(page.locator('.reset')).toContainText('Your notes were deleted')
  await page.reload()
  await expect(page.locator('main')).not.toContainText('Restored thought')
  expect(await page.evaluate(() => localStorage.getItem('house-evidence'))).toBe('["meal"]')
})

test('a change in another tab pauses saving here', async ({ context }) => {
  const a = await context.newPage()
  const b = await context.newPage()
  await a.goto('./#/encounter/reading')
  await b.goto('./#/encounter/reading')
  await a.getByLabel('My note (optional)').fill('From tab A')
  await expect(a.locator('.save-status').first()).toHaveText('Saved on this browser')
  await expect(b.getByRole('alert')).toContainText('Your notes changed in another tab')
  await b.getByLabel('My note (optional)').fill('From tab B')
  await b.waitForTimeout(600)
  expect(JSON.parse(await b.evaluate((key) => localStorage.getItem(key), KEY)).entries.reading.note).toBe('From tab A')
  await b.getByRole('button', { name: 'Load the saved version' }).click()
  await expect(b.getByLabel('My note (optional)')).toHaveValue('From tab A')
})

test('invalid routes are recoverable', async ({ page }) => {
  await page.goto('./#/encounter/unknown')
  await expect(heading(page)).toHaveText('That section was not found')
  await page.getByRole('link', { name: 'Go to the start' }).click()
  await expect(heading(page)).toHaveText(/At the Threshold/)
})

test('descriptions only requests no images and keeps every task', async ({ page }) => {
  const images = []
  page.on('request', (request) => {
    if (request.resourceType() === 'image' && !request.url().endsWith('.svg')) images.push(request.url())
  })
  await page.goto('./#/start')
  await page.getByLabel(/Descriptions only/).check()
  for (const id of ['letter', 'meal', 'reading', 'diversity', 'care', 'pressure']) {
    await page.goto(`./#/encounter/${id}`)
    await expect(page.locator('.image-description')).toContainText('Image description')
    await expect(page.locator('main img')).toHaveCount(0)
    await expect(page.locator('main').getByRole('radio').first()).toBeVisible()
  }
  expect(images).toEqual([])
})

test('blocked images leave a description and working controls', async ({ page }) => {
  await page.route(/\.(jpg|png)$/, (route) => route.abort())
  await page.goto('./#/encounter/care')
  await expect(page.locator('.image-failed')).toContainText('The image could not load')
  await expect(page.locator('.image-description')).toContainText('An adult on the left holds bread')
  await page.getByRole('radio', { name: 'Divide the help between both requests.' }).check()
  await page.getByRole('button', { name: 'Consider another perspective' }).click()
  await expect(page.locator('.response')).toContainText('insufficiently met')
})

test('keyboard-only path through an encounter, and image dialog focus return', async ({ page }) => {
  await page.goto('./#/encounter/letter')
  const enlarge = page.getByRole('button', { name: 'Enlarge image' })
  await enlarge.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: /full-size modern reconstruction/ })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(enlarge).toBeFocused()

  await page.getByRole('radio', { name: 'Offer hospitality immediately.' }).focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('radio', { name: 'Offer a temporary welcome while seeking information.' })).toBeChecked()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Clear selection' })).toBeFocused()
  await page.keyboard.press('Tab')
  await page.keyboard.type('Someone must do the work.')
  await expect(page.getByLabel('My reason (optional)')).toHaveValue('Someone must do the work.')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Consider another perspective' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('.response')).toContainText('someone must provide the time, space, and work')
  await page.getByRole('link', { name: /^Next: E2/ }).focus()
  await page.keyboard.press('Enter')
  await expect(heading(page)).toBeFocused()
})

test('320px wide layout has no horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  for (const hash of ['#/start', '#/encounter/meal', '#/encounter/pressure', '#/notebook', '#/closing']) {
    await page.goto(`./${hash}`)
    await expect(heading(page)).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, hash).toBeLessThanOrEqual(0)
  }
  await page.goto('./#/encounter/meal')
  await page.getByRole('button', { name: 'Consider another perspective' }).click()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('offline packet opens from file:// without network requests', async ({ page }) => {
  const external = []
  page.on('request', (request) => {
    if (!request.url().startsWith('file:')) external.push(request.url())
  })
  await page.goto(pathToFileURL(join(dist, 'experience-packet.html')).href)
  await expect(page.locator('h1')).toHaveText('At the Threshold: Belonging in an Early Christian Gathering')
  await expect(page.locator('section.encounter')).toHaveCount(7)
  await expect(page.locator('body')).toContainText('Then the person who must leave may miss the meal.')
  await expect(page.locator('body')).toContainText('Pliny and Trajan, Letters 10.96–97')
  expect(external).toEqual([])
})

test('no-JavaScript visitors get the packet link', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4173/')
  await expect(page.getByRole('link', { name: 'offline experience' }).first()).toBeVisible()
  await page.getByRole('link', { name: 'offline experience' }).first().click()
  await expect(page.locator('h1')).toContainText('At the Threshold')
  await context.close()
})

test('works under a GitHub Pages project subpath', async ({ page }) => {
  const prefix = '/early-Christian-house-gathering-Sol-5.6-Blender/'
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png' }
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, 'http://x')
    if (!url.pathname.startsWith(prefix)) {
      response.writeHead(404).end()
      return
    }
    const path = normalize(url.pathname.slice(prefix.length) || 'index.html')
    try {
      const body = await readFile(join(dist, path))
      response.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' }).end(body)
    } catch {
      response.writeHead(404).end()
    }
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const failed = []
  page.on('response', (response) => {
    if (response.status() >= 400) failed.push(response.url())
  })
  try {
    const base = `http://127.0.0.1:${server.address().port}${prefix}`
    await page.goto(`${base}#/encounter/meal`)
    await expect(heading(page)).toHaveText('A shared table, an uneven welcome')
    await expect(page.locator('main img')).toHaveJSProperty('complete', true)
    expect(await page.locator('main img').evaluate((img) => img.naturalWidth)).toBeGreaterThan(0)
    await page.reload()
    await expect(heading(page)).toHaveText('A shared table, an uneven welcome')
    await page.goto(`${base}experience-packet.html`)
    await expect(page.locator('h1')).toContainText('At the Threshold')
    expect(failed).toEqual([])
  } finally {
    server.close()
  }
})

test('initial transfer for the first encounter stays within budget', async ({ page }) => {
  const sizes = []
  const urls = []
  page.on('requestfinished', async (request) => {
    const response = await request.response()
    const body = response ? await response.body().catch(() => Buffer.alloc(0)) : Buffer.alloc(0)
    sizes.push(body.length)
    urls.push(request.url())
  })
  await page.goto('./#/encounter/letter')
  await expect(page.locator('main img')).toHaveJSProperty('complete', true)
  await page.waitForLoadState('networkidle')
  const total = sizes.reduce((a, b) => a + b, 0)
  test.info().annotations.push({ type: 'transfer', description: `${urls.length} requests, ${(total / 1024).toFixed(1)} KiB uncompressed bodies` })
  console.log(`initial route: ${urls.length} requests, ${(total / 1024).toFixed(1)} KiB (uncompressed bodies)\n  ${urls.join('\n  ')}`)
  expect(urls.some((url) => /\.(glb|mp4|png)$/.test(url) || url.includes('three'))).toBe(false)
  expect(total).toBeLessThan(1.5 * 1024 * 1024)
})

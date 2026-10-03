import { test as base, expect } from '@playwright/test'
import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Google Fonts is progressive enhancement; keep tests independent of the network.
const test = base.extend({
  page: async ({ page }, provide) => {
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort())
    await provide(page)
  },
})

const KEY = 'at-the-threshold:notebook:v1'
const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const progressText = (page) => page.locator('.progress-text')
const heading = (page) => page.locator('#page-heading')
const stored = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY)
const saved = (page) => expect(page.locator('.save-status').first()).toHaveText('Saved on this browser')

test('every navigation route records visits the same way', async ({ page }) => {
  await page.goto('./')
  await expect(page).toHaveURL(/#\/start$/)
  await expect(progressText(page)).toHaveText('0 of 6 pictures explored · 0 sorted')

  await page.getByRole('link', { name: 'Begin at the threshold' }).click()
  await expect(heading(page)).toHaveText('A traveler at the threshold')
  await expect(heading(page)).toBeFocused()

  await page.getByRole('link', { name: /^Next: E2/ }).click()
  await expect(heading(page)).toHaveText('A shared table, an uneven welcome')

  await page.locator('.contents').getByRole('link', { name: /E3/ }).click()
  await expect(heading(page)).toHaveText('Hearing together, interpreting differently')

  await page.goto('./#/encounter/care')
  await expect(heading(page)).toHaveText('Care when needs do not match resources')
  await expect(progressText(page)).toHaveText('4 of 6 pictures explored · 0 sorted')

  await page.goBack()
  await expect(heading(page)).toHaveText('Hearing together, interpreting differently')
  await page.goForward()
  await page.reload()
  await expect(progressText(page)).toHaveText('4 of 6 pictures explored · 0 sorted')
})

test('no text boxes anywhere in the experience', async ({ page }) => {
  for (const hash of ['#/start', '#/encounter/letter', '#/encounter/meal', '#/encounter/reading', '#/encounter/diversity', '#/encounter/care', '#/encounter/pressure', '#/notebook', '#/closing']) {
    await page.goto(`./${hash}`)
    await expect(heading(page)).toBeVisible()
    await expect(page.locator('textarea, input[type="text"]'), hash).toHaveCount(0)
  }
})

test('hotspots open details, lenses change the voice, and exploration is saved', async ({ page }) => {
  await page.goto('./#/encounter/meal')
  await page.getByRole('button', { name: 'Detail 2: The full table' }).click()
  const panel = page.locator('.detail-panel')
  await expect(panel).toContainText('In the picture')
  await expect(panel).toContainText('one goes hungry and another becomes drunk')
  await expect(panel).toContainText('Historical source · 1 Corinthians')
  await expect(panel).toContainText('What the picture can’t tell us')

  await page.getByRole('button', { name: 'A household worker' }).click()
  await expect(panel).toContainText('Fictional perspective')
  await expect(panel).toContainText('Every bowl here was carried, filled, and will be washed.')
  await expect(page.locator('.lens-note')).toContainText('It is not historical testimony.')

  await page.locator('.details-list').getByRole('button', { name: /The older woman/ }).click()
  await expect(panel).toContainText('She calls me by my name.')
  await expect(page.getByRole('button', { name: 'Detail 2: The full table (explored)' })).toBeVisible()

  await saved(page)
  expect((await stored(page)).entries.meal.hotspotsOpened).toEqual(['table', 'elder'])
})

test('numbered details can be hidden, stay hidden across pictures, and the list still works', async ({ page }) => {
  await page.goto('./#/encounter/meal')
  await expect(page.locator('.pic .marker')).toHaveCount(5)
  const toggle = page.getByRole('button', { name: 'Hide numbered details' })
  await toggle.click()
  await expect(page.locator('.pic .marker')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Show numbered details' })).toHaveAttribute('aria-pressed', 'true')
  await page.locator('.details-list').getByRole('button', { name: /The full table/ }).click()
  await expect(page.locator('.detail-panel')).toContainText('one goes hungry')
  await page.goto('./#/encounter/care')
  await expect(page.locator('.pic .marker')).toHaveCount(0)
  await page.reload()
  await expect(page.locator('.pic .marker')).toHaveCount(0)
  await page.getByRole('button', { name: 'Show numbered details' }).click()
  await expect(page.locator('.pic .marker')).toHaveCount(5)
})

test('dots are small and the reconstruction label sits bottom right', async ({ page }) => {
  await page.goto('./#/encounter/meal')
  const pic = await page.locator('.pic').boundingBox()
  const marker = await page.locator('.pic .marker').first().boundingBox()
  expect(marker.width).toBeLessThanOrEqual(28)
  expect(marker.width).toBeGreaterThanOrEqual(24)
  const label = await page.locator('.pic > .tag').boundingBox()
  expect(label.x + label.width).toBeGreaterThan(pic.x + pic.width * 0.8)
  expect(label.y + label.height).toBeGreaterThan(pic.y + pic.height * 0.85)
  await expect(page.locator('.pic > .tag')).toHaveText('Modern reconstruction')
})

test('outside the frame reveals questions with sourced or unknown answers', async ({ page }) => {
  await page.goto('./#/encounter/meal')
  await page.getByRole('button', { name: 'What’s outside this picture?' }).click()
  await expect(page.getByRole('button', { name: 'What happened before this moment?' })).toBeFocused()
  await page.getByRole('button', { name: 'Who cooked and served?' }).click()
  await expect(page.locator('.frame-answer:visible')).toContainText('Many Roman households relied on enslaved or hired workers')
  await expect(page.locator('.frame-answer:visible')).toContainText('Interpretation')
  await page.getByRole('button', { name: 'Back to the picture' }).click()
  await saved(page)
  expect((await stored(page)).entries.meal.outsideOpened).toEqual(['cooked'])
})

test('meal: decide, reconsider, rule, and sort; first choice survives reload', async ({ page }) => {
  await page.goto('./#/encounter/meal')
  await page.getByRole('radio', { name: 'Wait for those who have not arrived.' }).check()
  await page.getByRole('button', { name: 'See a response' }).click()
  await expect(page.locator('.response').first()).toContainText('Then the person who must leave may miss the meal.')
  await expect(page.locator('.first-choice')).toContainText('Wait for those who have not arrived.')
  await page.getByRole('radio', { name: 'Still unsure' }).check()

  await page.getByRole('radio', { name: 'Partly supported' }).check()
  await page.getByRole('button', { name: 'See how a historian might rule' }).click()
  await expect(page.locator('main')).toContainText('You ruled Partly supported. Historians could defend more than one ruling here.')

  const equal = page.getByRole('group', { name: 'Everyone at this gathering was treated as an equal.' })
  await equal.getByRole('radio', { name: 'In the picture' }).check()
  await page.getByRole('group', { name: 'Three people are sharing bread at a low table.' }).getByRole('radio', { name: 'In the picture' }).check()
  await page.getByRole('button', { name: 'See how a historian might sort these' }).click()
  await expect(equal).toContainText('You placed this under In the picture. It fits better under Not established.')
  await expect(page.getByRole('group', { name: 'Three people are sharing bread at a low table.' })).toContainText('and a historian would too')
  await expect(page.locator('main')).not.toContainText(/\bscore\b|points|correct!/i)
  await expect(progressText(page)).toHaveText('1 of 6 pictures explored · 1 sorted')

  await saved(page)
  await page.reload()
  await expect(page.locator('.first-choice')).toContainText('Wait for those who have not arrived.')
  await expect(page.getByRole('radio', { name: 'Still unsure' })).toBeChecked()
  await expect(equal.getByRole('radio', { name: 'In the picture' })).toBeChecked()
  const entry = (await stored(page)).entries.meal
  expect(entry.firstSnapshot.choiceId).toBe('wait')
  expect(entry.revisedChoiceId).toBe('unsure')
  expect(entry.verdictId).toBe('partly')
  expect(entry.sorts).toEqual({ equal: 'picture', sharing: 'picture' })

  await page.goto('./#/closing')
  await expect(heading(page)).toHaveText('Your reconstruction of the gathering')
  const pictureColumn = page.locator('.board-column.place-picture')
  await expect(pictureColumn).toContainText('Everyone at this gathering was treated as an equal.')
  await expect(pictureColumn).toContainText('A historian would place this under: Not established')
  await expect(page.locator('.ruling-list')).toContainText('Your ruling: Partly supported')
  await expect(page.locator('.ruling-list')).toContainText('Wait for those who have not arrived. → now: Still unsure')

  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download my reconstruction' }).click()])
  const text = await readFile(await download.path(), 'utf8')
  expect(text).toContain('E2: Everyone at this gathering was treated as an equal.')
  expect(text).toContain('Recommendation now: Still unsure')
  expect(text).not.toMatch(/rubric|grade|submit|canvas|score/i)
})

test('a response without a choice shows neutral feedback', async ({ page }) => {
  await page.goto('./#/encounter/letter')
  await page.getByRole('button', { name: 'See a response' }).click()
  await expect(page.locator('.response').first()).toContainText('Welcoming and checking a claim can each impose costs.')
  await expect(page.locator('.first-choice')).toContainText('No choice made')
})

test('recall shows the earlier decision, or links back', async ({ page }) => {
  await page.goto('./#/encounter/diversity')
  await expect(page.locator('.recall')).toContainText('You have not made a recommendation in E2 yet.')
  await page.goto('./#/encounter/meal')
  await page.getByRole('radio', { name: 'Begin and reserve food for those absent.' }).check()
  await page.goto('./#/encounter/diversity')
  await expect(page.locator('.recall')).toContainText('In E2 you recommended: Begin and reserve food for those absent.')
})

test('E6 explains caption support without scoring', async ({ page }) => {
  await page.goto('./#/encounter/pressure')
  await page.getByRole('radio', { name: 'This proves a raid is imminent.' }).check()
  await page.getByRole('button', { name: 'See a response' }).click()
  await expect(page.locator('.response').first()).toContainText('Not supported by what is depicted')
  await page.getByRole('radio', { name: /religious surroundings/ }).check()
  await expect(page.locator('.response').first()).toContainText('Supported by what is depicted')
  await page.getByRole('link', { name: 'See your reconstruction' }).click()
  await expect(heading(page)).toHaveText('Your reconstruction of the gathering')
})

test('storage that refuses writes keeps work on the page, warns, and still exports', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('blocked', 'SecurityError')
    }
  })
  await page.goto('./#/encounter/reading')
  await page.getByRole('radio', { name: 'Ask the listeners to explain what they heard.' }).check()
  const alert = page.getByRole('alert')
  await expect(alert).toContainText('Not saved on this browser')
  await expect(alert).toContainText('reloading or closing it can lose anything not saved')
  await expect(page.getByRole('radio', { name: 'Ask the listeners to explain what they heard.' })).toBeChecked()
  const [download] = await Promise.all([page.waitForEvent('download'), alert.getByRole('button', { name: 'Download my reconstruction' }).click()])
  expect(await readFile(await download.path(), 'utf8')).toContain('Choice: Ask the listeners to explain what they heard.')
})

test('quota failure is reported as storage full', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('full', 'QuotaExceededError')
    }
  })
  await page.goto('./#/encounter/letter')
  await expect(page.getByRole('alert')).toContainText('Browser storage is full')
})

test('old (version 1) saved notes are offered for download and never overwritten', async ({ page }) => {
  const v1 = JSON.stringify({ schemaVersion: 1, experienceId: 'at-the-threshold', contentVersion: 'threshold-1', openingThought: 'my old note', entries: {} })
  await page.addInitScript(([key, value]) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(key, value)
      sessionStorage.setItem('seeded', '1')
    }
  }, [KEY, v1])
  await page.goto('./#/encounter/reading')
  await expect(page.getByRole('alert')).toContainText('Saved work could not be opened')
  await expect(page.getByRole('alert')).toContainText('format version 1')
  await page.getByRole('radio', { name: 'Ask for the passage to be repeated.' }).check()
  await page.waitForTimeout(600)
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe(v1)
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download the stored data' }).click()])
  expect(await readFile(await download.path(), 'utf8')).toBe(v1)
  await page.getByRole('button', { name: 'Begin fresh…' }).click()
  await page.getByRole('button', { name: 'Begin fresh and replace stored data' }).click()
  await saved(page)
  expect((await stored(page)).entries.reading.choiceId).toBe('repeat')
})

test('malformed stored data is not overwritten', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '{"schemaVersion": 2, broken'), KEY)
  await page.goto('./#/encounter/letter')
  await expect(page.getByRole('alert')).toContainText('not valid JSON')
  await page.getByRole('radio', { name: 'Offer hospitality immediately.' }).check()
  await page.waitForTimeout(600)
  expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBe('{"schemaVersion": 2, broken')
})

test('backup import validates before replacing; reset can be cancelled; legacy key untouched', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('house-evidence')) localStorage.setItem('house-evidence', '["meal"]')
  })
  await page.goto('./#/encounter/meal')
  await page.getByRole('radio', { name: 'Begin and reserve food for those absent.' }).check()
  await page.goto('./#/notebook')
  await expect(page.locator('main')).toContainText('Begin and reserve food for those absent.')

  const bad = testInfo.outputPath('bad.json')
  await writeFile(bad, JSON.stringify({ experienceId: 'something-else' }))
  await page.getByLabel(/Restore backup/).setInputFiles(bad)
  await expect(page.locator('.restore')).toContainText('different activity. Nothing was changed.')

  const [backupDownload] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download backup' }).click()])
  const backup = JSON.parse(await readFile(await backupDownload.path(), 'utf8'))
  backup.entries.meal.choiceId = 'wait'
  const good = testInfo.outputPath('good.json')
  await writeFile(good, JSON.stringify(backup))
  await page.getByLabel(/Restore backup/).setInputFiles(good)
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.locator('main')).toContainText('Begin and reserve food for those absent.')
  await page.getByLabel(/Restore backup/).setInputFiles(good)
  await page.getByRole('button', { name: 'Replace with backup' }).click()
  await expect(page.locator('main')).toContainText('Wait for those who have not arrived.')

  await page.getByRole('button', { name: 'Start over…' }).click()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.locator('main')).toContainText('Wait for those who have not arrived.')
  await page.getByRole('button', { name: 'Start over…' }).click()
  await page.getByRole('button', { name: 'Delete and start over' }).click()
  await expect(page.locator('.reset')).toContainText('Everything was deleted')
  await page.reload()
  await expect(page.locator('main')).not.toContainText('Wait for those who have not arrived.')
  expect(await page.evaluate(() => localStorage.getItem('house-evidence'))).toBe('["meal"]')
})

test('a change in another tab pauses saving here', async ({ context }) => {
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort())
  const a = await context.newPage()
  await a.goto('./#/encounter/reading')
  // Let tab A save its visit first, so tab B opens on the same saved state.
  await expect(a.locator('.save-status').first()).toHaveText('Saved on this browser')
  const b = await context.newPage()
  await b.goto('./#/encounter/reading')
  await expect(b.locator('.save-status').first()).toHaveText('Saved on this browser')
  await a.getByRole('radio', { name: 'Ask for the passage to be repeated.' }).check()
  await expect(a.locator('.save-status').first()).toHaveText('Saved on this browser')
  await expect(b.getByRole('alert')).toContainText('Your work changed in another tab')
  await b.getByRole('radio', { name: 'Ask the presiding person to explain.' }).check()
  await b.waitForTimeout(600)
  expect(JSON.parse(await b.evaluate((key) => localStorage.getItem(key), KEY)).entries.reading.choiceId).toBe('repeat')
  await b.getByRole('button', { name: 'Load the saved version' }).click()
  await expect(b.getByRole('radio', { name: 'Ask for the passage to be repeated.' })).toBeChecked()
})

test('invalid routes are recoverable', async ({ page }) => {
  await page.goto('./#/encounter/unknown')
  await expect(heading(page)).toHaveText('That section was not found')
  await page.getByRole('link', { name: 'Go to the start' }).click()
  await expect(heading(page)).toContainText('At the Threshold')
})

test('descriptions only requests no images and keeps every task', async ({ page }) => {
  const images = []
  page.on('request', (request) => {
    if (request.resourceType() === 'image' && !request.url().endsWith('.svg')) images.push(request.url())
  })
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({ schemaVersion: 2, experienceId: 'at-the-threshold', contentVersion: 'threshold-2', preferences: { descriptionsOnly: true } }))
  }, KEY)
  await page.goto('./#/start')
  await expect(page.getByLabel(/Descriptions only/)).toBeChecked()
  for (const id of ['letter', 'meal', 'reading', 'diversity', 'care', 'pressure']) {
    await page.goto(`./#/encounter/${id}`)
    await expect(page.locator('.image-description-card')).toContainText('Image description')
    await expect(page.locator('main img')).toHaveCount(0)
    await page.locator('.details-list button').first().click()
    await expect(page.locator('.detail-panel')).toContainText('In the picture')
    await expect(page.locator('.frame-list .frame-question')).toHaveCount(4)
  }
  expect(images).toEqual([])
})

test('blocked images leave a description and working controls', async ({ page }) => {
  await page.route(/\.(jpg|png)$/, (route) => route.abort())
  await page.goto('./#/encounter/care')
  await expect(page.locator('.image-failed')).toContainText('The image could not load')
  await expect(page.locator('.image-description-card')).toContainText('An adult on the left holds bread')
  await page.locator('.details-list').getByRole('button', { name: /The dish of coins/ }).click()
  await expect(page.locator('.detail-panel')).toContainText('Justin describes money and goods')
  await page.getByRole('radio', { name: 'Divide the help between both requests.' }).check()
  await page.getByRole('button', { name: 'See a response' }).click()
  await expect(page.locator('.response').first()).toContainText('insufficiently met')
})

test('keyboard-only path: hotspot, lens, image dialog, decision, and focus on navigation', async ({ page }) => {
  await page.goto('./#/encounter/letter')
  const marker = page.getByRole('button', { name: 'Detail 1: The sealed roll' })
  await marker.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.detail-panel')).toContainText('Paul commends Phoebe')
  await page.getByRole('button', { name: 'A traveler' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.detail-panel')).toContainText('Everything depends on this roll.')

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
  await expect(page.getByRole('button', { name: 'See a response' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('.response').first()).toContainText('someone must provide the time, space, and work')
  await page.getByRole('link', { name: /^Next: E2/ }).focus()
  await page.keyboard.press('Enter')
  await expect(heading(page)).toBeFocused()
})

test('320px wide layout has no horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  for (const hash of ['#/start', '#/encounter/meal', '#/encounter/diversity', '#/notebook', '#/closing']) {
    await page.goto(`./${hash}`)
    await expect(heading(page)).toBeVisible()
    expect(await overflow(), hash).toBeLessThanOrEqual(0)
  }
  await page.goto('./#/encounter/meal')
  await page.getByRole('button', { name: 'What’s outside this picture?' }).click()
  await page.getByRole('button', { name: 'Who is still on the way?' }).click()
  await page.getByRole('button', { name: 'See a response' }).click()
  expect(await overflow()).toBeLessThanOrEqual(0)
})

test('offline packet opens from file:// without network requests and holds all interactions', async ({ page }) => {
  const external = []
  page.on('request', (request) => {
    if (!request.url().startsWith('file:')) external.push(request.url())
  })
  await page.goto(pathToFileURL(join(dist, 'experience-packet.html')).href)
  await expect(page.locator('h1')).toHaveText('At the Threshold: Belonging in an Early Christian Gathering')
  await expect(page.locator('section.encounter')).toHaveCount(7)
  const body = page.locator('body')
  await expect(body).toContainText('Detail 2: The full table')
  await expect(body).toContainText('Who cooked and served?')
  await expect(body).toContainText('Then the person who must leave may miss the meal.')
  await expect(body).toContainText('How a historian might sort these')
  await expect(body).toContainText('Pliny and Trajan, Letters 10.96–97')
  expect(external).toEqual([])
})

test('no-JavaScript visitors get the packet link', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort())
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4173/')
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
    await expect(page.locator('.pic img')).toHaveJSProperty('complete', true)
    expect(await page.locator('.pic img').evaluate((img) => img.naturalWidth)).toBeGreaterThan(0)
    await page.reload()
    await expect(heading(page)).toHaveText('A shared table, an uneven welcome')
    await page.goto(`${base}experience-packet.html`)
    await expect(page.locator('h1')).toContainText('At the Threshold')
    expect(failed).toEqual([])
  } finally {
    server.close()
  }
})

test('initial transfer for the first picture stays within budget', async ({ page }) => {
  const sizes = []
  const urls = []
  page.on('requestfinished', async (request) => {
    const response = await request.response()
    const body = response ? await response.body().catch(() => Buffer.alloc(0)) : Buffer.alloc(0)
    sizes.push(body.length)
    urls.push(request.url())
  })
  await page.goto('./#/encounter/letter')
  await expect(page.locator('.pic img')).toHaveJSProperty('complete', true)
  await page.waitForLoadState('networkidle')
  const total = sizes.reduce((a, b) => a + b, 0)
  console.log(`initial route (fonts excluded): ${urls.length} requests, ${(total / 1024).toFixed(1)} KiB uncompressed\n  ${urls.join('\n  ')}`)
  expect(urls.some((url) => /\.(glb|mp4|png)$/.test(url) || url.includes('three'))).toBe(false)
  expect(total).toBeLessThan(1.5 * 1024 * 1024)
})

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pagesFile = path.join(projectRoot, 'src', 'pages.json')
const pagesRoot = path.join(projectRoot, 'src', 'pages')
const pagesConfig = JSON.parse(fs.readFileSync(pagesFile, 'utf8'))

assert.equal(Array.isArray(pagesConfig.pages), true, 'pages.json must contain a pages array')

const configuredPages = pagesConfig.pages.map((page) => page.path).sort()
const duplicatePages = configuredPages.filter((page, index) => page === configuredPages[index - 1])
assert.deepEqual(duplicatePages, [], 'pages.json contains duplicate routes')

const listVuePages = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const entryPath = path.join(directory, entry.name)
  if (entry.isDirectory()) return listVuePages(entryPath)
  if (!entry.isFile() || !entry.name.endsWith('.vue')) return []
  return [path.relative(path.join(projectRoot, 'src'), entryPath).replaceAll(path.sep, '/').replace(/\.vue$/, '')]
})

const sourcePages = listVuePages(pagesRoot).sort()
assert.deepEqual(configuredPages, sourcePages, 'pages.json routes and src/pages Vue files must match')

const tabPages = (pagesConfig.tabBar && pagesConfig.tabBar.list ? pagesConfig.tabBar.list : [])
  .map((item) => item.pagePath)
assert.equal(tabPages.length, 5, 'buyer app must expose five primary tabs')
for (const tabPage of tabPages) {
  assert.equal(configuredPages.includes(tabPage), true, `tab route is not registered: ${tabPage}`)
}

const mobilePagesUrl = pathToFileURL(path.join(projectRoot, 'src', 'common', 'mobilePages.js')).href
const { pageRoutes, tabRoutes } = await import(mobilePagesUrl)
const adapterRoutes = Object.values(pageRoutes).map((route) => route.replace(/^\//, '')).sort()
assert.deepEqual(adapterRoutes, configuredPages, 'pageRoutes and pages.json must match')
assert.deepEqual(tabRoutes.map((route) => route.replace(/^\//, '')), tabPages, 'tabRoutes and pages.json must match')

const mallApiSource = fs.readFileSync(path.join(projectRoot, 'src', 'api', 'mallApi.js'), 'utf8')
assert.equal(mallApiSource.includes('/mock-complete'), false, 'mock payment endpoint must not be present')
assert.equal(/\/orders\/\$\{[^}]+\}\/pay/.test(mallApiSource), false, 'legacy order pay endpoint must not be present')

console.log(`Page contract OK: ${configuredPages.length} routes and ${tabPages.length} tabs verified`)

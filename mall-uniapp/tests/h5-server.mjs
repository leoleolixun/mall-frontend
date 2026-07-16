import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const root = new URL('../dist/build/h5/', import.meta.url).pathname
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
}

const server = createServer((request, response) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1')
  const relativePath = decodeURIComponent(url.pathname).replace(/^\/mobile\/?/, '') || 'index.html'
  const normalizedPath = normalize(relativePath).replace(/^(\.\.[/\\])+/, '')
  let filePath = join(root, normalizedPath)

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) filePath = join(root, 'index.html')
  response.setHeader('Content-Type', contentTypes[extname(filePath)] || 'application/octet-stream')
  createReadStream(filePath)
    .on('error', () => {
      response.statusCode = 404
      response.end('Not Found')
    })
    .pipe(response)
})

server.listen(4175, '127.0.0.1', () => {
  console.log('Mall UniApp H5 test server: http://127.0.0.1:4175/mobile/')
})

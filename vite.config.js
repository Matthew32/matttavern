import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// https://vite.dev/config/
export default defineConfig({
  preview: {
    allowedHosts: ['matttavern.com']
  },
  plugins: [
    {
      name: 'posts-api',
      configureServer(server) {
        const filePath = path.resolve(process.cwd(), 'data', 'posts.json')
        const envPath = path.resolve(process.cwd(), '.env')
        let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
        let ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH
        let ADMIN_PASSWORD_SALT = process.env.ADMIN_PASSWORD_SALT
        if (!ADMIN_PASSWORD && fs.existsSync(envPath)) {
          try {
            const envText = fs.readFileSync(envPath, 'utf-8')
            const match = envText.split('\n').map(l => l.trim()).find(l => l.startsWith('ADMIN_PASSWORD='))
            if (match) {
              ADMIN_PASSWORD = match.split('=')[1]
            }
          } catch {}
        }
        if (!ADMIN_PASSWORD_HASH && fs.existsSync(envPath)) {
          try {
            const envText = fs.readFileSync(envPath, 'utf-8')
            const match = envText.split('\n').map(l => l.trim()).find(l => l.startsWith('ADMIN_PASSWORD_HASH='))
            if (match) {
              ADMIN_PASSWORD_HASH = match.split('=')[1]
            }
          } catch {}
        }
        if (!ADMIN_PASSWORD_SALT && fs.existsSync(envPath)) {
          try {
            const envText = fs.readFileSync(envPath, 'utf-8')
            const match = envText.split('\n').map(l => l.trim()).find(l => l.startsWith('ADMIN_PASSWORD_SALT='))
            if (match) {
              ADMIN_PASSWORD_SALT = match.split('=')[1]
            }
          } catch {}
        }
        const verifyPassword = (input) => {
          if (ADMIN_PASSWORD_HASH && ADMIN_PASSWORD_SALT) {
            const derived = crypto.scryptSync(String(input), String(ADMIN_PASSWORD_SALT), 64)
            const stored = Buffer.from(String(ADMIN_PASSWORD_HASH), 'hex')
            if (stored.length !== derived.length) return false
            return crypto.timingSafeEqual(stored, derived)
          }
          if (ADMIN_PASSWORD) {
            return String(input) === String(ADMIN_PASSWORD)
          }
          return false
        }
        const isAdmin = (req) => {
          const c = req.headers.cookie || ''
          return c.includes('admin=1')
        }
        server.middlewares.use('/api/auth', (req, res, next) => {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ authenticated: isAdmin(req) }))
            return
          }
          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', () => {
              try {
                const incoming = JSON.parse(body || '{}')
                if (!ADMIN_PASSWORD && !ADMIN_PASSWORD_HASH) {
                  res.statusCode = 500
                  res.end(JSON.stringify({ error: 'Admin password not set' }))
                  return
                }
                if (verifyPassword(incoming.password)) {
                  res.setHeader('Set-Cookie', 'admin=1; Path=/; HttpOnly')
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ ok: true }))
                } else {
                  res.statusCode = 401
                  res.end(JSON.stringify({ error: 'Unauthorized' }))
                }
              } catch {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
            return
          }
          next()
        })
        const readAll = async () => {
          const raw = await fs.promises.readFile(filePath, 'utf-8').catch(() => '[]')
          return JSON.parse(raw)
        }
        const writeAll = async (arr) => {
          await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
          await fs.promises.writeFile(filePath, JSON.stringify(arr, null, 2))
        }
        const getIdFromUrl = (url = '') => {
          const parts = url.split('/').filter(Boolean)
          const last = parts[parts.length - 1]
          const n = Number(last)
          return Number.isFinite(n) ? n : null
        }
        server.middlewares.use('/api/posts', (req, res, next) => {
          if (req.method === 'GET') {
            (async () => {
              try {
                const id = getIdFromUrl(req.url)
                const arr = await readAll()
                res.setHeader('Content-Type', 'application/json')
                if (id != null) {
                  const found = arr.find(p => p.id === id)
                  if (!found) {
                    res.statusCode = 404
                    res.end(JSON.stringify({ error: 'Not found' }))
                  } else {
                    res.end(JSON.stringify(found))
                  }
                } else {
                  res.end(JSON.stringify(arr))
                }
              } catch (err) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'Failed to read posts' }))
              }
            })()
            return
          }
          if (req.method === 'POST') {
            if (!isAdmin(req)) {
              res.statusCode = 401
              res.end(JSON.stringify({ error: 'Unauthorized' }))
              return
            }
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', async () => {
              try {
                const incoming = JSON.parse(body || '{}')
                const arr = await readAll()
                const nextId = arr.length ? Math.max(...arr.map(p => p.id || 0)) + 1 : 1
                const post = {
                  id: incoming.id ?? nextId,
                  title: incoming.title || '',
                  date: incoming.date || new Date().toISOString().slice(0, 10),
                  content: incoming.content || '',
                  isHot: !!incoming.isHot,
                  published: incoming.published !== undefined ? !!incoming.published : true
                }
                arr.push(post)
                await writeAll(arr)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(post))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
            return
          }
          if (req.method === 'PUT' || req.method === 'PATCH') {
            if (!isAdmin(req)) {
              res.statusCode = 401
              res.end(JSON.stringify({ error: 'Unauthorized' }))
              return
            }
            const id = getIdFromUrl(req.url)
            if (id == null) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Missing id in URL' }))
              return
            }
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', async () => {
              try {
                const incoming = JSON.parse(body || '{}')
                const arr = await readAll()
                const idx = arr.findIndex(p => p.id === id)
                if (idx === -1) {
                  res.statusCode = 404
                  res.end(JSON.stringify({ error: 'Not found' }))
                  return
                }
                const updated = {
                  ...arr[idx],
                  title: incoming.title ?? arr[idx].title,
                  date: incoming.date ?? arr[idx].date,
                  content: incoming.content ?? arr[idx].content,
                  isHot: incoming.isHot ?? arr[idx].isHot,
                  published: incoming.published ?? arr[idx].published
                }
                arr[idx] = updated
                await writeAll(arr)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(updated))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
            return
          }
          next()
        })
      },
      configurePreviewServer(server) {
        const filePath = path.resolve(process.cwd(), 'data', 'posts.json')
        const envPath = path.resolve(process.cwd(), '.env')
        let ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
        let ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH
        let ADMIN_PASSWORD_SALT = process.env.ADMIN_PASSWORD_SALT
        if (!ADMIN_PASSWORD && fs.existsSync(envPath)) {
          try {
            const envText = fs.readFileSync(envPath, 'utf-8')
            const match = envText.split('\n').map(l => l.trim()).find(l => l.startsWith('ADMIN_PASSWORD='))
            if (match) {
              ADMIN_PASSWORD = match.split('=')[1]
            }
          } catch {}
        }
        if (!ADMIN_PASSWORD_HASH && fs.existsSync(envPath)) {
          try {
            const envText = fs.readFileSync(envPath, 'utf-8')
            const match = envText.split('\n').map(l => l.trim()).find(l => l.startsWith('ADMIN_PASSWORD_HASH='))
            if (match) {
              ADMIN_PASSWORD_HASH = match.split('=')[1]
            }
          } catch {}
        }
        if (!ADMIN_PASSWORD_SALT && fs.existsSync(envPath)) {
          try {
            const envText = fs.readFileSync(envPath, 'utf-8')
            const match = envText.split('\n').map(l => l.trim()).find(l => l.startsWith('ADMIN_PASSWORD_SALT='))
            if (match) {
              ADMIN_PASSWORD_SALT = match.split('=')[1]
            }
          } catch {}
        }
        const verifyPassword = (input) => {
          if (ADMIN_PASSWORD_HASH && ADMIN_PASSWORD_SALT) {
            const derived = crypto.scryptSync(String(input), String(ADMIN_PASSWORD_SALT), 64)
            const stored = Buffer.from(String(ADMIN_PASSWORD_HASH), 'hex')
            if (stored.length !== derived.length) return false
            return crypto.timingSafeEqual(stored, derived)
          }
          if (ADMIN_PASSWORD) {
            return String(input) === String(ADMIN_PASSWORD)
          }
          return false
        }
        const readAll = async () => {
          const raw = await fs.promises.readFile(filePath, 'utf-8').catch(() => '[]')
          return JSON.parse(raw)
        }
        const writeAll = async (arr) => {
          await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
          await fs.promises.writeFile(filePath, JSON.stringify(arr, null, 2))
        }
        const getIdFromUrl = (url = '') => {
          const parts = url.split('/').filter(Boolean)
          const last = parts[parts.length - 1]
          const n = Number(last)
          return Number.isFinite(n) ? n : null
        }
        const isAdmin = (req) => {
          const c = req.headers.cookie || ''
          return c.includes('admin=1')
        }
        server.middlewares.use('/api/auth', (req, res, next) => {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ authenticated: isAdmin(req) }))
            return
          }
          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', () => {
              try {
                const incoming = JSON.parse(body || '{}')
                if (!ADMIN_PASSWORD && !ADMIN_PASSWORD_HASH) {
                  res.statusCode = 500
                  res.end(JSON.stringify({ error: 'Admin password not set' }))
                  return
                }
                if (verifyPassword(incoming.password)) {
                  res.setHeader('Set-Cookie', 'admin=1; Path=/; HttpOnly')
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ ok: true }))
                } else {
                  res.statusCode = 401
                  res.end(JSON.stringify({ error: 'Unauthorized' }))
                }
              } catch {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
            return
          }
          next()
        })
        server.middlewares.use('/api/posts', (req, res, next) => {
          if (req.method === 'GET') {
            (async () => {
              try {
                const id = getIdFromUrl(req.url)
                const arr = await readAll()
                res.setHeader('Content-Type', 'application/json')
                if (id != null) {
                  const found = arr.find(p => p.id === id)
                  if (!found) {
                    res.statusCode = 404
                    res.end(JSON.stringify({ error: 'Not found' }))
                  } else {
                    res.end(JSON.stringify(found))
                  }
                } else {
                  res.end(JSON.stringify(arr))
                }
              } catch (err) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'Failed to read posts' }))
              }
            })()
            return
          }
          if (req.method === 'POST') {
            if (!isAdmin(req)) {
              res.statusCode = 401
              res.end(JSON.stringify({ error: 'Unauthorized' }))
              return
            }
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', async () => {
              try {
                const incoming = JSON.parse(body || '{}')
                const arr = await readAll()
                const nextId = arr.length ? Math.max(...arr.map(p => p.id || 0)) + 1 : 1
                const post = {
                  id: incoming.id ?? nextId,
                  title: incoming.title || '',
                  date: incoming.date || new Date().toISOString().slice(0, 10),
                  content: incoming.content || '',
                  isHot: !!incoming.isHot,
                  published: incoming.published !== undefined ? !!incoming.published : true
                }
                arr.push(post)
                await writeAll(arr)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(post))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
            return
          }
          if (req.method === 'PUT' || req.method === 'PATCH') {
            if (!isAdmin(req)) {
              res.statusCode = 401
              res.end(JSON.stringify({ error: 'Unauthorized' }))
              return
            }
            const id = getIdFromUrl(req.url)
            if (id == null) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Missing id in URL' }))
              return
            }
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', async () => {
              try {
                const incoming = JSON.parse(body || '{}')
                const arr = await readAll()
                const idx = arr.findIndex(p => p.id === id)
                if (idx === -1) {
                  res.statusCode = 404
                  res.end(JSON.stringify({ error: 'Not found' }))
                  return
                }
                const updated = {
                  ...arr[idx],
                  title: incoming.title ?? arr[idx].title,
                  date: incoming.date ?? arr[idx].date,
                  content: incoming.content ?? arr[idx].content,
                  isHot: incoming.isHot ?? arr[idx].isHot,
                  published: incoming.published ?? arr[idx].published
                }
                arr[idx] = updated
                await writeAll(arr)
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(updated))
              } catch (e) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid JSON' }))
              }
            })
            return
          }
          next()
        })
      }
    },
    react()
  ],
})

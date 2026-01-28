import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const Layout = styled.div`
  display: flex;
  height: 100%;
  background-color: white;
  font-family: 'Verdana', sans-serif;
`

const Sidebar = styled.div`
  width: 240px;
  background-color: #f5f5f5;
  border-right: 1px solid #ddd;
  padding: 10px;
  overflow-y: auto;
`

const SidebarTitle = styled.h3`
  font-size: 14px;
  margin: 0 0 10px 0;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 6px;
`

const PostItem = styled.div`
  padding: 8px 10px;
  cursor: pointer;
  font-size: 12px;
  color: #333;
  border: 1px solid transparent;
  border-radius: 4px;
  margin-bottom: 6px;
  background-color: ${props => props.$active ? '#fff' : 'transparent'};
  border-color: ${props => props.$active ? '#ccc' : 'transparent'};

  &:hover {
    background-color: #fff;
    border-color: #ddd;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  width: 100%;
`

const Label = styled.label`
  font-size: 12px;
  color: #333;
`

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
`

const TextArea = styled.textarea`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 12px;
  min-height: 160px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Button = styled.button`
  padding: 10px 16px;
  background-color: #3C81F3;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  font-size: 12px;
`

const Status = styled.div`
  font-size: 12px;
  color: #0055EA;
`

const AdminPanel = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [content, setContent] = useState('')
  const [isHot, setIsHot] = useState(false)
  const [published, setPublished] = useState(true)
  const [status, setStatus] = useState('')
  const [posts, setPosts] = useState([])
  const [editingId, setEditingId] = useState(null)

  const loadPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch {
      setPosts([])
    }
  }

  useEffect(() => {
    fetch('/api/auth')
      .then(r => r.json())
      .then(d => {
        const ok = !!d.authenticated
        setAuthenticated(ok)
        if (ok) loadPosts()
      })
      .catch(() => setAuthenticated(false))
  }, [])

  const submitLogin = async (e) => {
    e.preventDefault()
    setStatus('Checking...')
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      if (!r.ok) {
        setStatus('Wrong password')
        return
      }
      setAuthenticated(true)
      setStatus('Logged in')
      loadPosts()
    } catch {
      setStatus('Login failed')
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('Saving...')
    try {
      const body = {
        title,
        date,
        content,
        isHot,
        published
      }
      const url = editingId ? `/api/posts/${editingId}` : '/api/posts'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error('Failed to save')
      const saved = await res.json()
      setStatus(editingId ? `Updated: ${saved.title}` : `Saved: ${saved.title}`)
      setEditingId(saved.id ?? null)
      await loadPosts()
    } catch (err) {
      setStatus('Error saving post')
    }
  }

  const startNew = () => {
    setEditingId(null)
    setTitle('')
    setDate(new Date().toISOString().slice(0, 10))
    setContent('')
    setIsHot(false)
    setPublished(true)
    setStatus('')
  }

  const selectPost = (p) => {
    setEditingId(p.id)
    setTitle(p.title || '')
    setDate(p.date || new Date().toISOString().slice(0, 10))
    setContent(p.content || '')
    setIsHot(!!p.isHot)
    setPublished(p.published !== false)
    setStatus(`Editing: ${p.title}`)
  }

  return (
    <Layout>
      {!authenticated ? (
        <Form onSubmit={submitLogin}>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <Row>
            <Button type="submit">Login</Button>
            <Status>{status}</Status>
          </Row>
        </Form>
      ) : (
        <>
          <Sidebar>
            <SidebarTitle>Posts</SidebarTitle>
            <PostItem onClick={startNew} $active={editingId === null}>+ New Post</PostItem>
            {posts.map(p => (
              <PostItem key={p.id} onClick={() => selectPost(p)} $active={editingId === p.id}>
                {p.isHot && <span style={{color: 'red', fontWeight: 'bold'}}>🔥 </span>}
                {p.title}
              </PostItem>
            ))}
          </Sidebar>
          <Form onSubmit={onSubmit}>
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />

            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />

            <Label>Content (HTML supported)</Label>
            <TextArea value={content} onChange={e => setContent(e.target.value)} />

            <Row>
              <input type="checkbox" checked={isHot} onChange={e => setIsHot(e.target.checked)} id="hot" />
          <Label htmlFor="hot">Mark as Hot</Label>
        </Row>

        <Row>
          <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} id="published" />
          <Label htmlFor="published">Published</Label>
        </Row>

        <Row>
          <Button type="submit">{editingId ? 'Save Changes' : 'Save Post'}</Button>
          <Button type="button" onClick={startNew} style={{ backgroundColor: '#8D6E63' }}>New</Button>
          <Status>{status}</Status>
        </Row>
          </Form>
        </>
      )}
    </Layout>
  )
}

export default AdminPanel

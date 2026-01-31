import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const BlogLayout = styled.div`
  display: flex;
  height: ${props => props.$fullPage ? '100vh' : '100%'};
  min-height: 0;
  font-family: 'Verdana', sans-serif;
  background-color: white;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #f0f0f0;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: 10px;
  /* Triangle corners (chamfered) on the left side */
  clip-path: polygon(
    20px 0, 100% 0, 
    100% 100%, 20px 100%, 
    0 calc(100% - 20px), 0 20px
  );
  padding-left: 25px; /* Add padding to avoid content being cut */
`;

const SidebarTitle = styled.h3`
  font-size: 14px;
  color: #333;
  border-bottom: 2px solid #0055EA;
  padding-bottom: 5px;
  margin-top: 0;
  margin-bottom: 10px;
`;

const ArticleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ArticleItem = styled.div`
  padding: 10px;
  background-color: ${props => props.$active ? '#fff' : 'transparent'};
  border: 1px solid ${props => props.$active ? '#ccc' : 'transparent'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: ${props => props.$active ? '#000' : '#444'};
  
  &:hover {
    background-color: white;
    border-color: #ddd;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  min-height: 0;
  overflow-y: auto;
  background-color: white;
`;

const MainTitle = styled.h1`
  color: #0055EA;
  margin-top: 0;
  font-size: 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
`;

const MainMeta = styled.div`
  color: #888;
  font-size: 12px;
  margin-bottom: 20px;
`;

const MainBody = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #333;
`;

const Placeholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-style: italic;
`;

const Blog = ({ fullPage = false }) => {
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const selectedPost = posts.find(p => p.id === selectedPostId);
  const visiblePosts = posts.filter(p => p.published !== false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/posts')
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : [];
        setPosts(arr);
        const first = arr.find(p => p.published !== false);
        setSelectedPostId(first ? first.id : null);
      })
      .catch(() => {
        if (!mounted) return;
        setPosts([]);
        setSelectedPostId(null);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (fullPage) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'auto';
      return () => { document.body.style.overflow = prev || 'hidden'; };
    }
  }, [fullPage]);

  return (
    <BlogLayout $fullPage={fullPage}>
      <Sidebar>
        <SidebarTitle>Top Articles</SidebarTitle>
        <ArticleList>
          {visiblePosts.map(post => (
            <ArticleItem 
              key={post.id} 
              onClick={() => setSelectedPostId(post.id)}
              $active={selectedPostId === post.id}
            >
              {post.isHot && <span style={{color: 'red', fontWeight: 'bold'}}>🔥 </span>}
              {post.title}
            </ArticleItem>
          ))}
        </ArticleList>
      </Sidebar>
      
      <MainContent>
        {selectedPost ? (
          <>
            <MainTitle>{selectedPost.title}</MainTitle>
            <MainMeta>Posted on {selectedPost.date}</MainMeta>
            <MainBody dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
          </>
        ) : (
          <Placeholder>Select an article to read...</Placeholder>
        )}
      </MainContent>
    </BlogLayout>
  );
};

export default Blog;

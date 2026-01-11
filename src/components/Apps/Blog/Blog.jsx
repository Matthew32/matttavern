import React, { useState } from 'react';
import styled from 'styled-components';

const BlogLayout = styled.div`
  display: flex;
  height: 100%;
  font-family: 'Verdana', sans-serif;
  background-color: white;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #f0f0f0;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
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

const Blog = () => {
  const posts = [
    { 
      id: 1, 
      title: 'Welcome to my Portfolio', 
      date: '2023-10-27', 
      content: `
        <p>This is a portfolio styled like Windows XP. I built this using React and styled-components.</p>
        <p>The goal was to recreate the nostalgic feeling of the early 2000s web and operating systems.</p>
        <p>Feel free to look around!</p>
      `,
      isHot: true
    },
    { 
      id: 2, 
      title: 'Why Windows XP?', 
      date: '2023-10-28', 
      content: `
        <p>It is nostalgic and fun to recreate old UIs with modern web technologies.</p>
        <p>Windows XP had a very distinct "Luna" theme that defined an era of computing for many of us.</p>
      `,
      isHot: true
    },
    { 
      id: 3, 
      title: 'Project Update: Blog App', 
      date: '2023-10-29', 
      content: `
        <p>Added a blog app to the desktop environment.</p>
        <p>This app demonstrates how we can have nested layouts within our "windowed" operating system simulation.</p>
      `,
      isHot: false
    },
    {
      id: 4,
      title: 'React Hooks Deep Dive',
      date: '2023-11-05',
      content: `
        <p>Understanding useEffect and useState is crucial for modern React development.</p>
        <p>Let's explore how closure staleness affects your hooks...</p>
      `,
      isHot: true
    },
    {
      id: 5,
      title: 'CSS-in-JS vs CSS Modules',
      date: '2023-11-12',
      content: `
        <p>There are many ways to style React apps. In this project, I used styled-components for its dynamic props capabilities.</p>
      `,
      isHot: false
    }
  ];

  // Default to the first post or null
  const [selectedPostId, setSelectedPostId] = useState(posts[0].id);

  const selectedPost = posts.find(p => p.id === selectedPostId);

  // Filter for "Hot" or just show all sorted by some metric? 
  // User asked for "top/hot articles". Let's assume all here are "articles" but we can group them.
  // For now, I'll list all, maybe highlighting Hot ones or just list them all in the sidebar as requested.
  // User said "left side to show all the top/hot articles". I'll list them all there.

  return (
    <BlogLayout>
      <Sidebar>
        <SidebarTitle>Top Articles</SidebarTitle>
        <ArticleList>
          {posts.map(post => (
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

import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  background-color: white;
  height: 100%;
  font-family: 'Verdana', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #003399;
  margin-bottom: 20px;
  font-weight: normal;
  font-style: italic;
`;

const Text = styled.p`
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 30px;
  max-width: 400px;
`;

const LinkButton = styled.a`
  display: inline-block;
  padding: 10px 20px;
  background: linear-gradient(180deg, #3C8310 0%, #70C540 100%);
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  font-size: 16px;
  border: 1px solid #3C8310;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
  cursor: pointer;

  &:hover {
    filter: brightness(1.1);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 1px 1px 3px rgba(0,0,0,0.2);
  }
`;

const Presentation = () => {
  return (
    <Container>
      <Title>Welcome to My Portfolio</Title>
      <Text>
        Hi, I'm Matt! This is my retro Windows XP-style portfolio.
        Feel free to explore the desktop environment, open applications, and drag windows around.
        <br /><br />
        I also write about my development journey. Check out my blog!
      </Text>
      <LinkButton href="/blog" target="_blank" rel="noopener noreferrer">
        Visit My Blog ➜
      </LinkButton>
    </Container>
  );
};

export default Presentation;

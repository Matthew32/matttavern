import React from 'react';
import styled from 'styled-components';

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin: 10px;
  cursor: pointer;
  border: 1px solid transparent;

  &:hover {
    background-color: rgba(11, 97, 255, 0.2);
    border: 1px solid rgba(11, 97, 255, 0.4);
    border-radius: 3px;
  }
`;

const IconImage = styled.div`
  width: 48px;
  height: 48px;
  background-color: ${props => props.color || '#ddd'};
  margin-bottom: 5px;
  border-radius: 4px; /* Just a placeholder shape */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const IconLabel = styled.div`
  color: white;
  text-align: center;
  font-size: 11px;
  text-shadow: 1px 1px 1px black;
  line-height: 1.2;
`;

const DesktopIcon = ({ label, icon, color, onClick }) => {
  return (
    <IconWrapper onClick={onClick}>
      <IconImage color={color}>{icon}</IconImage>
      <IconLabel>{label}</IconLabel>
    </IconWrapper>
  );
};

export default DesktopIcon;

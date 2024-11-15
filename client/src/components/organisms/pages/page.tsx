// Page.tsx
import React from 'react';
import styled from 'styled-components';

// Define A4 size in pixels at 96 DPI
const A4_WIDTH_PX = 794; // 210mm
const A4_HEIGHT_PX = 1123; // 297mm

interface PageProps {
  orientation: 'portrait' | 'landscape';
  margin: number; // in pixels
  children: React.ReactNode;
}

const StyledPage = styled.div<{ orientation: string; margin: number }>`
  width: ${(props) =>
    props.orientation === 'portrait' ? `${A4_WIDTH_PX}px` : `${A4_HEIGHT_PX}px`};
  height: ${(props) =>
    props.orientation === 'portrait' ? `${A4_HEIGHT_PX}px` : `${A4_WIDTH_PX}px`};
  margin: ${(props) => props.margin}px auto;
  padding-top: ${(props) => props.margin}px;
  padding-bottom: ${(props) => props.margin}px;
  padding-left: ${(props) => props.margin}px;
  padding-right: ${(props) => props.margin}px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  position: relative;
  overflow: hidden;
  
  /* Page break for printing */
  page-break-after: always;
`;

const Header = styled.div`
  position: absolute;
  top: ${(props) => props.theme.margin}px;
  left: ${(props) => props.theme.margin}px;
  right: ${(props) => props.theme.margin}px;
  height: 50px;
  border-bottom: 1px solid #ccc;
`;

const Footer = styled.div`
  position: absolute;
  bottom: ${(props) => props.theme.margin}px;
  left: ${(props) => props.theme.margin}px;
  right: ${(props) => props.theme.margin}px;
  height: 50px;
  border-top: 1px solid #ccc;
`;

const Content = styled.div`
  padding-top: 60px; /* Height of Header + space */
  padding-bottom: 60px; /* Height of Footer + space */
  height: calc(100% - 120px); /* Total padding */
  overflow: hidden;
`;

const Page: React.FC<PageProps> = ({ orientation, margin, children }) => {
  return (
    <StyledPage orientation={orientation} margin={margin}>
      <Header>Header Content</Header>
      <Content>{children}</Content>
      <Footer>Footer Content</Footer>
    </StyledPage>
  );
};

export default Page;
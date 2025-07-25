import React from 'react';
import { Container } from 'react-bootstrap';
import NavigationBar from './NavigationBar';

const Layout = ({ children }) => {
  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        {children}
      </Container>
    </>
  );
};

export default Layout;

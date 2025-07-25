import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faFileInvoiceDollar,
  faCar,
  faUsers,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons';

const NavigationBar = () => {
  return (
    <Navbar bg="light" variant="light" expand="lg" className="custom-navbar shadow-sm">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Alquileres App</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/dashboard">
              <Nav.Link><FontAwesomeIcon icon={faTachometerAlt} className="me-2" />Dashboard</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/alquileres">
              <Nav.Link><FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />Alquileres</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/autos">
              <Nav.Link><FontAwesomeIcon icon={faCar} className="me-2" />Autos</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/clientes">
              <Nav.Link><FontAwesomeIcon icon={faUsers} className="me-2" />Clientes</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/empleados">
              <Nav.Link><FontAwesomeIcon icon={faUserTie} className="me-2" />Empleados</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
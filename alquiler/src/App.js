import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Autos from './pages/Autos';
import Alquileres from './pages/Alquileres';
import Empleados from './pages/Empleados';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/autos" element={<Autos />} />
          <Route path="/alquileres" element={<Alquileres />} />
          <Route path="/empleados" element={<Empleados />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

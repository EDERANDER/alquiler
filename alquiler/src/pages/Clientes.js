import React, { useState, useEffect } from 'react';
import clienteService from '../services/clienteService';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [currentClient, setCurrentClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para el formulario de cliente
  const [formDni, setFormDni] = useState('');
  const [formNombres, setFormNombres] = useState('');
  const [formApellidos, setFormApellidos] = useState('');
  const [formDireccion, setFormDireccion] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formEmail, setFormEmail] = useState('');

  // Estados para la búsqueda de cliente por API
  const [tipoDocumento, setTipoDocumento] = useState('boleta'); // 'boleta' para DNI, 'factura' para RUC
  const [clienteNumDoc, setClienteNumDoc] = useState('');
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = () => {
    clienteService.getAll()
      .then(response => {
        setClientes(response.data);
      })
      .catch(error => {
        console.error("Error fetching clients:", error);
      });
  };

  const handleAdd = () => {
    setCurrentClient(null);
    setFormDni('');
    setFormNombres('');
    setFormApellidos('');
    setFormDireccion('');
    setFormTelefono('');
    setFormEmail('');
    setClienteNumDoc(''); // Limpiar campo de búsqueda
    setTipoDocumento('boleta'); // Resetear tipo de documento
    setErrorBusqueda(''); // Limpiar errores de búsqueda
    setShowModal(true);
  };

  const handleEdit = (client) => {
    setCurrentClient(client);
    setFormDni(client.dni);
    setFormNombres(client.nombres);
    setFormApellidos(client.apellidos);
    setFormDireccion(client.direccion);
    setFormTelefono(client.telefono);
    setFormEmail(client.email);
    setClienteNumDoc(client.dni); // Precargar DNI para posible re-búsqueda
    setTipoDocumento(client.dni.length === 8 ? 'boleta' : 'factura'); // Asumir tipo de documento
    setErrorBusqueda('');
    setShowModal(true);
  };

  const handleDelete = (client) => {
    setClientToDelete(client);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    clienteService.remove(clientToDelete.dni)
      .then(() => {
        fetchClientes();
        setShowDeleteConfirm(false);
        setClientToDelete(null);
      })
      .catch(error => {
        console.error("Error deleting client:", error);
      });
  };

  const handleSave = (event) => {
    event.preventDefault();
    const data = {
      dni: formDni,
      nombres: formNombres,
      apellidos: formApellidos,
      direccion: formDireccion,
      telefono: formTelefono,
      email: formEmail,
    };

    if (currentClient) {
      clienteService.update(currentClient.dni, data)
        .then(() => {
          fetchClientes();
          setShowModal(false);
        })
        .catch(error => {
          console.error("Error updating client:", error);
        });
    } else {
      clienteService.create(data)
        .then(() => {
          fetchClientes();
          setShowModal(false);
        })
        .catch(error => {
          console.error("Error creating client:", error);
        });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentClient(null);
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setClientToDelete(null);
  };

  const buscarCliente = async () => {
    if (!clienteNumDoc) {
      setErrorBusqueda("Ingrese un número de documento");
      return;
    }
  
    // Validar longitud del documento
    if (tipoDocumento === "boleta" && clienteNumDoc.length !== 8) {
      setErrorBusqueda("El DNI debe tener 8 dígitos");
      return;
    }
  
    if (tipoDocumento === "factura" && clienteNumDoc.length !== 11) {
      setErrorBusqueda("El RUC debe tener 11 dígitos");
      return;
    }
  
    setBuscandoCliente(true);
    setErrorBusqueda("");
  
    try {
      const tipo = tipoDocumento === "boleta" ? "dni" : "ruc";
      const url = `https://api.factiliza.com/v1/${tipo}/info/${clienteNumDoc}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzODg0MiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6ImNvbnN1bHRvciJ9.4m1S0AkEpql3vBmLHjoZZWVNZ3zqMgVgQ1JtrRjcTk8"
        }
      });
  
      const data = await response.json();
  
      if (data.success) {
        setFormDni(clienteNumDoc); // Siempre establecer el DNI/RUC buscado
        if (tipoDocumento === "boleta") {
          // Para DNI
          setFormNombres(data.data.nombres || '');
          setFormApellidos(`${data.data.apellido_paterno || ''} ${data.data.apellido_materno || ''}`.trim());
          setFormDireccion(data.data.direccion_completa || data.data.direccion || '');
        } else {
          // Para RUC
          setFormNombres(data.data.nombre_o_razon_social || ''); // Usar razón social como nombre
          setFormApellidos(''); // RUC no tiene apellidos
          setFormDireccion(data.data.direccion_completa || data.data.direccion || '');
        }
        setFormEmail(''); // No se obtiene de la API, se deja vacío o se mantiene el existente
        setFormTelefono(''); // No se obtiene de la API, se deja vacío o se mantiene el existente

      } else {
        setFormNombres('');
        setFormApellidos('');
        setFormDireccion('');
        setFormTelefono('');
        setFormEmail('');
        setErrorBusqueda(data.message || "No se encontraron resultados");
      }
    } catch (error) {
      setFormNombres('');
      setFormApellidos('');
      setFormDireccion('');
      setFormTelefono('');
      setFormEmail('');
      setErrorBusqueda("Error al consultar la API");
      console.error("Error:", error);
    } finally {
      setBuscandoCliente(false);
    }
  };

  const filteredClientes = clientes.filter(client =>
    client.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.dni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="mb-4">Gestión de Clientes</h1>
      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={handleAdd}>Agregar Cliente</Button>
        <Form.Group controlId="searchTerm">
          <Form.Control
            type="text"
            placeholder="Buscar por nombre, apellido o DNI"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>
      </div>

      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredClientes.map(client => (
            <tr key={client.dni}>
              <td>{client.dni}</td>
              <td>{client.nombres}</td>
              <td>{client.apellidos}</td>
              <td>{client.direccion}</td>
              <td>{client.telefono}</td>
              <td>{client.email}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(client)}>Editar</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(client)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para Agregar/Editar Cliente */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentClient ? 'Editar Cliente' : 'Agregar Cliente'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Documento</Form.Label>
              <Form.Select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                disabled={currentClient ? true : false} // Deshabilitar en edición
              >
                <option value="boleta">DNI</option>
                <option value="factura">RUC</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Número de Documento</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={clienteNumDoc}
                  onChange={(e) => setClienteNumDoc(e.target.value)}
                  placeholder="Ingrese DNI o RUC"
                  required
                  disabled={currentClient ? true : false}
                />
                <Button variant="outline-secondary" onClick={buscarCliente} disabled={buscandoCliente || currentClient}>
                  {buscandoCliente ? 'Buscando...' : 'Buscar'}
                </Button>
              </InputGroup>
              {errorBusqueda && <Form.Text className="text-danger">{errorBusqueda}</Form.Text>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>DNI</Form.Label>
              <Form.Control
                type="text"
                name="dni"
                value={formDni}
                onChange={(e) => setFormDni(e.target.value)}
                required
                disabled={currentClient ? true : false}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombres</Form.Label>
              <Form.Control
                type="text"
                name="nombres"
                value={formNombres}
                onChange={(e) => setFormNombres(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control
                type="text"
                name="apellidos"
                value={formApellidos}
                onChange={(e) => setFormApellidos(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="direccion"
                value={formDireccion}
                onChange={(e) => setFormDireccion(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="telefono"
                value={formTelefono}
                onChange={(e) => setFormTelefono(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cerrar</Button>
            <Button variant="primary" type="submit">Guardar Cambios</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showDeleteConfirm} onHide={handleCloseDeleteConfirm}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar al cliente <strong>{clientToDelete?.nombres} {clientToDelete?.apellidos}</strong> con DNI <strong>{clientToDelete?.dni}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteConfirm}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Clientes;
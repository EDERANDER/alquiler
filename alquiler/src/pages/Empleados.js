import React, { useState, useEffect } from 'react';
import empleadoService from '../services/empleadoService';
import { Modal, Button, Form } from 'react-bootstrap';

function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [currentEmpleado, setCurrentEmpleado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [empleadoToDelete, setEmpleadoToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Nuevos estados para el formulario de empleado
  const [formNombres, setFormNombres] = useState('');
  const [formApellidos, setFormApellidos] = useState('');
  const [formCargo, setFormCargo] = useState('Empleado Turno Mañana'); // Valor por defecto

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = () => {
    empleadoService.getAll()
      .then(response => {
        setEmpleados(response.data);
      })
      .catch(error => {
        console.error("Error fetching employees:", error);
      });
  };

  const handleAdd = () => {
    setCurrentEmpleado(null);
    setFormNombres('');
    setFormApellidos('');
    setFormCargo('Empleado Turno Mañana'); // Resetear a valor por defecto
    setShowModal(true);
  };

  const handleEdit = (empleado) => {
    setCurrentEmpleado(empleado);
    setFormNombres(empleado.nombres);
    setFormApellidos(empleado.apellidos);
    setFormCargo(empleado.cargo);
    setShowModal(true);
  };

  const handleDelete = (empleado) => {
    setEmpleadoToDelete(empleado);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    empleadoService.remove(empleadoToDelete.id_empleado)
      .then(() => {
        fetchEmpleados();
        setShowDeleteConfirm(false);
        setEmpleadoToDelete(null);
      })
      .catch(error => {
        console.error("Error deleting employee:", error);
      });
  };

  const handleSave = (event) => {
    event.preventDefault();
    const data = {
      nombres: formNombres,
      apellidos: formApellidos,
      cargo: formCargo,
    };

    if (currentEmpleado) {
      empleadoService.update(currentEmpleado.id_empleado, data)
        .then(() => {
          fetchEmpleados();
          setShowModal(false);
        })
        .catch(error => {
          console.error("Error updating employee:", error);
        });
    } else {
      empleadoService.create(data)
        .then(() => {
          fetchEmpleados();
          setShowModal(false);
        })
        .catch(error => {
          console.error("Error creating employee:", error);
        });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentEmpleado(null);
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setEmpleadoToDelete(null);
  };

  const filteredEmpleados = empleados.filter(empleado =>
    (empleado.nombres && empleado.nombres.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (empleado.apellidos && empleado.apellidos.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (empleado.cargo && empleado.cargo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <h1 className="mb-4">Gestión de Empleados</h1>
      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={handleAdd}>Agregar Empleado</Button>
        <Form.Group controlId="searchTerm">
          <Form.Control
            type="text"
            placeholder="Buscar por nombre, apellido o cargo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>
      </div>

      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Cargo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmpleados.map(empleado => (
            <tr key={empleado.id_empleado}>
              <td>{empleado.id_empleado}</td>
              <td>{empleado.nombres}</td>
              <td>{empleado.apellidos}</td>
              <td>{empleado.cargo}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(empleado)}>Editar</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(empleado)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para Agregar/Editar Empleado */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentEmpleado ? 'Editar Empleado' : 'Agregar Empleado'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
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
              <Form.Label>Cargo</Form.Label>
              <Form.Select
                name="cargo"
                value={formCargo}
                onChange={(e) => setFormCargo(e.target.value)}
                required
              >
                <option value="Empleado Turno Mañana">Empleado Turno Mañana</option>
                <option value="Empleado Turno Tarde">Empleado Turno Tarde</option>
              </Form.Select>
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
          ¿Estás seguro de que deseas eliminar al empleado <strong>{empleadoToDelete?.nombres} {empleadoToDelete?.apellidos}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteConfirm}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Empleados;

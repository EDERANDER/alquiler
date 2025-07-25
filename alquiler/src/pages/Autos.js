import React, { useState, useEffect, useCallback } from 'react';
import autoService from '../services/autoService';
import { Modal, Button, Form } from 'react-bootstrap';

function Autos() {
  const [autos, setAutos] = useState([]);
  const [currentAuto, setCurrentAuto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [autoToDelete, setAutoToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  const fetchAutos = useCallback(() => {
    if (filterStatus === 'Todos') {
      autoService.getAll()
        .then(response => {
          setAutos(response.data);
        })
        .catch(error => {
          console.error("Error fetching all cars:", error);
        });
    } else {
      autoService.getByEstado(filterStatus)
        .then(response => {
          setAutos(response.data);
        })
        .catch(error => {
          console.error(`Error fetching cars by status ${filterStatus}:`, error);
        });
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchAutos();
  }, [fetchAutos]);

  const handleAdd = () => {
    setCurrentAuto(null);
    setShowModal(true);
  };

  const handleEdit = (auto) => {
    setCurrentAuto(auto);
    setShowModal(true);
  };

  const handleDelete = (auto) => {
    setAutoToDelete(auto);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    autoService.remove(autoToDelete.placa)
      .then(() => {
        fetchAutos();
        setShowDeleteConfirm(false);
        setAutoToDelete(null);
      })
      .catch(error => {
        console.error("Error deleting car:", error);
      });
  };

  const handleSave = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      placa: formData.get('placa'),
      marca: formData.get('marca'),
      modelo: formData.get('modelo'),
      anio: parseInt(formData.get('anio')), // Convert to number
      precio_diario: parseFloat(formData.get('precio_diario')), // Convert to number
      estado: formData.get('estado'),
    };

    if (currentAuto) {
      autoService.update(currentAuto.placa, data)
        .then(() => {
          fetchAutos();
          setShowModal(false);
        })
        .catch(error => {
          console.error("Error updating car:", error);
        });
    } else {
      autoService.create(data)
        .then(() => {
          fetchAutos();
          setShowModal(false);
        })
        .catch(error => {
          console.error("Error creating car:", error);
        });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentAuto(null);
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setAutoToDelete(null);
  };

  const filteredAutos = autos.filter(auto =>
    auto.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auto.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auto.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="mb-4">Gestión de Autos</h1>
      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={handleAdd}>Agregar Auto</Button>
        <div className="d-flex">
          <Form.Group controlId="searchTerm" className="me-2">
            <Form.Control
              type="text"
              placeholder="Buscar por marca, modelo o placa"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="filterStatus">
            <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="Todos">Todos los Estados</option>
              <option value="Disponible">Disponible</option>
              <option value="Alquilado">Alquilado</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </Form.Select>
          </Form.Group>
        </div>
      </div>

      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Placa</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Año</th>
            <th>Precio Diario</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredAutos.map(auto => (
            <tr key={auto.placa}>
              <td>{auto.placa}</td>
              <td>{auto.marca}</td>
              <td>{auto.modelo}</td>
              <td>{auto.anio}</td>
              <td>{auto.precio_diario}</td>
              <td>{auto.estado}</td>
              <td>
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(auto)}>Editar</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(auto)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para Agregar/Editar Auto */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentAuto ? 'Editar Auto' : 'Agregar Auto'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Placa</Form.Label>
              <Form.Control
                type="text"
                name="placa"
                defaultValue={currentAuto ? currentAuto.placa : ''}
                required
                disabled={currentAuto ? true : false}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Marca</Form.Label>
              <Form.Control
                type="text"
                name="marca"
                defaultValue={currentAuto ? currentAuto.marca : ''}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Modelo</Form.Label>
              <Form.Control
                type="text"
                name="modelo"
                defaultValue={currentAuto ? currentAuto.modelo : ''}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Año</Form.Label>
              <Form.Control
                type="number"
                name="anio"
                defaultValue={currentAuto ? currentAuto.anio : ''}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio Diario</Form.Label>
              <Form.Control
                type="number"
                name="precio_diario"
                step="0.01"
                defaultValue={currentAuto ? currentAuto.precio_diario : ''}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="estado"
                defaultValue={currentAuto ? currentAuto.estado : 'Disponible'}
                required
              >
                <option value="Disponible">Disponible</option>
                <option value="Alquilado">Alquilado</option>
                <option value="Mantenimiento">Mantenimiento</option>
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
          ¿Estás seguro de que deseas eliminar el auto con placa <strong>{autoToDelete?.placa}</strong> ({autoToDelete?.marca} {autoToDelete?.modelo})?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteConfirm}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Autos;

import React, { useState, useEffect, useCallback } from 'react';
import alquilerService from '../services/alquilerService';
import clienteService from '../services/clienteService';
import autoService from '../services/autoService';
import empleadoService from '../services/empleadoService';
import pagoService from '../services/pagoService';
import { Modal, Button, Form, Table, InputGroup } from 'react-bootstrap';

function Alquileres() {
  const [alquileres, setAlquileres] = useState([]);
  const [currentAlquiler, setCurrentAlquiler] = useState(null);
  const [showAlquilerModal, setShowAlquilerModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [alquilerToDelete, setAlquilerToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [clientes, setClientes] = useState([]);
  const [autos, setAutos] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedAuto, setSelectedAuto] = useState('');
  const [selectedEmpleado, setSelectedEmpleado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [montoTotal, setMontoTotal] = useState(0);

  const [showPagosModal, setShowPagosModal] = useState(false);
  const [pagosAlquiler, setPagosAlquiler] = useState([]);
  const [alquilerParaPagos, setAlquilerParaPagos] = useState(null);
  const [montoPago, setMontoPago] = useState(0);

  const fetchAlquileres = useCallback(() => {
    alquilerService.getAll()
      .then(response => {
        setAlquileres(response.data);
      })
      .catch(error => {
        console.error("Error fetching rentals:", error);
      });
  }, []);

  const fetchClientes = useCallback(() => {
    clienteService.getAll()
      .then(response => {
        setClientes(response.data);
      })
      .catch(error => {
        console.error("Error fetching clients:", error);
      });
  }, []);

  const fetchAutos = useCallback(() => {
    autoService.getAll() // Fetch all cars
      .then(response => {
        setAutos(response.data);
      })
      .catch(error => {
        console.error("Error fetching cars:", error);
      });
  }, []);

  const fetchEmpleados = useCallback(() => {
    empleadoService.getAll()
      .then(response => {
        setEmpleados(response.data);
      })
      .catch(error => {
        console.error("Error fetching employees:", error);
      });
  }, []);

  useEffect(() => {
    fetchAlquileres();
    fetchClientes();
    fetchAutos();
    fetchEmpleados();
  }, [fetchAlquileres, fetchClientes, fetchAutos, fetchEmpleados]);

  useEffect(() => {
    if (fechaInicio && fechaFin && selectedAuto) {
      const start = new Date(fechaInicio);
      const end = new Date(fechaFin);
      
      if (end < start) {
        setMontoTotal(0);
        return;
      }

      const diffTime = end.getTime() - start.getTime();
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (fechaInicio === fechaFin) {
        diffDays = 1; // Minimum 1 day rental
      }
      
      const auto = autos.find(a => a.placa === selectedAuto);
      if (auto && diffDays > 0) {
        setMontoTotal(Number(auto.precio_diario) * diffDays);
      } else {
        setMontoTotal(0);
      }
    } else {
      setMontoTotal(0);
    }
  }, [fechaInicio, fechaFin, selectedAuto, autos]);

  const handleAddAlquiler = () => {
    setCurrentAlquiler(null);
    setSelectedCliente('');
    setSelectedAuto('');
    setSelectedEmpleado('');
    setFechaInicio('');
    setFechaFin('');
    setMontoTotal(0);
    setShowAlquilerModal(true);
  };

  const handleEditAlquiler = (alquiler) => {
    setCurrentAlquiler(alquiler);
    setSelectedCliente(alquiler.dni_cliente);
    setSelectedAuto(alquiler.placa_auto);
    setSelectedEmpleado(alquiler.id_empleado);
    setFechaInicio(alquiler.fecha_inicio.split('T')[0]); // Format date for input
    setFechaFin(alquiler.fecha_fin.split('T')[0]); // Format date for input
    setMontoTotal(Number(alquiler.monto_total));
    setShowAlquilerModal(true);
  };

  const handleDeleteAlquiler = (alquiler) => {
    setAlquilerToDelete(alquiler);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAlquiler = () => {
    alquilerService.remove(alquilerToDelete.id_alquiler)
      .then(() => {
        fetchAlquileres();
        setShowDeleteConfirm(false);
        setAlquilerToDelete(null);
      })
      .catch(error => {
        console.error("Error deleting rental:", error);
      });
  };

  const handleSaveAlquiler = (event) => {
    event.preventDefault();
    const data = {
      dni_cliente: selectedCliente,
      placa_auto: selectedAuto,
      id_empleado: selectedEmpleado,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      monto_total: montoTotal,
    };

    if (currentAlquiler) {
      alquilerService.update(currentAlquiler.id_alquiler, data)
        .then(() => {
          fetchAlquileres();
          setShowAlquilerModal(false);
        })
        .catch(error => {
          console.error("Error updating rental:", error);
        });
    } else {
      alquilerService.create(data)
        .then(() => {
          // Update car status to 'Alquilado'
          autoService.update(selectedAuto, { estado: 'Alquilado' })
            .then(() => {
              fetchAlquileres();
              fetchAutos(); // Refresh available cars
              setShowAlquilerModal(false);
            })
            .catch(error => console.error("Error updating car status:", error));
        })
        .catch(error => {
          console.error("Error creating rental:", error);
        });
    }
  };

  const handleCloseAlquilerModal = () => {
    setShowAlquilerModal(false);
    setCurrentAlquiler(null);
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setAlquilerToDelete(null);
  };

  const handleShowPagos = (alquiler) => {
    setAlquilerParaPagos(alquiler);
    pagoService.getByAlquilerId(alquiler.id_alquiler)
      .then(response => {
        setPagosAlquiler(response.data);
        setShowPagosModal(true);
      })
      .catch(error => console.error("Error fetching payments:", error));
  };

  const handleAddPago = () => {
    if (montoPago <= 0) {
      alert("El monto del pago debe ser mayor a 0.");
      return;
    }
    const totalPagado = pagosAlquiler.reduce((sum, pago) => sum + Number(pago.monto), 0);
    if (totalPagado + montoPago > Number(alquilerParaPagos.monto_total)) {
      alert("El monto total de pagos excede el monto total del alquiler.");
      return;
    }

    const data = {
      id_alquiler: alquilerParaPagos.id_alquiler,
      fecha_pago: new Date().toISOString().split('T')[0],
      monto: montoPago,
    };

    pagoService.create(data)
      .then(() => {
        setMontoPago(0);
        handleShowPagos(alquilerParaPagos); // Refresh payments
      })
      .catch(error => console.error("Error adding payment:", error));
  };

  const handleClosePagosModal = () => {
    setShowPagosModal(false);
    setAlquilerParaPagos(null);
    setPagosAlquiler([]);
  };

  const getClienteName = (dni) => {
    const cliente = clientes.find(c => c.dni === dni);
    return cliente ? `${cliente.nombres} ${cliente.apellidos}` : dni;
  };

  const getAutoInfo = (placa) => {
    const auto = autos.find(a => a.placa === placa);
    return auto ? `${auto.marca} ${auto.modelo} (${auto.placa})` : placa;
  };

  const getEmpleadoName = (id) => {
    const empleado = empleados.find(e => e.id_empleado === id);
    return empleado ? `${empleado.nombres} ${empleado.apellidos}` : id;
  };

  const filteredAlquileres = alquileres.filter(alquiler =>
    getClienteName(alquiler.dni_cliente).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getAutoInfo(alquiler.placa_auto).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="mb-4">Gestión de Alquileres</h1>
      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={handleAddAlquiler}>Registrar Alquiler</Button>
        <Form.Group controlId="searchTerm">
          <Form.Control
            type="text"
            placeholder="Buscar por cliente o auto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID Alquiler</th>
            <th>Cliente</th>
            <th>Auto</th>
            <th>Empleado</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Monto Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredAlquileres.map(alquiler => (
            <tr key={alquiler.id_alquiler}>
              <td>{alquiler.id_alquiler}</td>
              <td>{getClienteName(alquiler.dni_cliente)}</td>
              <td>{getAutoInfo(alquiler.placa_auto)}</td>
              <td>{getEmpleadoName(alquiler.id_empleado)}</td>
              <td>{new Date(alquiler.fecha_inicio).toLocaleDateString()}</td>
              <td>{new Date(alquiler.fecha_fin).toLocaleDateString()}</td>
              <td>{Number(alquiler.monto_total).toFixed(2)}</td>
              <td>
                <Button variant="info" size="sm" className="me-2" onClick={() => handleShowPagos(alquiler)}>Pagos</Button>
                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditAlquiler(alquiler)}>Editar</Button>
                <Button variant="danger" size="sm" onClick={() => handleDeleteAlquiler(alquiler)}>Eliminar</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para Registrar/Editar Alquiler */}
      <Modal show={showAlquilerModal} onHide={handleCloseAlquilerModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentAlquiler ? 'Editar Alquiler' : 'Registrar Nuevo Alquiler'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveAlquiler}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Cliente</Form.Label>
              <Form.Control
                as="select"
                name="dni_cliente"
                value={selectedCliente}
                onChange={(e) => setSelectedCliente(e.target.value)}
                required
                disabled={currentAlquiler ? true : false}
              >
                <option value="">Seleccione un cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.dni} value={cliente.dni}>
                    {cliente.nombres} {cliente.apellidos} ({cliente.dni})
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Auto Disponible</Form.Label>
              <Form.Control
                as="select"
                name="placa_auto"
                value={selectedAuto}
                onChange={(e) => setSelectedAuto(e.target.value)}
                required
                disabled={currentAlquiler ? true : false}
              >
                <option value="">Seleccione un auto</option>
                {autos
                  .filter(auto => auto.estado === 'Disponible' || (currentAlquiler && auto.placa === currentAlquiler.placa_auto))
                  .map(auto => (
                    <option key={auto.placa} value={auto.placa}>
                      {auto.marca} {auto.modelo} ({auto.placa}) - ${auto.precio_diario}/día
                    </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Empleado</Form.Label>
              <Form.Control
                as="select"
                name="id_empleado"
                value={selectedEmpleado}
                onChange={(e) => setSelectedEmpleado(e.target.value)}
                required
              >
                <option value="">Seleccione un empleado</option>
                {empleados.map(empleado => (
                  <option key={empleado.id_empleado} value={empleado.id_empleado}>
                    {empleado.nombres} {empleado.apellidos} ({empleado.cargo})
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Fecha Inicio</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_inicio"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Fecha Fin</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_fin"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  required
                />
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Monto Total</Form.Label>
              <Form.Control
                type="number"
                name="monto_total"
                value={Number(montoTotal).toFixed(2)}
                readOnly
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAlquilerModal}>Cerrar</Button>
            <Button variant="primary" type="submit">Guardar Alquiler</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Confirmación de Eliminación de Alquiler */}
      <Modal show={showDeleteConfirm} onHide={handleCloseDeleteConfirm}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar el alquiler <strong>#{alquilerToDelete?.id_alquiler}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteConfirm}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDeleteAlquiler}>Eliminar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Pagos */}
      <Modal show={showPagosModal} onHide={handleClosePagosModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Pagos para Alquiler #{alquilerParaPagos?.id_alquiler}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alquilerParaPagos && (
            <div className="mb-3">
              <p><strong>Monto Total del Alquiler:</strong> ${Number(alquilerParaPagos.monto_total).toFixed(2)}</p>
              <p><strong>Total Pagado:</strong> ${pagosAlquiler.reduce((sum, pago) => sum + Number(pago.monto), 0).toFixed(2)}</p>
              <p><strong>Saldo Pendiente:</strong> ${(Number(alquilerParaPagos.monto_total) - pagosAlquiler.reduce((sum, pago) => sum + Number(pago.monto), 0)).toFixed(2)}</p>
            </div>
          )}
          <h4>Historial de Pagos</h4>
          {pagosAlquiler.length > 0 ? (
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>ID Pago</th>
                  <th>Fecha Pago</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {pagosAlquiler.map(pago => (
                  <tr key={pago.id_pago}>
                    <td>{pago.id_pago}</td>
                    <td>{new Date(pago.fecha_pago).toLocaleDateString()}</td>
                    <td>{Number(pago.monto).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No hay pagos registrados para este alquiler.</p>
          )}

          <h4 className="mt-4">Registrar Nuevo Pago</h4>
          <InputGroup className="mb-3">
            <Form.Control
              type="number"
              placeholder="Monto del pago"
              value={montoPago}
              onChange={(e) => setMontoPago(parseFloat(e.target.value) || 0)}
              min="0.01"
              step="0.01"
            />
            <Button variant="primary" onClick={handleAddPago}>Agregar Pago</Button>
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePagosModal}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Alquileres;

import React, { useState, useEffect } from 'react';
import autoService from '../services/autoService';
import alquilerService from '../services/alquilerService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar,
  faKey,
  faTools,
  faCalendarCheck,
  faCalendarXmark,
} from '@fortawesome/free-solid-svg-icons';

function Dashboard() {
  const [autosDisponibles, setAutosDisponibles] = useState(0);
  const [autosAlquilados, setAutosAlquilados] = useState(0);
  const [autosMantenimiento, setAutosMantenimiento] = useState(0);
  const [alquileresActivos, setAlquileresActivos] = useState(0);
  const [alquileresTerminados, setAlquileresTerminados] = useState(0);

  useEffect(() => {
    // Obtener autos por estado
    autoService.getByEstado('Disponible').then(response => {
      setAutosDisponibles(response.data.length);
    }).catch(error => console.error("Error fetching available cars:", error));

    autoService.getByEstado('Alquilado').then(response => {
      setAutosAlquilados(response.data.length);
    }).catch(error => console.error("Error fetching rented cars:", error));

    autoService.getByEstado('Mantenimiento').then(response => {
      setAutosMantenimiento(response.data.length);
    }).catch(error => console.error("Error fetching maintenance cars:", error));

    // Obtener alquileres (simplificado por ahora, se necesitará lógica de backend para activos/terminados)
    alquilerService.getAll().then(response => {
      // Asumiendo que el backend devuelve una propiedad 'activo' o similar
      // Por ahora, solo contamos todos los alquileres
      setAlquileresActivos(response.data.filter(alquiler => new Date(alquiler.fecha_fin) >= new Date()).length);
      setAlquileresTerminados(response.data.filter(alquiler => new Date(alquiler.fecha_fin) < new Date()).length);
    }).catch(error => console.error("Error fetching rentals:", error));

  }, []);

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      <div className="row">
        {/* Tarjetas de Autos */}
        <div className="col-md-4 mb-4">
          <div className="card text-white bg-success mb-3 shadow-lg">
            <div className="card-header d-flex align-items-center">
              <FontAwesomeIcon icon={faCar} className="me-2 fs-4" />
              <h4 className="mb-0">Autos Disponibles</h4>
            </div>
            <div className="card-body">
              <h1 className="card-title display-4">{autosDisponibles}</h1>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card text-white bg-warning mb-3 shadow-lg">
            <div className="card-header d-flex align-items-center">
              <FontAwesomeIcon icon={faKey} className="me-2 fs-4" />
              <h4 className="mb-0">Autos Alquilados</h4>
            </div>
            <div className="card-body">
              <h1 className="card-title display-4">{autosAlquilados}</h1>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card text-white bg-danger mb-3 shadow-lg">
            <div className="card-header d-flex align-items-center">
              <FontAwesomeIcon icon={faTools} className="me-2 fs-4" />
              <h4 className="mb-0">Autos en Mantenimiento</h4>
            </div>
            <div className="card-body">
              <h1 className="card-title display-4">{autosMantenimiento}</h1>
            </div>
          </div>
        </div>

        {/* Tarjetas de Alquileres */}
        <div className="col-md-6 mb-4">
          <div className="card text-white bg-info mb-3 shadow-lg">
            <div className="card-header d-flex align-items-center">
              <FontAwesomeIcon icon={faCalendarCheck} className="me-2 fs-4" />
              <h4 className="mb-0">Alquileres Activos</h4>
            </div>
            <div className="card-body">
              <h1 className="card-title display-4">{alquileresActivos}</h1>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card text-white bg-secondary mb-3 shadow-lg">
            <div className="card-header d-flex align-items-center">
              <FontAwesomeIcon icon={faCalendarXmark} className="me-2 fs-4" />
              <h4 className="mb-0">Alquileres Terminados</h4>
            </div>
            <div className="card-body">
              <h1 className="card-title display-4">{alquileresTerminados}</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

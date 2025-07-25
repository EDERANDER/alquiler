const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001;

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'alquilerof',
  password: 'password',
  port: 5432,
});

// Middleware
app.use(cors());
app.use(express.json()); 

// Rutas para Clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cliente');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener clientes');
  }
});
//Para poner clientes
app.post('/api/clientes', async (req, res) => {
  const { dni, nombres, apellidos, direccion, telefono, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cliente (dni, nombres, apellidos, direccion, telefono, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING * ',
      [dni, nombres, apellidos, direccion, telefono, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear cliente');
  }
});

app.put('/api/clientes/:dni', async (req, res) => {
  const { dni } = req.params;
  const { nombres, apellidos, direccion, telefono, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cliente SET nombres = $1, apellidos = $2, direccion = $3, telefono = $4, email = $5 WHERE dni = $6 RETURNING * ',
      [nombres, apellidos, direccion, telefono, email, dni]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Cliente no encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar cliente');
  }
});

app.delete('/api/clientes/:dni', async (req, res) => {
  const { dni } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM alquiler WHERE dni_cliente = $1', [dni]);
    const result = await client.query('DELETE FROM cliente WHERE dni = $1 RETURNING *', [dni]);
    await client.query('COMMIT');

    if (result.rows.length === 0) {
      return res.status(404).send('Cliente no encontrado');
    }

    res.status(204).send(); // No Content
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).send('Error al eliminar cliente');
  } finally {
    client.release();
  }
});

// Rutas para Autos
app.get('/api/autos', async (req, res) => {
  const { estado } = req.query;
  try {
    let query = 'SELECT * FROM auto';
    const params = [];
    if (estado) {
      query += ' WHERE estado = $1';
      params.push(estado);
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener autos');
  }
});

app.post('/api/autos', async (req, res) => {
  const { placa, marca, modelo, anio, precio_diario, estado } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO auto (placa, marca, modelo, anio, precio_diario, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING * ',
      [placa, marca, modelo, anio, precio_diario, estado]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear auto');
  }
});

app.put('/api/autos/:placa', async (req, res) => {
  const { placa } = req.params;
  const { marca, modelo, anio, precio_diario, estado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE auto SET marca = $1, modelo = $2, anio = $3, precio_diario = $4, estado = $5 WHERE placa = $6 RETURNING * ',
      [marca, modelo, anio, precio_diario, estado, placa]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Auto no encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar auto');
  }
});

app.delete('/api/autos/:placa', async (req, res) => {
  const { placa } = req.params;
  try {
    const result = await pool.query('DELETE FROM auto WHERE placa = $1 RETURNING * ', [placa]);
    if (result.rows.length === 0) {
      return res.status(404).send('Auto no encontrado');
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar auto');
  }
});

// Rutas para Empleados
app.get('/api/empleados', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_empleado, nombres, apellidos, cargo FROM empleado');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener empleados');
  }
});

app.post('/api/empleados', async (req, res) => {
  const { nombres, apellidos, cargo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO empleado (nombres, apellidos, cargo) VALUES ($1, $2, $3) RETURNING *',
      [nombres, apellidos, cargo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear empleado');
  }
});

app.put('/api/empleados/:id_empleado', async (req, res) => {
  const { id_empleado } = req.params;
  const { nombres, apellidos, cargo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE empleado SET nombres = $1, apellidos = $2, cargo = $3 WHERE id_empleado = $4 RETURNING *',
      [nombres, apellidos, cargo, id_empleado]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Empleado no encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar empleado');
  }
});

app.delete('/api/empleados/:id_empleado', async (req, res) => {
  const { id_empleado } = req.params;
  try {
    const result = await pool.query('DELETE FROM empleado WHERE id_empleado = $1 RETURNING *', [id_empleado]);
    if (result.rows.length === 0) {
      return res.status(404).send('Empleado no encontrado');
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar empleado');
  }
});

// Rutas para Alquileres
app.get('/api/alquileres', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM alquiler');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener alquileres');
  }
});

app.post('/api/alquileres', async (req, res) => {
  const { fecha_inicio, fecha_fin, monto_total, dni_cliente, placa_auto, id_empleado } = req.body;
  try {
    // Validar que el auto no esté alquilado o en mantenimiento
    const autoStatus = await pool.query('SELECT estado FROM auto WHERE placa = $1', [placa_auto]);
    if (autoStatus.rows.length === 0 || autoStatus.rows[0].estado !== 'Disponible') {
      return res.status(400).send('El auto no está disponible para alquiler.');
    }

    const result = await pool.query(
      'INSERT INTO alquiler (fecha_inicio, fecha_fin, monto_total, dni_cliente, placa_auto, id_empleado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING * ',
      [fecha_inicio, fecha_fin, monto_total, dni_cliente, placa_auto, id_empleado]
    );

    // Actualizar estado del auto a 'Alquilado'
    await pool.query('UPDATE auto SET estado = $1 WHERE placa = $2', ['Alquilado', placa_auto]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear alquiler');
  }
});

app.put('/api/alquileres/:id_alquiler', async (req, res) => {
  const { id_alquiler } = req.params;
  const { fecha_inicio, fecha_fin, monto_total, dni_cliente, placa_auto, id_empleado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE alquiler SET fecha_inicio = $1, fecha_fin = $2, monto_total = $3, dni_cliente = $4, placa_auto = $5, id_empleado = $6 WHERE id_alquiler = $7 RETURNING * ',
      [fecha_inicio, fecha_fin, monto_total, dni_cliente, placa_auto, id_empleado, id_alquiler]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Alquiler no encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar alquiler');
  }
});

app.delete('/api/alquileres/:id_alquiler', async (req, res) => {
  const { id_alquiler } = req.params;
  try {
    const result = await pool.query('DELETE FROM alquiler WHERE id_alquiler = $1 RETURNING * ', [id_alquiler]);
    if (result.rows.length === 0) {
      return res.status(404).send('Alquiler no encontrado');
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar alquiler');
  }
});

// Rutas para Pagos
app.get('/api/pagos', async (req, res) => {
  const { id_alquiler } = req.query;
  try {
    let query = 'SELECT * FROM pago';
    const params = [];
    if (id_alquiler) {
      query += ' WHERE id_alquiler = $1';
      params.push(id_alquiler);
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener pagos');
  }
});

app.post('/api/pagos', async (req, res) => {
  const { id_alquiler, fecha_pago, monto } = req.body;
  try {
    // Validar que el monto total de pagos no exceda el monto_total del alquiler
    const alquiler = await pool.query('SELECT monto_total FROM alquiler WHERE id_alquiler = $1', [id_alquiler]);
    if (alquiler.rows.length === 0) {
      return res.status(404).send('Alquiler no encontrado para el pago.');
    }
    const montoTotalAlquiler = alquiler.rows[0].monto_total;

    const pagosExistentes = await pool.query('SELECT SUM(monto) as total_pagado FROM pago WHERE id_alquiler = $1', [id_alquiler]);
    const totalPagadoActual = parseFloat(pagosExistentes.rows[0].total_pagado) || 0;

    if (totalPagadoActual + monto > montoTotalAlquiler) {
      return res.status(400).send('El monto total de pagos excede el monto total del alquiler.');
    }

    const result = await pool.query(
      'INSERT INTO pago (id_alquiler, fecha_pago, monto) VALUES ($1, $2, $3) RETURNING * ',
      [id_alquiler, fecha_pago, monto]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear pago');
  }
});

app.put('/api/pagos/:id_pago', async (req, res) => {
  const { id_pago } = req.params;
  const { id_alquiler, fecha_pago, monto } = req.body;
  try {
    const result = await pool.query(
      'UPDATE pago SET id_alquiler = $1, fecha_pago = $2, monto = $3 WHERE id_pago = $4 RETURNING * ',
      [id_alquiler, fecha_pago, monto, id_pago]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Pago no encontrado');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar pago');
  }
});

app.delete('/api/pagos/:id_pago', async (req, res) => {
  const { id_pago } = req.params;
  try {
    const result = await pool.query('DELETE FROM pago WHERE id_pago = $1 RETURNING * ', [id_pago]);
    if (result.rows.length === 0) {
      return res.status(404).send('Pago no encontrado');
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar pago');
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});

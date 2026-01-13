
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Siz bergan Postgres URL
const pool = new Pool({
  connectionString: 'postgresql://postgres:VpnmQkdZsXbHpLElaJsPPXZtMegPSLmJ@tramway.proxy.rlwy.net:51584/railway',
});

// Bazani tayyorlash (Jadvallarni yaratish)
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      code TEXT,
      images TEXT[],
      description TEXT,
      type TEXT,
      size TEXT,
      price NUMERIC,
      stock INTEGER,
      discount NUMERIC DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      items JSONB,
      user_info JSONB,
      type TEXT,
      total NUMERIC,
      status TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
initDB();

// API Endpoints
app.get('/products', async (req, res) => {
  const result = await pool.query('SELECT * FROM products WHERE stock > 0');
  res.json(result.rows);
});

app.post('/products', async (req, res) => {
  const { id, code, images, description, type, size, price, stock, discount } = req.body;
  await pool.query(
    'INSERT INTO products (id, code, images, description, type, size, price, stock, discount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET stock = EXCLUDED.stock, price = EXCLUDED.price',
    [id, code, images, description, type, size, price, stock, discount]
  );
  res.sendStatus(200);
});

app.delete('/products/:id', async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  res.sendStatus(200);
});

app.post('/orders', async (req, res) => {
  const { id, items, user, type, total, status } = req.body;
  await pool.query(
    'INSERT INTO orders (id, items, user_info, type, total, status) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, JSON.stringify(items), JSON.stringify(user), type, total, status]
  );
  
  // Ombor (stock) ni kamaytirish
  for (const item of items) {
    await pool.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.id]);
  }
  
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

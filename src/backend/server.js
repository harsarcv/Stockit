const express = require('express')
const db = require('./config/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

const PORT = 3000

const authenticateToken = (req, res, next) => {
    
    const authHeader = req.headers['authorization']

    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            message: 'Token tidak ditemukan'
        })
    }

    try {
        const user = jwt.verify(token, 'stockit-secret-key')

        req.user = user

        next()
    } catch (error) {
        console.error('JWT ERROR:', error)

        return res.status(403).json({
            message: 'Token tidak valid'
        })
    }
}

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Akses hanya untuk admin'
        })
    }

    next()
}

app.get('/', (req, res) => {
    res.send('Selamat datang di backend Stockit!')
})

app.get('/products', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                products.id,
                products.nama,
                products.harga,
                products.stok,
                products.category_id,
                categories.nama AS kategori
                FROM products
                LEFT JOIN categories
                    ON products.category_id = categories.id
        `)

        res.json(result.rows)
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal mengambil data produk'
        })
    }
})

app.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params

        const result = await db.query(
            `
            SELECT
                products.id,
                products.nama,
                products.harga,
                products.stok,
                categories.nama AS kategori
            FROM products
            JOIN categories
                ON products.category_id = categories.id
            WHERE products.id = $1
            `,
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan'
            })
        }

        res.json(result.rows[0])
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal mengambil produk'
        })
    }
})

app.post('/products', async (req, res) => {
    try {
        const { nama, harga, stok, category_id } = req.body

        const result = await db.query(
            `
            INSERT INTO products (nama, harga, stok, category_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [nama, harga, stok, category_id]
        )

        res.status(201).json({
            message: 'Produk berhasil dibuat',
            data: result.rows[0]
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal membuat produk'
        })
    }
})

app.post('/products/import', async (req, res) => {
    try {
        const products = req.body.products

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                message: 'Data produk tidak ditemukan'
            })
        }

        for (const product of products) {
            const { nama, harga, stok, kategori } = product

            const categoryResult = await db.query(
                `
                SELECT id
                FROM categories
                WHERE LOWER(nama) = LOWER($1)
                `,
                [kategori]
            )

            if (categoryResult.rows.length === 0) {
                return res.status(400).json({
                    message: `Kategori "${kategori}" tidak ditemukan`
                })
            }

            const categoryId = categoryResult.rows[0].id

            await db.query(
                `
                INSERT INTO products
                    (nama, harga, stok, category_id)
                VALUES
                    ($1, $2, $3, $4)
                `,
                [nama, harga, stok, categoryId]
            )
        }

        res.status(201).json({
            message: `${products.length} produk berhasil diimport`
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal mengimport produk'
        })
    }
})

app.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { nama, harga, stok, category_id } = req.body

        const result = await db.query(
            `
            UPDATE products
            SET
                nama = $1,
                harga = $2,
                stok = $3,
                category_id = $4
            WHERE id = $5
            RETURNING *
            `,
            [nama, harga, stok, category_id, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan'
            })
        }

        res.json({
            message: 'Produk berhasil diperbarui',
            data: result.rows[0]
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal memperbarui produk'
        })
    }
})

app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params

        const result = await db.query(
            `
            DELETE FROM products
            WHERE id = $1
            RETURNING *
            `,
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan'
            })
        }

        res.json({
            message: 'Produk berhasil dihapus',
            data: result.rows[0]
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal menghapus produk'
        })
    }
})

app.get('/categories', async (req, res) => {
    try {
        const result = await db.query(
            `
            SELECT id, nama
            FROM categories
            ORDER BY id
            `
        )

        res.json(result.rows)
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal mengambil data kategori'
        })
    }
})

app.post('/categories', async (req, res) => {
    try {
        const { nama } = req.body

        const result = await db.query(
            `
            INSERT INTO categories (nama)
            VALUES ($1)
            RETURNING *
            `,
            [nama]
        )

        res.status(201).json({
            message: 'Kategori berhasil dibuat',
            data: result.rows[0]
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal membuat kategori'
        })
    }
})

app.get('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params

        const result = await db.query(
            `
            SELECT id, nama
            FROM categories
            WHERE id = $1
            `,
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Kategori tidak ditemukan'
            })
        }

        res.json(result.rows[0])
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal mengambil kategori'
        })
    }
})

app.put('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { nama } = req.body

        const result = await db.query(
            `
            UPDATE categories
            SET nama = $1
            WHERE id = $2
            RETURNING *
            `,
            [nama, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Kategori tidak ditemukan'
            })
        }

        res.json({
            message: 'Kategori berhasil diperbarui',
            data: result.rows[0]
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal memperbarui kategori'
        })
    }
})

app.delete('/categories/:id', async (req, res) => {
    try {
        const { id } = req.params

        const result = await db.query(
            `
            DELETE FROM categories
            WHERE id = $1
            RETURNING *
            `,
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Kategori tidak ditemukan'
            })
        }

        res.json({
            message: 'Kategori berhasil dihapus',
            data: result.rows[0]
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal menghapus kategori'
        })
    }
})

app.get('/suppliers', async (req, res) => {
    try {
        const result = await db.query(
            `
            SELECT id, nama, kontak, email, alamat
            FROM suppliers
            ORDER BY id
            `
        )

        res.json(result.rows)
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal mengambil data supplier'
        })
    }
})

app.post('/suppliers', async (req, res) => {
    try {
        const { nama, kontak, email, alamat } = req.body

        const result = await db.query(
            `
            INSERT INTO suppliers (nama, kontak, email, alamat)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [nama, kontak, email, alamat]
        )

        res.status(201).json({
            message: 'Supplier berhasil dibuat',
            data: result.rows[0]
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal membuat supplier'
        })
    }
})

app.get('/suppliers/:id', async (req, res) => {
    try {
        const { id } = req.params

        const result = await db.query(
            `
            SELECT id, nama, kontak, email, alamat
            FROM suppliers
            WHERE id = $1
            `,
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Supplier tidak ditemukan'
            })
        }

        res.json(result.rows[0])
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal mengambil supplier'
        })
    }
})

app.put('/suppliers/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { nama, kontak, email, alamat } = req.body

        const result = await db.query(
            `
            UPDATE suppliers
            SET
                nama = $1,
                kontak = $2,
                email = $3,
                alamat = $4
            WHERE id = $5
            RETURNING *
            `,
            [nama, kontak, email, alamat, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Supplier tidak ditemukan'
            })
        }

        res.json({
            message: 'Supplier berhasil diperbarui',
            data: result.rows[0]
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal memperbarui supplier'
        })
    }
})

app.delete('/suppliers/:id', async (req, res) => {
    try {
        const { id } = req.params

        const result = await db.query(
            `
            DELETE FROM suppliers
            WHERE id = $1
            RETURNING *
            `,
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Supplier tidak ditemukan'
            })
        }

        res.json({
            message: 'Supplier berhasil dihapus',
            data: result.rows[0]
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal menghapus supplier'
        })
    }
})

app.post('/stock/in', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { product_id, jumlah, supplier_id, keterangan } = req.body

        const result = await db.query(
            `
            INSERT INTO stock_transactions
                (product_id, tipe, jumlah, supplier_id, keterangan)
            VALUES
                ($1, 'masuk', $2, $3, $4)
            RETURNING *
            `,
            [product_id, jumlah, supplier_id, keterangan]
        )

        await db.query(
            `
            UPDATE products
            SET stok = stok + $1
            WHERE id = $2
            `,
            [jumlah, product_id]
        )

        res.status(201).json({
            message: 'Stok masuk berhasil',
            data: result.rows[0]
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal mencatat stok masuk'
        })
    }
})

app.post('/stock/out', async (req, res) => {
    try {
        const { product_id, jumlah, penerima, keterangan } = req.body

        const result = await db.query(
            `
            INSERT INTO stock_transactions
                (product_id, tipe, jumlah, penerima, keterangan)
            VALUES
                ($1, 'keluar', $2, $3, $4)
            RETURNING *
            `,
            [product_id, jumlah, penerima, keterangan]
        )

        await db.query(
            `
            UPDATE products
            SET stok = stok - $1
            WHERE id = $2
            `,
            [jumlah, product_id]
        )

        res.status(201).json({
            message: 'Stok keluar berhasil',
            data: result.rows[0]
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal mencatat stok keluar'
        })
    }
})

app.get('/stock/history', async (req, res) => {
    try {
        const result = await db.query(
            `
            SELECT
                stock_transactions.id,
                stock_transactions.product_id,
                products.nama AS produk,
                stock_transactions.tipe,
                stock_transactions.jumlah,
                suppliers.nama AS supplier,
                stock_transactions.penerima,
                stock_transactions.keterangan,
                stock_transactions.created_at
            FROM stock_transactions
            JOIN products
                ON stock_transactions.product_id = products.id
            LEFT JOIN suppliers
                ON stock_transactions.supplier_id = suppliers.id
            ORDER BY stock_transactions.created_at DESC
            `
        )

        res.json(result.rows)
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal mengambil riwayat stok'
        })
    }
})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        const result = await db.query(
            `
            SELECT id, nama, email, password, role
            FROM users
            WHERE email = $1
            `,
            [email]
        )

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Email atau password salah'
            })
        }

        const user = result.rows[0]

        const passwordCocok = await bcrypt.compare(password, user.password)

        if (!passwordCocok) {
            return res.status(401).json({
                message: 'Email atau password salah'
            })
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            'stockit-secret-key',
            {
                expiresIn: '1h'
            }
        )

        res.json({
            message: 'Login berhasil',
            token: token,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: 'Gagal melakukan login'
        })
    }
})

db.query('SELECT NOW()', (error, result) => {
    if (error) {
        console.error('Database gagal terhubung:', error)
    } else {
        console.log('Database berhasil terhubung!')
        console.log('Waktu database:', result.rows[0].now)
    }
})

app.listen(PORT, () => {
    console.log(`Server Stockit berjalan di http://localhost:${PORT}`)
})
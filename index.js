const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Kudangamuk',
    database: 'mahasiswa',
    port: 3309,
});

db.on('error', (err) => {
    console.error('MySQL Pool Error:', err);
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get('/api/mahasiswa', (req, res) => {
    db.query('SELECT * FROM biodata', (err, results) => {
        if (err) {
            // Perbaikan: Hapus operator '+' yang tidak diperlukan
            console.error('Error executing query:', err.stack); 
            res.status(500).send('Error fetching users');
            return;
        }
        res.json(results);
    });
});

app.post('/api/mahasiswa', (req, res) => {
    const { nama, alamat, agama } = req.body;

    if (!nama || !alamat || !agama) {
        // Perbaikan: Tutup objek JSON dengan benar
        return res.status(400).json({ message : 'nama, alamat, agama harus diisi' });
    }

    db.query(
        'INSERT INTO biodata (nama, alamat, agama) VALUES (?, ?, ?)',
        [nama, alamat, agama],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.status(201).json({ 
                message: 'User created successfully',
                id: results.insertId 
            });
        }
    );
});

app.put('/api/mahasiswa/:id', (req, res) => {
    const userId = req.params.id;
    const { nama, alamat, agama } = req.body;
    
    if (!nama || !alamat || !agama) {
         return res.status(400).json({ message : 'Semua field (nama, alamat, agama) harus diisi untuk update' });
    }

    db.query(
        'UPDATE biodata SET nama = ?, alamat = ?, agama = ? WHERE id = ?',
        [nama, alamat, agama, userId],
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Database error' });
            }
            
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: `User dengan ID ${userId} tidak ditemukan` });
            }

            res.json({ message: 'User updated successfully' });
        }
    );
});

app.delete('/api/mahasiswa/:id', (req, res) => {
    const userId = req.params.id;
    db.query( 'DELETE FROM biodata WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: `User dengan ID ${userId} tidak ditemukan` });
        }
        
        res.status(200).json({ message: 'User deleted successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
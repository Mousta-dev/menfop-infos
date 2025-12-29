require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const db = new sqlite3.Database('./management.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error('Error creating users table:', err.message);
                } else {
                    // Seed the database with a default user
                    const insert = 'INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)';
                    bcrypt.hash('Mousta@2025', 10, (err, hash) => {
                        if (err) {
                            console.error('Error hashing password:', err);
                        }
                        else {
                            db.run(insert, ['Alpha', hash]);
                        }
                    });
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS establishments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )`, (err) => {
                if (err) console.error('Error creating establishments table:', err.message);
            });
            db.run(`CREATE TABLE IF NOT EXISTS equipment (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                status TEXT NOT NULL,
                establishment_id INTEGER,
                FOREIGN KEY (establishment_id) REFERENCES establishments(id)
            )`, (err) => {
                if (err) console.error('Error creating equipment table:', err.message);
            });
            db.run(`CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) console.error('Error creating reports table:', err.message);
            });
            db.run(`CREATE TABLE IF NOT EXISTS missions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) console.error('Error creating missions table:', err.message);
            });
        });
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (result) {
                const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ success: true, token });
            } else {
                res.json({ success: false, message: 'Invalid credentials' });
            }
        });
    });
});

app.get('/api/establishments', authenticateToken, (req, res) => {
    db.all('SELECT * FROM establishments', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.post('/api/establishments', authenticateToken, (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ "error": "Name is required" });
        return;
    }
    db.run('INSERT INTO establishments (name) VALUES (?)', [name], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(201).json({
            "message": "success",
            "data": { id: this.lastID, name }
        });
    });
});

app.put('/api/establishments/:id', authenticateToken, (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    if (!name) {
        res.status(400).json({ "error": "Name is required" });
        return;
    }
    db.run('UPDATE establishments SET name = ? WHERE id = ?', [name, id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id, name },
            "changes": this.changes
        });
    });
});

app.delete('/api/establishments/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM establishments WHERE id = ?', id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "changes": this.changes
        });
    });
});

app.get('/api/equipment', authenticateToken, (req, res) => {
    const { status, establishment_id } = req.query;
    let sql = 'SELECT equipment.*, establishments.name as establishment_name FROM equipment LEFT JOIN establishments ON equipment.establishment_id = establishments.id';
    const params = [];
    const conditions = [];

    if (status) {
        conditions.push('status = ?');
        params.push(status);
    }
    if (establishment_id) {
        conditions.push('establishment_id = ?');
        params.push(establishment_id);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/api/equipment/damaged', authenticateToken, (req, res) => {
    db.all('SELECT equipment.*, establishments.name as establishment_name FROM equipment LEFT JOIN establishments ON equipment.establishment_id = establishments.id WHERE status = "damaged"', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/api/equipment/functional', authenticateToken, (req, res) => {
    db.all('SELECT equipment.*, establishments.name as establishment_name FROM equipment LEFT JOIN establishments ON equipment.establishment_id = establishments.id WHERE status = "functional"', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/api/equipment/new', authenticateToken, (req, res) => {
    db.all('SELECT equipment.*, establishments.name as establishment_name FROM equipment LEFT JOIN establishments ON equipment.establishment_id = establishments.id WHERE status = "new"', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.post('/api/equipment', authenticateToken, (req, res) => {
    const { name, status, establishment_id } = req.body;
    if (!name || !status || !establishment_id) {
        res.status(400).json({ "error": "Name, status, and establishment_id are required" });
        return;
    }
    db.run('INSERT INTO equipment (name, status, establishment_id) VALUES (?, ?, ?)', [name, status, establishment_id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(201).json({
            "message": "success",
            "data": { id: this.lastID, name, status, establishment_id }
        });
    });
});

app.put('/api/equipment/:id', authenticateToken, (req, res) => {
    const { name, status, establishment_id } = req.body;
    const { id } = req.params;
    if (!name || !status || !establishment_id) {
        res.status(400).json({ "error": "Name, status, and establishment_id are required" });
        return;
    }
    db.run('UPDATE equipment SET name = ?, status = ?, establishment_id = ? WHERE id = ?', [name, status, establishment_id, id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id, name, status, establishment_id },
            "changes": this.changes
        });
    });
});

app.delete('/api/equipment/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM equipment WHERE id = ?', id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "changes": this.changes
        });
    });
});

app.post('/api/reports', authenticateToken, (req, res) => {
    const { content } = req.body;
    if (!content) {
        res.status(400).json({ "error": "Content is required" });
        return;
    }
    db.run('INSERT INTO reports (content) VALUES (?)', [content], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(201).json({
            "message": "success",
            "data": { id: this.lastID, content }
        });
    });
});

app.get('/api/reports', authenticateToken, (req, res) => {
    db.all('SELECT * FROM reports ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/api/reports/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM reports WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ "error": "Report not found" });
            return;
        }
        res.json({
            "message": "success",
            "data": row
        });
    });
});

// Missions API
app.post('/api/missions', authenticateToken, (req, res) => {
    const { name, description, status } = req.body;
    if (!name) {
        res.status(400).json({ "error": "Name is required" });
        return;
    }
    db.run('INSERT INTO missions (name, description, status) VALUES (?, ?, ?)', [name, description, status || 'pending'], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.status(201).json({
            "message": "success",
            "data": { id: this.lastID, name, description, status: status || 'pending' }
        });
    });
});

app.get('/api/missions', authenticateToken, (req, res) => {
    db.all('SELECT * FROM missions ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/api/missions/summary', authenticateToken, (req, res) => {
    db.all('SELECT status, COUNT(*) as count FROM missions GROUP BY status', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/api/dashboard/summary', authenticateToken, (req, res) => {
    db.get('SELECT COUNT(*) as totalEquipment FROM equipment', (err, total) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        db.all('SELECT status, COUNT(*) as count FROM equipment GROUP BY status', [], (err, statusCounts) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({
                "message": "success",
                "data": {
                    totalEquipment: total.totalEquipment,
                    statusCounts: statusCounts
                }
            });
        });
    });
});

app.get('/api/dashboard/equipment-by-establishment', authenticateToken, (req, res) => {
    db.all('SELECT e.name as establishment_name, COUNT(eq.id) as equipmentCount FROM establishments e LEFT JOIN equipment eq ON e.id = eq.establishment_id GROUP BY e.name ORDER BY e.name', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.get('/', (req, res) => {
    res.send('Management App Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

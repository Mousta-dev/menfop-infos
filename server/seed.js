const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./management.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database for seeding.');
        seedData();
    }
});

function seedData() {
    db.serialize(() => {
        db.get('SELECT COUNT(*) AS count FROM establishments', (err, row) => {
            if (err) {
                console.error('Error checking establishments count:', err.message);
                db.close();
                return;
            }
            if (row.count === 0) {
                const initialEstablishments = [
                    "lycee d'etat",
                    "lycee djama maitre",
                    "lycee Ahmed Farah",
                    "lycee de hodan",
                    "college sans-fill",
                    "college fukuzawa",
                    "collegue"
                ];
                const insertStmt = db.prepare('INSERT INTO establishments (name) VALUES (?)');
                initialEstablishments.forEach(name => {
                    insertStmt.run(name, (insertErr) => {
                        if (insertErr) {
                            console.error(`Error inserting establishment ${name}:`, insertErr.message);
                        } else {
                            console.log(`Inserted initial establishment: ${name}`);
                        }
                    });
                });
                insertStmt.finalize(() => {
                    console.log('Initial establishments pre-population complete.');
                    db.close();
                });
            } else {
                console.log('Establishments table already populated. No seeding needed.');
                db.close();
            }
        });
    });
}

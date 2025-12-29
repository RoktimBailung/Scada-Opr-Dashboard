// ================================
// IMPORTS
// ================================
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const ExcelJS = require('exceljs');

// ================================
// APP SETUP
// ================================
const app = express();
app.use(cors());
app.use(express.json());

// ================================
// DATABASE CONNECTION
// ================================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Roktim@01',   // keep your password
    database: 'scada_db'
});

db.connect(err => {
    if (err) {
        console.error('❌ MySQL connection failed:', err);
        return;
    }
    console.log('✅ MySQL connected successfully');
});

// ================================
// TEST ROUTE
// ================================
app.get('/', (req, res) => {
    res.send('Backend is running successfully');
});

// ================================
// DRILLING RTDMM API
// ================================
app.post('/api/drilling', (req, res) => {
    const {
        date,
        rigName,
        location,
        availability,
        remark,
        installDate,
        deinstallDate
    } = req.body;

    const sql = `
        INSERT INTO drilling_rtdmm
        (date, rig_name, location, availability, remark, install_date, deinstall_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            date,
            rigName,
            location,
            availability,
            remark,
            installDate || null,
            deinstallDate || null
        ],
        err => {
            if (err) {
                console.error('❌ Drilling DB error:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            res.json({ message: 'Drilling data saved successfully' });
        }
    );
});

// ================================
// PRODUCTION SCADA API
// ================================
app.post('/api/production', (req, res) => {
    const { production, location, availability, remark } = req.body;

    const sql = `
        INSERT INTO production_scada
        (production, location, availability, remark)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [production, location, availability, remark],
        err => {
            if (err) {
                console.error('❌ Production DB error:', err);
                return res.status(500).json({ message: 'Database error' });
            }
            res.json({ message: 'Production data saved successfully' });
        }
    );
});

// ================================
// EXCEL EXPORT API (FINAL)
// ================================
app.get('/api/export-excel', async (req, res) => {
    try {
        const [drillingResults] = await db.promise().query('SELECT * FROM drilling_rtdmm');
        const [productionResults] = await db.promise().query('SELECT * FROM production_scada');

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('SCADA OPR');

        // ===== DRILLING RTDMM =====
        sheet.addRow(['DRILLING RTDMM DETAILS']).font = { bold: true };
        sheet.addRow([]);

        const drillingHeader = sheet.addRow([
            'Sl No',
            'Rig Name',
            'Location',
            'RTDMM Data Availability',
            'Remedial Action / Remark',
            'RTDMM Installation Date',
            'RTDMM De-installation Date'
        ]);

        drillingHeader.eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        drillingResults.forEach((row, index) => {
            const r = sheet.addRow([
                index + 1,
                row.rig_name,
                row.location,
                row.availability,
                row.remark,
                row.install_date ? new Date(row.install_date).toLocaleDateString('en-GB') : '',
                row.deinstall_date ? new Date(row.deinstall_date).toLocaleDateString('en-GB') : ''
            ]);

            r.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            r.getCell(1).alignment = { horizontal: 'center' };
        });

        sheet.addRow([]);
        sheet.addRow([]);
        sheet.addRow([]);

        // ===== PRODUCTION SCADA =====
        sheet.addRow(['PRODUCTION SCADA DETAILS']).font = { bold: true };
        sheet.addRow([]);

        const productionHeader = sheet.addRow([
            'Sl No',
            'Production',
            'Location',
            'SCADA Data Availability',
            'Remedial Action / Remark'
        ]);

        productionHeader.eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        productionResults.forEach((row, index) => {
            const r = sheet.addRow([
                index + 1,
                row.production,
                row.location,
                row.availability,
                row.remark
            ]);

            r.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            r.getCell(1).alignment = { horizontal: 'center' };
        });

        // Column widths
        sheet.columns = [
            { width: 8 },
            { width: 18 },
            { width: 18 },
            { width: 25 },
            { width: 35 },
            { width: 20 },
            { width: 22 }
        ];

        res.setHeader(
            'Content-Disposition',
            'inline; filename="SCADA_OPR.xlsx"'
        );
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('❌ Excel generation error:', error);
        res.status(500).send('Excel generation failed');
    }
});

// ================================
// START SERVER
// ================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

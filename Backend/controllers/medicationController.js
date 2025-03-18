const db = require("../config/db");

// **1. Add Medication**
exports.addMedication = (req, res) => {
  const { user_id, name, dosage, frequency, start_date, end_date, notes } = req.body;
  
  if (!user_id || !name || !dosage || !frequency || !start_date) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  const query = `INSERT INTO medications (user_id, name, dosage, frequency, start_date, end_date, notes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [user_id, name, dosage, frequency, start_date, end_date, notes], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(201).json({ message: "Medication added successfully", medication_id: result.insertId });
  });
};

// **2. Get Medications for a User**
exports.getMedications = (req, res) => {
  const { user_id } = req.params;

  db.query("SELECT * FROM medications WHERE user_id = ?", [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(200).json(results);
  });
};

// **3. Get Medication by ID**
exports.getMedicationById = (req, res) => {
  const { med_id } = req.params;

  db.query("SELECT * FROM medications WHERE med_id = ?", [med_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Medication not found" });
    }
    res.status(200).json(result[0]);
  });
};

// **4. Update Medication**
exports.updateMedication = (req, res) => {
  const { med_id } = req.params;
  const { name, dosage, frequency, start_date, end_date, notes } = req.body;

  const query = `UPDATE medications SET name=?, dosage=?, frequency=?, start_date=?, end_date=?, notes=? WHERE med_id=?`;

  db.query(query, [name, dosage, frequency, start_date, end_date, notes, med_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(200).json({ message: "Medication updated successfully" });
  });
};

// **5. Delete Medication**
exports.deleteMedication = (req, res) => {
  const { med_id } = req.params;

  db.query("DELETE FROM medications WHERE med_id = ?", [med_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(200).json({ message: "Medication deleted successfully" });
  });
};
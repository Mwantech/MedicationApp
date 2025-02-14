const express = require("express");
const router = express.Router();
const medicationController = require("../controllers/medicationController");

router.post("/add", medicationController.addMedication);
router.get("/user/:user_id", medicationController.getMedications);
router.get("/:med_id", medicationController.getMedicationById);
router.put("/:med_id", medicationController.updateMedication);
router.delete("/:med_id", medicationController.deleteMedication);

module.exports = router;

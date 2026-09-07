const express = require("express");
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
} = require("../controllers/documentController");

const upload = require("../middleware/documentupload");

const router = express.Router();

router.post("/", upload.single("file"), uploadDocument);

router.get("/", getDocuments);

router.get("/:id/download", downloadDocument);

router.get("/:id", getDocumentById);

router.put("/:id", updateDocument);

router.delete("/:id", deleteDocument);
module.exports = router;
const fs = require("fs");
const Document = require("../models/Document");
const Case = require("../models/Case");
const Audit = require("../models/Audit");

const allowedTypes = [
  "FIR",
  "Investigation Report",
  "Witness Statement",
  "Evidence",
  "Court Order",
  "Final Report",
];

const uploadDocument = async (req, res) => {
  try {
    const {
      caseId,
      name,
      documentType,
      description = "",
    } = req.body;

    if (!caseId || !name || !documentType) {
      return res.status(400).json({
        message: "caseId, name and documentType are required.",
      });
    }

    if (!allowedTypes.includes(documentType)) {
      return res.status(400).json({
        message: "Invalid document type.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Document file is required.",
      });
    }

    const caseExists = await Case.findById(caseId);

    if (!caseExists) {
      fs.unlinkSync(req.file.path);

      return res.status(404).json({
        message: "Case not found.",
      });
    }

    const document = await Document.create({
      caseId,
      name,
      documentType,
      description,
      fileName: req.file.originalname,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user?._id,
    });

    await Audit.create({
      type: "document",
      text: `New document uploaded in ${caseExists.caseNumber || caseId}`,
      accessedBy:
        req.user?.fullName ||
        req.user?.name ||
        req.user?.email ||
        "Unknown",
    });

    return res.status(201).json({
      message: "Document uploaded successfully.",
      document,
    });
  } catch (error) {
    console.error("Upload document error:", error);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: error.message || "Failed to upload document.",
    });
  }
};

const getDocuments = async (req, res) => {
  try {
    const {
      caseId,
      search = "",
      documentType,
    } = req.query;

    const filter = {};

    if (caseId) {
      filter.caseId = caseId;
    }

    if (documentType) {
      filter.documentType = documentType;
    }

    if (search.trim()) {
      filter.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          fileName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const documents = await Document.find(filter)
      .populate("caseId", "caseNumber title")
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      message: "Failed to fetch documents.",
    });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("caseId", "caseNumber title")
      .populate("uploadedBy", "name email");

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    return res.status(200).json({
      document,
    });
  } catch (error) {
    console.error("Get document error:", error);

    return res.status(500).json({
      message: "Failed to fetch document.",
    });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        message: "Document file not found on server.",
      });
    }

    await Audit.create({
      type: "document",
      text: `Document downloaded: ${document.name}`,
      accessedBy:
        req.user?.fullName ||
        req.user?.name ||
        req.user?.email ||
        "Unknown",
    });

    res.download(
      document.filePath,
      document.fileName
    );
  } catch (error) {
    console.error(
      "Download document error:",
      error
    );

    return res.status(500).json({
      message: "Failed to download document.",
    });
  }
};

const updateDocument = async (req, res) => {
  try {
    const {
      name,
      documentType,
      description,
    } = req.body;

    if (
      documentType &&
      !allowedTypes.includes(documentType)
    ) {
      return res.status(400).json({
        message: "Invalid document type.",
      });
    }

    const document = await Document.findById(
      req.params.id
    );

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    if (name !== undefined) {
      document.name = name;
    }

    if (documentType !== undefined) {
      document.documentType = documentType;
    }

    if (description !== undefined) {
      document.description = description;
    }

    await document.save();

    await Audit.create({
      type: "document",
      text: `Document updated: ${document.name}`,
      accessedBy:
        req.user?.fullName ||
        req.user?.name ||
        req.user?.email ||
        "Unknown",
    });

    return res.status(200).json({
      message: "Document updated successfully.",
      document,
    });
  } catch (error) {
    console.error(
      "Update document error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update document.",
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(
      req.params.id
    );

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    const documentName = document.name;

    if (
      document.filePath &&
      fs.existsSync(document.filePath)
    ) {
      fs.unlinkSync(document.filePath);
    }

    await Document.findByIdAndDelete(
      req.params.id
    );

    await Audit.create({
      type: "document",
      text: `Document deleted: ${documentName}`,
      accessedBy:
        req.user?.fullName ||
        req.user?.name ||
        req.user?.email ||
        "Unknown",
    });

    return res.status(200).json({
      message: "Document deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete document error:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete document.",
    });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
};
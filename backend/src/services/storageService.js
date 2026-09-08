/**
 * storageService.js
 * ─────────────────
 * Thin strategy layer that abstracts file storage.
 *
 * Currently supports:
 *   STORAGE_PROVIDER=local  (default) — files saved to uploads/documents/
 *   STORAGE_PROVIDER=S3     (stub)    — placeholder; configure AWS SDK to activate
 *
 * To migrate to S3:
 *   1. `npm install @aws-sdk/client-s3`
 *   2. Fill in the S3 section below.
 *   3. Set STORAGE_PROVIDER=S3 in .env.
 *   Nothing else in the codebase needs to change.
 *
 * Public API
 * ──────────
 *   saveFile(multerFile)   → { storageProvider, storageKey, filePath }
 *   deleteFile(document)   → void
 *   getUrl(document)       → string (URL or absolute path)
 */

const fs   = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL storage implementation
// ─────────────────────────────────────────────────────────────────────────────

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');

// Ensure the directory exists at startup (multer also does this, but belt-and-braces).
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

const localProvider = {
  /**
   * Multer already wrote the file to disk; we just normalise the path info.
   * @param {import('multer').File} multerFile
   * @returns {{ storageProvider: string, storageKey: string, filePath: string }}
   */
  async saveFile(multerFile) {
    // multer diskStorage sets file.path to the absolute path.
    const relativePath = path.relative(process.cwd(), multerFile.path)
      .replace(/\\/g, '/'); // normalise Windows back-slashes

    return {
      storageProvider: 'local',
      storageKey: relativePath, // e.g. "uploads/documents/1234-foo.pdf"
      filePath: multerFile.path,
    };
  },

  /**
   * Delete the physical file.  Silently ignores missing files.
   * @param {{ storageKey: string, filePath: string }} document
   */
  async deleteFile(document) {
    const targetPath = document.filePath || path.join(process.cwd(), document.storageKey);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  },

  /**
   * Returns the absolute path (for res.download()).
   * @param {{ storageKey: string, filePath: string }} document
   * @returns {string}
   */
  getUrl(document) {
    return document.filePath || path.join(process.cwd(), document.storageKey);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// S3 storage implementation (STUB — fill in when ready)
// ─────────────────────────────────────────────────────────────────────────────
// To activate:
//   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
//   Set STORAGE_PROVIDER=S3, AWS_REGION, AWS_ACCESS_KEY_ID,
//       AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET in .env

const s3Provider = {
  async saveFile(/* multerFile */) {
    /*
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const client = new S3Client({ region: process.env.AWS_REGION });
    const key = `documents/${Date.now()}-${multerFile.originalname}`;
    await client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: fs.createReadStream(multerFile.path),
      ContentType: multerFile.mimetype,
    }));
    fs.unlinkSync(multerFile.path); // remove temp local file
    return {
      storageProvider: 'S3',
      storageKey: key,
      filePath: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
    */
    throw new Error('S3 storage provider is not yet configured. Set STORAGE_PROVIDER=local or configure AWS credentials.');
  },

  async deleteFile(/* document */) {
    /*
    const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
    const client = new S3Client({ region: process.env.AWS_REGION });
    await client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: document.storageKey,
    }));
    */
    throw new Error('S3 storage provider is not yet configured.');
  },

  getUrl(document) {
    return document.filePath;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Strategy selector
// ─────────────────────────────────────────────────────────────────────────────

const PROVIDER = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();

const providers = {
  local: localProvider,
  s3: s3Provider,
};

const activeProvider = providers[PROVIDER];

if (!activeProvider) {
  throw new Error(`Unknown STORAGE_PROVIDER "${PROVIDER}". Valid values: ${Object.keys(providers).join(', ')}`);
}

module.exports = activeProvider;

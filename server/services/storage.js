import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Storage directory for uploads
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Save a base64 encoded file
 * @param {string} base64Data - Base64 encoded file data
 * @param {string} filename - Original filename
 * @param {string} subfolder - Subfolder to organize files (vehicles, documents, etc)
 * @returns {Promise<{path: string, url: string}>}
 */
export const saveBase64File = async (base64Data, filename, subfolder = 'general') => {
    try {
        // Create subfolder if it doesn't exist
        const folderPath = path.join(UPLOADS_DIR, subfolder);
        if (!fs.existsSync(folderPath)) {
            await mkdir(folderPath, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const ext = path.extname(filename);
        const uniqueFilename = `${timestamp}_${randomStr}${ext}`;
        const filePath = path.join(folderPath, uniqueFilename);

        // Remove data URL prefix if present
        const base64WithoutPrefix = base64Data.replace(/^data:.*?;base64,/, '');

        // Convert base64 to buffer and save
        const buffer = Buffer.from(base64WithoutPrefix, 'base64');
        await writeFile(filePath, buffer);

        // Return relative path for storage and URL for access
        const relativePath = path.join(subfolder, uniqueFilename);
        const url = `/uploads/${relativePath}`;

        return {
            path: relativePath,
            url,
            size: buffer.length,
        };
    } catch (error) {
        console.error('Error saving file:', error);
        throw new Error('Failed to save file');
    }
};

/**
 * Save a file from a buffer
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} subfolder - Subfolder to organize files
 * @returns {Promise<{path: string, url: string}>}
 */
export const saveFile = async (buffer, filename, subfolder = 'general') => {
    try {
        // Create subfolder if it doesn't exist
        const folderPath = path.join(UPLOADS_DIR, subfolder);
        if (!fs.existsSync(folderPath)) {
            await mkdir(folderPath, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const ext = path.extname(filename);
        const uniqueFilename = `${timestamp}_${randomStr}${ext}`;
        const filePath = path.join(folderPath, uniqueFilename);

        // Save file
        await writeFile(filePath, buffer);

        // Return relative path for storage and URL for access
        const relativePath = path.join(subfolder, uniqueFilename);
        const url = `/uploads/${relativePath}`;

        return {
            path: relativePath,
            url,
            size: buffer.length,
        };
    } catch (error) {
        console.error('Error saving file:', error);
        throw new Error('Failed to save file');
    }
};

/**
 * Delete a file
 * @param {string} relativePath - Relative path to the file
 * @returns {Promise<boolean>}
 */
export const deleteFile = async (relativePath) => {
    try {
        const filePath = path.join(UPLOADS_DIR, relativePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

/**
 * Get file path from relative path
 * @param {string} relativePath - Relative path to the file
 * @returns {string}
 */
export const getFilePath = (relativePath) => {
    return path.join(UPLOADS_DIR, relativePath);
};

export default {
    saveBase64File,
    saveFile,
    deleteFile,
    getFilePath,
};

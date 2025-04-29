import formidable from 'formidable';
import pdf from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to read file as buffer
const readFileAsBuffer = async (filepath) => {
  return await fs.readFile(filepath);
};

// Helper function to extract text from PDF
const extractPDFText = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

// Helper function to extract text from Word document
const extractWordText = async (buffer, mimetype) => {
  try {
    // For now, return an error as Word processing needs additional setup
    throw new Error('Word document processing is not yet implemented');
  } catch (error) {
    throw new Error(`Word extraction failed: ${error.message}`);
  }
};

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Ensure tmp directory exists
    const tmpDir = path.join(process.cwd(), 'tmp');
    await fs.mkdir(tmpDir, { recursive: true });

    // Configure formidable
    const options = {
      uploadDir: tmpDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    };

    // Parse the multipart form data
    const [fields, files] = await new Promise((resolve, reject) => {
      const form = formidable(options);
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Get the uploaded file
    const file = files.file?.[0] || files.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: `Invalid file type. Supported types: ${validTypes.join(', ')}`
      });
    }

    try {
      // Read file buffer
      const buffer = await readFileAsBuffer(file.filepath);

      // Extract text based on file type
      let text;
      if (file.mimetype === 'application/pdf') {
        text = await extractPDFText(buffer);
      } else {
        text = await extractWordText(buffer, file.mimetype);
      }

      // Validate extracted text
      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the file');
      }

      // Clean up the temporary file
      await fs.unlink(file.filepath).catch(console.error);

      // Return success response
      return res.status(200).json({
        success: true,
        text: text.trim()
      });

    } catch (error) {
      // Clean up on error
      if (file?.filepath) {
        await fs.unlink(file.filepath).catch(console.error);
      }

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
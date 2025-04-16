const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors'); // Import cors
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const app = express();
const port = process.env.PORT || 3001; // Use port 3001 to avoid conflict with frontend

// Enable CORS for all routes
app.use(cors());

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure 'uploads' directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
  }
});

const upload = multer({ storage: storage });

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple route for testing
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Route for handling PDF uploads
app.post('/upload', upload.single('pdfFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  console.log('File uploaded:', req.file);
  // Here you would typically save file metadata to a database
  // Construct the URL accessible by the frontend
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ message: 'File uploaded successfully!', fileUrl: fileUrl });
});

// Route for processing PDF pages
app.post('/process-pdf', upload.single('pdfFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
  }

  let selectedPages;
  try {
    // Selected pages are sent as a JSON string array (1-based index)
    selectedPages = JSON.parse(req.body.selectedPages);
    if (!Array.isArray(selectedPages) || selectedPages.length === 0) {
      throw new Error('Páginas selecionadas inválidas ou vazias.');
    }
    // Convert to 0-based index for pdf-lib
    selectedPages = selectedPages.map(page => page - 1);
  } catch (error) {
    console.error('Erro ao analisar páginas selecionadas:', error);
    return res.status(400).json({ message: 'Formato inválido das páginas selecionadas.' });
  }

  try {
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    const newPdfDoc = await PDFDocument.create();
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, selectedPages);
    copiedPages.forEach(page => newPdfDoc.addPage(page));

    const newPdfBytes = await newPdfDoc.save();

    // Define path for the new PDF
    const outputFilename = `processed-${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, 'uploads', outputFilename);
    fs.writeFileSync(outputPath, newPdfBytes);

    // Clean up the original uploaded file
    fs.unlinkSync(req.file.path);

    // Construct the URL accessible by the frontend
    const fileUrl = `/uploads/${outputFilename}`;
    res.json({ message: 'PDF processado com sucesso!', fileUrl: fileUrl });

  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    // Clean up the uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Erro interno do servidor ao processar o PDF.' });
  }
});

// Create uploads directory if it doesn't exist
// const fs = require('fs'); // fs is already required above
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
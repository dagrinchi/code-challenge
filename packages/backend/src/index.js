import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'code challenge api',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      files: '/files/data',
    },
    description: {
      files: 'Obtiene y procesa todos los archivos CSV disponibles',
    }
  });
});

const EXTERNAL_API_BASE = 'https://echo-serv.tbxnet.com';
const BEARER_TOKEN = 'aSuperSecretKey';

async function fetchCsvTextFromExternalAPI(endpoint) {
  try {
    const response = await fetch(`${EXTERNAL_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`responded with status: ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    console.error('fetch error:', error);
    throw error;
  }
}

function parseFileResponse(filename, csvData) {
  try {
    if (!csvData || csvData.trim() === '') {
      console.log(`Archivo vacío: ${filename}`);
      return {
        file: filename,
        lines: []
      };
    }

    const lines = csvData.trim().split('\n');
    
    const dataLines = lines.slice(1);
    
    const validLines = [];
    
    dataLines.forEach((line, index) => {
      if (!line.trim()) return; 
      
      const parts = line.split(',');
      
      if (parts.length >= 4) {
        const text = parts[1]?.trim();
        const numberStr = parts[2]?.trim();
        const hex = parts[3]?.trim();
        
        if (text && numberStr && !isNaN(parseInt(numberStr))) {
          validLines.push({
            text: text,
            number: parseInt(numberStr),
            hex: hex || ''
          });
        } else {
          console.log(`Línea inválida en ${filename} (línea ${index + 2}): ${line}`);
        }
      } else {
        console.log(`Línea con datos insuficientes en ${filename} (línea ${index + 2}): ${line}`);
      }
    });

    return {
      file: filename,
      lines: validLines
    };
    
  } catch (error) {
    console.error(`Error parseando archivo ${filename}:`, error);
    return {
      file: filename,
      lines: []
    };
  }
}

app.get('/files/data', async (req, res) => {
  try {
    const response = await fetch(`${EXTERNAL_API_BASE}/v1/secret/files`, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error al obtener lista de archivos: ${response.status}`);
    }
    
    const data = await response.json();
    const files = data.files || [];
    const processedFiles = [];

    for (const filename of files) {
      if (filename && filename.endsWith('.csv')) {
        try {
          console.log(`Procesando archivo: ${filename}`);
          const csvData = await fetchCsvTextFromExternalAPI(`/v1/secret/file/${filename}`);
          const parsedFile = parseFileResponse(filename, csvData);
          
          processedFiles.push(parsedFile);
          
          console.log(`✓ Archivo ${filename} procesado: ${parsedFile.lines.length} líneas válidas`);
          
        } catch (error) {
          console.error(`✗ Error procesando archivo ${filename}:`, error.message);
          
          processedFiles.push({
            file: filename,
            lines: [],
            error: `Error al descargar: ${error.message}`
          });
        }
      }
    }
    
    res.json({
      totalFiles: files.length,
      processedFiles: processedFiles.length,
      files: processedFiles
    });
    
  } catch (error) {
    console.error('Error general al obtener archivos:', error);
    res.status(500).json({
      error: 'Error al obtener la lista de archivos',
      message: error.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export { app, server };
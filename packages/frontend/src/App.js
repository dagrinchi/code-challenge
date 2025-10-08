import React, { useState, useEffect } from 'react';
import { Container, Table, Alert, Spinner } from 'react-bootstrap';
import config from './config';

const App = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.apiUrl}/files/data`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        const allLines = [];
        data.files.forEach(file => {
          if (file.lines && file.lines.length > 0) {
            file.lines.forEach(line => {
              allLines.push({
                fileName: file.file,
                text: line.text,
                number: line.number,
                hex: line.hex
              });
            });
          }
        });

        setFiles(allLines);
        setError(null);
      } catch (err) {
        console.error('Error al obtener los datos:', err);
        setError(`Error al obtener los datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ backgroundColor: '#ff6b6b', minHeight: '100vh', padding: 0 }}>
      <div style={{
        backgroundColor: '#ff6b6b',
      }}>
        <h1 style={{
          margin: 0, color: 'white',
          padding: '10px 20px',
          fontWeight: 'bold',
          fontSize: '18px'
        }}>React Test App</h1>
      </div>

      <Container fluid style={{ padding: '20px', backgroundColor: 'white', margin: 0 }}>
        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
            <p className="mt-2">Cargando datos...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Table striped bordered hover size="sm">
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th>File Name</th>
                <th>Text</th>
                <th>Number</th>
                <th>Hex</th>
              </tr>
            </thead>
            <tbody>
              {files.map((item, index) => (
                <tr key={index}>
                  <td>{item.fileName}</td>
                  <td>{item.text}</td>
                  <td>{item.number}</td>
                  <td>{item.hex}</td>
                </tr>
              ))}
              {files.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Container>
    </div>
  );
};

export default App;
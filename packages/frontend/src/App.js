import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Table, Alert, Spinner, Form, Row, Col, Button } from 'react-bootstrap';
import { fetchFileData, setSelectedFileName, clearError } from './store/filesSlice';

const App = () => {
  const dispatch = useDispatch();
  const {
    filesData,
    selectedFileName,
    loading,
    error,
    dataLoading,
    dataError
  } = useSelector((state) => state.files);

  useEffect(() => {
    dispatch(fetchFileData());
  }, [dispatch]);

  const handleFileFilter = () => {
    dispatch(fetchFileData(selectedFileName));
  };

  const handleClearFilter = () => {
    dispatch(setSelectedFileName(''));
    dispatch(fetchFileData(''));
  };

  const handleFileNameChange = (e) => {
    dispatch(setSelectedFileName(e.target.value));
  };

  const transformedData = filesData?.files ? filesData.files.flatMap(file =>
    file.lines?.map(line => ({
      fileName: file.file,
      text: line.text,
      number: line.number,
      hex: line.hex
    })) || []
  ) : [];

  const filesList = filesData?.files ? filesData.files.filter(file => file.lines?.length > 0).map(file => file.file) : [];
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
        <Row className="mb-4">
          <Col md={8}>
            <Form.Group>
              <Form.Select
                value={selectedFileName}
                onChange={handleFileNameChange}
                disabled={loading}
              >
                <option value="">Todos los archivos</option>
                {filesList?.map((file, index) => (
                  <option key={index} value={file}>
                    {file}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end">
            <Button
              variant="primary"
              onClick={handleFileFilter}
              disabled={dataLoading}
              className="me-2"
            >
              {dataLoading ? 'Cargando...' : 'Aplicar filtro'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleClearFilter}
              disabled={dataLoading}
            >
              Limpiar filtro
            </Button>
          </Col>
        </Row>

        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
            <p className="mt-2">Cargando lista...</p>
          </div>
        )}

        {dataLoading && (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando datos...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {dataError && (
          <Alert variant="warning" dismissible onClose={() => dispatch(clearError())}>
            <strong>Error:</strong> {dataError}
          </Alert>
        )}

        {!loading && !dataLoading && (
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
              {transformedData.map((item, index) => (
                <tr key={index}>
                  <td>{item.fileName}</td>
                  <td>{item.text}</td>
                  <td>{item.number}</td>
                  <td>{item.hex}</td>
                </tr>
              ))}
              {transformedData.length === 0 && !dataLoading && (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    {selectedFileName ? 'No data found for selected file' : 'No data available'}
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
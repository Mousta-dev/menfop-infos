import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Button } from 'react-bootstrap';
import api from '../api';
import { Link } from 'react-router-dom';

const ReportsList = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports.');
    }
  };

  return (
    <div>
      <h1>Liste des Rapports</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      {reports.length === 0 ? (
        <Alert variant="info">Aucun rapport trouvé. Créez un nouveau rapport dans la section "Rapport".</Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Contenu (Extrait)</th>
                  <th>Date de Création</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.id}</td>
                    <td>{report.content.substring(0, 100)}...</td> {/* Show first 100 chars */}
                    <td>{new Date(report.created_at).toLocaleString()}</td>
                    <td>
                      <Button as={Link} to={`/reports/${report.id}`} variant="info" size="sm">
                        Voir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ReportsList;

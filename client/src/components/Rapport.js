import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import api from '../api';
import { Link } from 'react-router-dom'; // Import Link

const Rapport = () => {
  const [textInput, setTextInput] = useState('');
  const [reportId, setReportId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSaveReport = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setReportId(null); // Reset report ID

    if (!textInput.trim()) {
      setError('Please enter some text to save as a report.');
      return;
    }

    try {
      const response = await api.post('/reports', { content: textInput });
      setSuccess(`Report saved successfully! ID: ${response.data.data.id}`);
      setReportId(response.data.data.id);
      setTextInput(''); // Clear the input field
    } catch (err) {
      console.error('Error saving report:', err);
      setError('Failed to save report.');
    }
  };

  return (
    <div>
      <h1>Rapport</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {reportId && (
        <Alert variant="info">
          View your report: <Link to={`/reports/${reportId}`}>Report #{reportId}</Link> or <Link to="/reports">All Reports</Link>
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Ajouter du texte et évaluer</Card.Title>
          <Form onSubmit={handleSaveReport}>
            <Form.Group className="mb-3">
              <Form.Label>Entrez votre texte ici:</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Commencez à taper..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Ajouter et Enregistrer le Rapport
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Rapport;

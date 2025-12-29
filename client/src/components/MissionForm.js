import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { missionsApi } from '../api';
import { Link } from 'react-router-dom';

const MissionForm = () => {
  const [missionName, setMissionName] = useState('');
  const [missionDescription, setMissionDescription] = useState('');
  const [missionStatus, setMissionStatus] = useState('pending');
  const [missionId, setMissionId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSaveMission = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setMissionId(null);

    if (!missionName.trim()) {
      setError('Please enter a mission name.');
      return;
    }

    try {
      const response = await missionsApi.createMission({
        name: missionName,
        description: missionDescription,
        status: missionStatus,
      });
      setSuccess(`Mission saved successfully! ID: ${response.data.data.id}`);
      setMissionId(response.data.data.id);
      setMissionName(''); // Clear the input fields
      setMissionDescription('');
      setMissionStatus('pending');
    } catch (err) {
      console.error('Error saving mission:', err);
      setError('Failed to save mission.');
    }
  };

  return (
    <div>
      <h1>Nouvelle Mission</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {missionId && (
        <Alert variant="info">
          View your mission: <Link to={`/missions/${missionId}`}>Mission #{missionId}</Link> or <Link to="/missions">All Missions</Link>
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Ajouter une nouvelle mission</Card.Title>
          <Form onSubmit={handleSaveMission}>
            <Form.Group className="mb-3">
              <Form.Label>Nom de la mission:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrez le nom de la mission"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Description de la mission"
                value={missionDescription}
                onChange={(e) => setMissionDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Statut:</Form.Label>
              <Form.Control
                as="select"
                value={missionStatus}
                onChange={(e) => setMissionStatus(e.target.value)}
              >
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              Ajouter et Enregistrer la Mission
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MissionForm;

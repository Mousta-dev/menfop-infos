import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Button } from 'react-bootstrap';
import { missionsApi } from '../api'; // Use the new missionsApi
import { Link } from 'react-router-dom';

const MissionsList = () => {
  const [missions, setMissions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await missionsApi.getMissions(); // Use getMissions from missionsApi
      setMissions(response.data.data);
    } catch (err) {
      console.error('Error fetching missions:', err);
      setError('Failed to fetch missions.');
    }
  };

  return (
    <div>
      <h1>Liste des Missions</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      {missions.length === 0 ? (
        <Alert variant="info">Aucune mission trouvée. Créez une nouvelle mission.</Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Statut</th>
                  <th>Date de Création</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {missions.map((mission) => (
                  <tr key={mission.id}>
                    <td>{mission.id}</td>
                    <td>{mission.name}</td>
                    <td>{mission.description ? mission.description.substring(0, 100) : ''}...</td>
                    <td>{mission.status}</td>
                    <td>{new Date(mission.created_at).toLocaleString()}</td>
                    <td>
                      {/* You can add a view/edit button here if needed */}
                      <Button as={Link} to={`/missions/${mission.id}`} variant="info" size="sm">
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

export default MissionsList;

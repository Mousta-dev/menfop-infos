import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import api from '../api';

const NewEquipment = () => {
  const [equipmentName, setEquipmentName] = useState('');
  const [selectedEstablishment, setSelectedEstablishment] = useState('');
  const [establishments, setEstablishments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      const response = await api.get('/establishments');
      setEstablishments(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedEstablishment(response.data.data[0].id); // Set default selected establishment
      }
    } catch (err) {
      console.error('Error fetching establishments:', err);
      setError('Failed to load establishments.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!equipmentName.trim() || !selectedEstablishment) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      await api.post('/equipment', {
        name: equipmentName,
        status: 'new', // Default status for new equipment
        establishment_id: selectedEstablishment,
      });
      setSuccess('New equipment added successfully!');
      setEquipmentName('');
      // Optionally reset selectedEstablishment or keep it as is
    } catch (err) {
      console.error('Error adding new equipment:', err);
      setError('Failed to add new equipment.');
    }
  };

  return (
    <div>
      <h1>Add New Equipment</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Equipment Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter equipment name"
            value={equipmentName}
            onChange={(e) => setEquipmentName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Establishment</Form.Label>
          <Form.Select
            value={selectedEstablishment}
            onChange={(e) => setSelectedEstablishment(e.target.value)}
          >
            {establishments.map((establishment) => (
              <option key={establishment.id} value={establishment.id}>
                {establishment.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit">
          Add Equipment
        </Button>
      </Form>
    </div>
  );
};

export default NewEquipment;

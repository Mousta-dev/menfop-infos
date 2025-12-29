import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Modal } from 'react-bootstrap';
import api from '../api';

const Establishments = () => {
  const [establishments, setEstablishments] = useState([]);
  const [newEstablishmentName, setNewEstablishmentName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEstablishment, setCurrentEstablishment] = useState(null);
  const [editedEstablishmentName, setEditedEstablishmentName] = useState('');

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      const response = await api.get('/establishments');
      setEstablishments(response.data.data);
    } catch (err) {
      console.error('Error fetching establishments:', err);
      setError('Failed to fetch establishments.');
    }
  };

  const handleAddEstablishment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newEstablishmentName.trim()) {
      setError('Establishment name cannot be empty.');
      return;
    }
    try {
      await api.post('/establishments', { name: newEstablishmentName });
      setSuccess('Establishment added successfully!');
      setNewEstablishmentName('');
      fetchEstablishments(); // Refresh the list
    } catch (err) {
      console.error('Error adding establishment:', err);
      setError('Failed to add establishment. It might already exist or there was a server error.');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    if (window.confirm('Are you sure you want to delete this establishment?')) {
      try {
        await api.delete(`/establishments/${id}`);
        setSuccess('Establishment deleted successfully!');
        fetchEstablishments(); // Refresh the list
      } catch (err) {
        console.error('Error deleting establishment:', err);
        setError('Failed to delete establishment. It might have associated equipment.');
      }
    }
  };

  const handleEdit = (establishment) => {
    setCurrentEstablishment(establishment);
    setEditedEstablishmentName(establishment.name);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentEstablishment(null);
    setEditedEstablishmentName('');
    setError(''); // Clear error on close
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!editedEstablishmentName.trim()) {
      setError('Establishment name cannot be empty.');
      return;
    }
    try {
      await api.put(`/establishments/${currentEstablishment.id}`, { name: editedEstablishmentName });
      setSuccess('Establishment updated successfully!');
      handleCloseEditModal();
      fetchEstablishments(); // Refresh the list
    } catch (err) {
      console.error('Error updating establishment:', err);
      setError('Failed to update establishment. It might already exist or there was a server error.');
    }
  };

  return (
    <div>
      <h1>Establishments</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleAddEstablishment} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Add New Establishment</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter establishment name"
            value={newEstablishmentName}
            onChange={(e) => setNewEstablishmentName(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Add Establishment
        </Button>
      </Form>

      <h2>Current Establishments</h2>
      {establishments.length === 0 ? (
        <p>No establishments found. Add some above!</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {establishments.map((establishment) => (
              <tr key={establishment.id}>
                <td>{establishment.id}</td>
                <td>{establishment.name}</td>
                <td>
                  <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(establishment)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(establishment.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Edit Establishment Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Establishment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSaveEdit}>
            <Form.Group className="mb-3">
              <Form.Label>Establishment Name</Form.Label>
              <Form.Control
                type="text"
                value={editedEstablishmentName}
                onChange={(e) => setEditedEstablishmentName(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Establishments;
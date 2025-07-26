import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import axios from 'axios';

const DoctorSuggest = () => {
  const [symptoms, setSymptoms] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  // Load CSV on mount
  useEffect(() => {
    Papa.parse('/liaquat_doctors.csv', {
      download: true,
      header: true,
      complete: (result) => {
        setAllDoctors(result.data);
      },
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const symptomsArray = symptoms.split(',').map((s) => s.trim());

    try {
      const response = await axios.post('http://localhost:3001/api/predict', {
        symptoms: symptomsArray,
      });

      const result = response.data;
      setAiResult(result);

      // Match doctors from local CSV based on specialty
      const filtered = allDoctors.filter((doc) =>
        doc.specialization?.toLowerCase().includes(result.doctor.toLowerCase())
      );

      setFilteredDoctors(filtered);
    } catch (error) {
      console.error('Prediction error:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Doctor Suggestion</h2>

      <form onSubmit={handleSubmit} className="d-flex mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Enter symptoms (comma-separated)"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <button type="submit" className="btn btn-primary ms-2">Submit</button>
      </form>

      {aiResult && (
        <div className="mb-4">
          <h5><strong>Disease Prediction:</strong> {aiResult.disease}</h5>
          <h6><strong>Suggested Doctor Type:</strong> {aiResult.doctor}</h6>
        </div>
      )}

      <div className="row">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc, index) => (
            <div className="col-md-4 mb-3" key={index}>
              <div className="card h-100">
                <img
                  src={doc.image || 'https://via.placeholder.com/150'}
                  className="card-img-top"
                  alt={doc.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{doc.name}</h5>
                  <p className="card-text"><strong>Specialization:</strong> {doc.specialization}</p>
                  <p className="card-text"><strong>Hospital:</strong> {doc.hospital}</p>
                  <p className="card-text"><strong>Experience:</strong> {doc.experience}</p>
                </div>
              </div>
            </div>
          ))
        ) : aiResult ? (
          <p>No matching doctors found.</p>
        ) : null}
      </div>
    </div>
  );
};

export default DoctorSuggest;

import React, { useState } from 'react';
import axios from 'axios';

const DoctorSuggest = () => {
  const [symptoms, setSymptoms] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const symptomsArray = symptoms.split(',').map((s) => s.trim());

    try {
      const response = await axios.post('http://localhost:3001/api/predict', {
        symptoms: symptomsArray,
      });

      const result = response.data;
      setAiResult(result);
      setFilteredDoctors(result.doctors);
    } catch (error) {
      console.error('Prediction error:', error);
    }
  };

  const startListening = () => {
    setIsListening(true);
    // Your speech-to-text logic goes here
    // Example: setSymptoms('nausea, chest pain');
  };

  return (
    <div className="container py-5">
      {/* Title */}
      <div className="text-center mb-5">
        <h1 className="fw-bold">🩺 Doctor Recommendation</h1>
        <p className="text-muted">Enter your symptoms to get disease prediction and suggested doctors.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="d-flex flex-wrap gap-3 justify-content-center mb-4">
        <div className="position-relative" style={{ minWidth: '300px', flexGrow: 1 }}>
          <input
            type="text"
            className="form-control form-control-lg ps-4 pe-5 rounded-pill shadow-sm"
            placeholder="Type symptoms (e.g. chest pain, nausea)..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <span
            className="position-absolute top-50 end-0 translate-middle-y pe-3 text-primary"
            style={{ cursor: 'pointer' }}
            onClick={startListening}
          >
            <i className={`bi ${isListening ? 'bi-mic-fill text-danger' : 'bi-mic'} fs-5`}></i>
          </span>
        </div>

        <button type="submit" className="btn btn-primary btn-lg px-4 rounded-pill shadow-sm">
          Get Suggestion
        </button>
      </form>

      {/* Prediction Result */}
      {aiResult && (
        <div className="alert alert-info border-0 rounded-4 shadow-sm p-4 mb-5">
          <h5 className="mb-3">💡 Prediction Result</h5>
          <p className="mb-1"><strong>Disease:</strong> {aiResult.disease}</p>
          <p><strong>Suggested Doctor:</strong> {aiResult.doctor}</p>
        </div>
      )}

      {/* Doctors List */}
      <div className="row">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc, index) => (
            <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={index}>
              <div className="card h-100 border-0 shadow rounded-4 hover-shadow">
                <img
                  src={doc.Image || 'https://via.placeholder.com/350x220?text=Doctor'}
                  className="card-img-top rounded-top-4"
                  alt={doc.Name}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold text-primary">{doc.Name}</h5>
                  <p className="text-muted mb-1"><strong>Designation:</strong> {doc.Designation}</p>
                  <p className="text-muted mb-1"><strong>Hospital:</strong> {doc.hospital}</p>
                  <p className="text-muted"><strong>Experience:</strong> {doc.experience}</p>
                </div>
              </div>
            </div>
          ))
        ) : aiResult ? (
          <div className="text-center text-muted mt-5">
            <p>No matching doctors found.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DoctorSuggest;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const DoctorSuggest = () => {
  const [symptoms, setSymptoms] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [queryHistory, setQueryHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [listening, setListening] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const navigate = useNavigate();
  let recognition;

  useEffect(() => {
    const user = localStorage.getItem('user_information');
    if (!user) {
      navigate('/login');
    } else {
      const userData = JSON.parse(user);
      setUserName(userData.name || 'User');
      setUserEmail(userData.email);
      const savedHistory = JSON.parse(localStorage.getItem(`history_${userData.email}`)) || [];
      setQueryHistory(savedHistory);
    }
  }, []);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.lang = 'ur-PK';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        setSymptoms(result);
      };

      recognition.onend = () => {
        setListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognition && !listening) {
      recognition.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognition && listening) {
      recognition.stop();
      setListening(false);
    }
  };

  const toggleMic = () => {
    listening ? stopListening() : startListening();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const symptomsArray = symptoms.split(',').map((s) => s.trim());

    try {
      const response = await axios.post('http://localhost:3001/api/predict', {
        symptoms: symptomsArray,
      });

      const result = response.data;
      setAiResult(result);
      setFilteredDoctors(result.doctors || []);

      // Remove duplicate query (case insensitive match)
      const today = new Date().toDateString();
      const updatedHistory = [
        { query: symptoms, date: new Date().toISOString() },
        ...queryHistory.filter((item) => item.query.toLowerCase() !== symptoms.toLowerCase() || new Date(item.date).toDateString() !== today),
      ].slice(0, 10);

      setQueryHistory(updatedHistory);
      if (userEmail) {
        localStorage.setItem(`history_${userEmail}`, JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Prediction error:', error);
    }
  };

  useEffect(() => {
    if (symptoms.length > 0) {
      const filtered = queryHistory
        .filter((item) => item.query.toLowerCase().includes(symptoms.toLowerCase()))
        .map((item) => item.query);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [symptoms, queryHistory]);
  const clearHistory = () => {
    if (userEmail) {
      localStorage.removeItem(`history_${userEmail}`);
    }
    setQueryHistory([]);
  };
  return (
    <div style={{ minHeight: '100vh', background: '#eaf0f7', padding: '40px 20px' }}>
      <Navbar />
      <div className="text-center mb-5">
        <h2 className="fw-bold">Doctor Recommendation</h2>
        <p className="text-secondary">Enter or speak symptoms to get a prediction and doctor suggestion.</p>
      </div>

      <form onSubmit={handleSubmit} className="d-flex align-items-center justify-content-center gap-3 flex-wrap mb-3">
        <div className="position-relative" style={{ width: '320px' }}>
          <input
            type="text"
            className="form-control rounded-pill ps-4 pe-5 shadow-sm"
            placeholder="Type or speak symptoms..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <span
            className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted"
            style={{ cursor: 'pointer' }}
            onClick={toggleMic}
          >
            <i className={`bi ${listening ? 'bi-mic-fill text-danger' : 'bi-mic'} fs-5`} />
          </span>

          {suggestions.length > 0 && (
            <ul className="list-group position-absolute w-100 mt-2 shadow-sm" style={{ zIndex: 10 }}>
              {suggestions.map((sug, idx) => (
                <li
                  key={idx}
                  className="list-group-item list-group-item-action"
                  onClick={() => setSymptoms(sug)}
                  style={{ cursor: 'pointer' }}
                >
                  {sug}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary rounded-pill shadow-sm"
          style={{ height: '40px', padding: '0 24px', fontSize: '15px' }}
        >
          Suggest
        </button>
      </form>

      {aiResult && (
        <div className="text-center mb-5">
          <div className="border rounded-4 shadow-sm p-4 mx-auto bg-white" style={{ maxWidth: '600px' }}>
            <h5 className="fw-semibold mb-2">Prediction Result</h5>
            <p className="mb-1"><strong>Disease:</strong> {aiResult.disease}</p>
            <p><strong>Suggested Doctor:</strong> {aiResult.doctor}</p>
          </div>
        </div>
      )}

      <div className="row justify-content-center">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc, idx) => (
            <div key={idx} className="col-lg-3 col-md-4 col-sm-6 mb-4">
              <div className="card h-100 border-0 shadow-sm rounded-4">
                <img
                  src={doc.Image || 'https://via.placeholder.com/300x200?text=Doctor'}
                  className="card-img-top rounded-top-4"
                  alt={doc.Name}
                  style={{ height: '180px', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title fw-bold text-primary">{doc.Name}</h5>
                    <p className="mb-1 text-muted"><strong>Designation:</strong> {doc.Designation}</p>
                    <p className="text-muted"><strong>Hospital:</strong> {doc.Hospital}</p>
                  </div>
                  <a
                    href={doc['Details Link']}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary rounded-pill mt-3"
                    style={{ fontSize: '14px' }}
                  >
                    See Details
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : aiResult ? (
          <div className="text-center text-muted mt-4">No matching doctors found.</div>
        ) : null}
      </div>

       {/* Query History Section */}
       {queryHistory.length > 0 && (
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold mb-0">Previous Queries:</h6>
            <button onClick={clearHistory} className="btn btn-sm btn-outline-danger rounded-pill px-3">
              Clear History
            </button>
          </div>

          <ul className="list-group shadow-sm rounded-4">
            {queryHistory.map((item, idx) => (
              <li key={idx} className="list-group-item d-flex justify-content-between">
                {item.query}
                <span className="text-muted small">{new Date(item.date).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DoctorSuggest;

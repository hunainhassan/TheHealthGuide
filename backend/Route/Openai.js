const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const router = express.Router();

// Roman Urdu → English mapping
const romanToEnglish = {
  'sar dard': 'headache',
  'bukhar': 'fever',
  'khansi': 'cough',
  'naksir': 'nosebleed',
  'gardan dard': 'sore throat',
  'zukaam': 'runny nose',
  'chisak': 'sneezing',
  'thakan': 'fatigue',
  'mehsoos nahi ho raha': 'loss of taste',
  'roshni se chubhan': 'sensitivity to light',
  'matli': 'nausea',
  'halki sardard': 'migraine',
  'pet dard': 'stomach ache',
  'ubkaai': 'vomiting',
  'seene mein jalan': 'heartburn',
  'kabz': 'constipation',
  'daanth dard': 'toothache',
};

// Rule-based disease logic
const rules = [
  {
    disease: 'Common Cold',
    symptoms: ['cough', 'sneezing', 'runny nose', 'sore throat'],
    doctor: 'General Physician',
  },
  {
    disease: 'Flu',
    symptoms: ['fever', 'chills', 'body ache', 'fatigue', 'cough'],
    doctor: 'General Physician',
  },
  {
    disease: 'COVID-19',
    symptoms: ['fever', 'dry cough', 'loss of taste', 'fatigue'],
    doctor: 'Infectious Disease Specialist',
  },
  {
    disease: 'Migraine',
    symptoms: ['headache', 'nausea', 'sensitivity to light'],
    doctor: 'Neurologist',
  },
  {
    disease: 'Pregnancy',
    symptoms: ['missed period', 'nausea', 'fatigue'],
    doctor: 'Gynecologist',
  },
  {
    disease: 'Teething (Child)',
    symptoms: ['fever', 'irritability', 'drooling'],
    doctor: 'Pediatrician',
  },
];

// Predict disease based on rules
function predictDisease(userSymptoms) {
  const translated = userSymptoms.map(s => romanToEnglish[s.toLowerCase().trim()] || s.toLowerCase().trim());

  let bestMatch = null;
  let maxMatches = 0;

  for (const rule of rules) {
    const matched = rule.symptoms.filter(sym => translated.includes(sym));
    if (matched.length > maxMatches && matched.length >= 2) {
      bestMatch = rule;
      maxMatches = matched.length;
    }
  }

  return bestMatch || { disease: 'Unknown', doctor: 'General Physician' };
}

// Load and filter CSV
function filterDoctorsBySpecialty(specialty, callback) {
  const filePath = path.join(__dirname, '..', 'liaquat_doctors.csv');
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      if (row.speciality?.toLowerCase().includes(specialty.toLowerCase())) {
        results.push(row);
      }
    })
    .on('end', () => {
      callback(results);
    })
    .on('error', (err) => {
      console.error('CSV read error:', err);
      callback([]);
    });
}

// POST route
router.post('/predict', (req, res) => {
  const { symptoms } = req.body;

  if (!symptoms || !Array.isArray(symptoms)) {
    return res.status(400).json({ error: 'symptoms must be an array' });
  }

  const prediction = predictDisease(symptoms);

  filterDoctorsBySpecialty(prediction.doctor, (doctors) => {
    res.json({
      disease: prediction.disease,
      doctor: prediction.doctor,
      doctors: doctors,
    });
  });
});

module.exports = router;

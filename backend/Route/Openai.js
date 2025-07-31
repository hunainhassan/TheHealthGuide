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
  'kaan dard': 'ear pain',
  'rela': 'discharge',
  'soojan': 'swelling',
  'sunai nahi de raha': 'hearing loss',
};

// Rule-based disease logic
const rules = [
  { disease: 'Common Cold', symptoms: ['cough', 'sneezing', 'runny nose', 'sore throat'], doctor: 'General Physician' },
  { disease: 'Flu', symptoms: ['fever', 'chills', 'body ache', 'fatigue', 'cough'], doctor: 'General Physician' },
  { disease: 'COVID-19', symptoms: ['fever', 'dry cough', 'loss of taste', 'fatigue'], doctor: 'Infectious Disease Specialist' },
  { disease: 'Migraine', symptoms: ['headache', 'nausea', 'sensitivity to light'], doctor: 'Neurologist' },
  { disease: 'Pregnancy', symptoms: ['missed period', 'nausea', 'fatigue'], doctor: 'Obstetrics and Gynaecology' },
  { disease: 'Teething (Child)', symptoms: ['fever', 'irritability', 'drooling'], doctor: 'Pediatrician' },
  { disease: 'Gastroenteritis', symptoms: ['nausea', 'vomiting', 'diarrhea', 'stomach ache'], doctor: 'Gastroenterologist' },
  { disease: 'Dengue', symptoms: ['fever', 'body ache', 'headache', 'nosebleed'], doctor: 'Infectious Disease Specialist' },
  { disease: 'Typhoid', symptoms: ['fever', 'fatigue', 'stomach ache', 'loss of appetite'], doctor: 'General Physician' },
  { disease: 'Sinusitis', symptoms: ['headache', 'runny nose', 'facial pain', 'sore throat'], doctor: 'ENT Specialist' },
  { disease: 'Asthma', symptoms: ['cough', 'shortness of breath', 'chest tightness', 'wheezing'], doctor: 'Pulmonologist' },
  { disease: 'Diabetes', symptoms: ['fatigue', 'frequent urination', 'increased thirst', 'weight loss'], doctor: 'Endocrinologist' },
  { disease: 'Hypertension', symptoms: ['headache', 'dizziness', 'blurred vision', 'chest pain'], doctor: 'Cardiologist' },
  { disease: 'Acid Reflux (GERD)', symptoms: ['heartburn', 'chest pain', 'nausea', 'sore throat'], doctor: 'Gastroenterologist' },
  { disease: 'Tooth Infection', symptoms: ['toothache', 'swelling', 'fever', 'bad breath'], doctor: 'Dentist' },
  { disease: 'Ear Infection', symptoms: ['ear pain', 'fever', 'hearing loss', 'discharge'], doctor: 'ENT Specialist' },
];

function predictDisease(userSymptoms) {
  const translated = userSymptoms.map(s =>
    romanToEnglish[s.toLowerCase().trim()] || s.toLowerCase().trim()
  );

  let bestMatch = null;
  let maxMatches = 0;

  for (const rule of rules) {
    const matched = rule.symptoms.filter(sym => translated.includes(sym));
    const matchCount = matched.length;

    if (matchCount > maxMatches) {
      bestMatch = rule;
      maxMatches = matchCount;
    }
  }

  // ✅ Only return if at least 2 symptoms match
  if (bestMatch && maxMatches >= 2) {
    return bestMatch;
  } else {
    return { disease: 'Unknown', doctor: 'General Physician' };
  }
}




// Load doctors from CSV
function filterDoctorsBySpecialty(specialty, callback) {
  const filePath = path.join(__dirname, '..', 'liaquat_doctors.csv');
  const results = [];

  const synonyms = {
    'pediatrician': ['pediatrician', 'child specialist', 'pediatrics'],
    'neurologist': ['neurologist', 'brain specialist'],
    'general physician': ['general physician', 'gp', 'physician'],
    'infectious disease specialist': ['infectious disease specialist', 'infection specialist'],
    'obstetrics and gynaecology': ['gynecologist', 'obstetrician', 'ob-gyn'],
    'gastroenterologist': ['gastroenterologist', 'stomach specialist'],
    'dentist': ['dentist', 'dental'],
    'ent specialist': ['ent', 'ear nose throat'],
    'pulmonologist': ['pulmonologist', 'chest specialist'],
    'endocrinologist': ['endocrinologist', 'diabetes specialist'],
    'cardiologist': ['cardiologist', 'heart specialist'],
  };

  const predictedSpecialty = specialty.toLowerCase().trim();
  const keywords = synonyms[predictedSpecialty] || [predictedSpecialty];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      const docSpecialty = row.Designation?.toLowerCase().trim();
      if (docSpecialty && keywords.some(keyword => docSpecialty.includes(keyword))) {
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
      doctors,
    });
  });
});

module.exports = router;

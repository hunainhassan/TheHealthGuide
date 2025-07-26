import React, { useEffect, useState } from "react";
import Papa from "papaparse";

function LiaquatDoctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch("/liaquat_doctors.csv")
      .then((res) => res.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log("Parsed doctors:", results.data); // 👈 See this in browser console
            setDoctors(results.data);
          },
        });
      });
  }, []);
  

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Liaquat National Doctors</h2>
      <div className="row">
        {doctors.map((doc, index) => (
          <div className="col-md-4 mb-4" key={index}>
            <div className="card h-100 shadow-sm">
              <img
                src={doc.Image}
                className="card-img-top"
                alt={doc.Name}
                onError={(e) => {
                  e.target.src = "/fallback.jpg"; // optional
                }}
              />
              <div className="card-body">
                <h5 className="card-title">{doc.Name}</h5>
                <p className="card-text">{doc.Designation}</p>
              </div>
              {doc["Details Link"] && (
                <div className="card-footer">
                  <a
                    href={doc["Details Link"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LiaquatDoctors;

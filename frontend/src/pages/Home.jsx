import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicEmergenciesToday } from '../api/EmergencyApi';
import { getHospitals } from '../api/HospitalApi';
import './home.css';

const Home = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loadingEmergencies, setLoadingEmergencies] = useState(true);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  useEffect(() => {
    const fetchTodayEmergencies = async () => {
      try {
        const response = await getPublicEmergenciesToday();
        if (response.data && response.data.success) {
          setEmergencies(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch public emergency requests:', error);
      } finally {
        setLoadingEmergencies(false);
      }
    };

    const fetchPublicHospitals = async () => {
      try {
        const response = await getHospitals();
        if (Array.isArray(response.data)) {
          setHospitals(response.data);
        } else if (response.data && response.data.success) {
          setHospitals(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
      } finally {
        setLoadingHospitals(false);
      }
    };

    fetchTodayEmergencies();
    fetchPublicHospitals();
  }, []);

  // Formatting date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '', time: '' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="landing-page">
      {/* 9. Navigation Bar */}
      <nav className="landing-navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="brand-icon">🩸</span>
            <span className="brand-text">LifeLink</span>
          </div>
          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#hospitals">Hospitals</a>
            <a href="#emergencies">Emergency Requests</a>
            <a href="#about">About</a>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="btn-nav-login">Login</Link>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-content">
          <h1>Donate Blood. Save Lives.</h1>
          <p>
            Help save lives by donating blood through trusted hospitals and connecting with medical professionals who need blood for patients in critical situations.
          </p>
          <div className="hero-buttons">
            <a href="#hospitals" className="btn-primary">Find a Nearby Hospital</a>
            <Link to="/login" className="btn-secondary-outline dark-text">Login</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="medical-hero-image">
            <div className="floating-badge badge-top">
              <span className="badge-icon">👨‍⚕️</span> Trusted Doctors
            </div>
            <div className="floating-badge badge-bottom">
              <span className="badge-icon">🏥</span> Verified Hospitals
            </div>
          </div>
        </div>
      </section>

      {/* 4. Emergency Blood Requests - TODAY */}
      <section id="emergencies" className="emergency-section">
        <div className="container">
          <div className="section-title">
            <h2>Emergency Blood Requests Today</h2>
            <p className="red-accent">Real-time urgent needs from hospitals</p>
          </div>

          <div className="emergency-cards-wrapper">
            {loadingEmergencies ? (
              <div className="loading-state">Loading today's emergency requests...</div>
            ) : emergencies.length === 0 ? (
              <div className="no-emergencies-box">
                <h3>No Emergency Blood Requests Today</h3>
                <p>There are currently no active emergency blood requests. Please check again later.</p>
              </div>
            ) : (
              <div className="emergency-grid">
                {emergencies.map((request) => {
                  const { date, time } = formatDateTime(request.createdAt);
                  return (
                      <div key={request._id} className="emergency-card">
                        <div className="card-header-badges">
                          <span className="urgency-badge">🚨 {request.urgency || 'Urgent'} Priority</span>
                          <span className="status-badge">⚡ {request.status || 'Active'}</span>
                        </div>
                        
                        <h3 className="hospital-name">🏥 {request.hospital?.name || request.hospital?.username || 'Hargeisa Hospital'}</h3>
                        
                        {(request.contactPerson || request.phone) && (
                          <p className="doctor-name">
                            👨‍⚕️ {request.contactPerson || 'Doctor'} {request.phone ? `(${request.phone})` : ''}
                          </p>
                        )}
                        
                        <div className="blood-details">
                          <div className="blood-detail-box">
                            <span className="detail-label">Blood Group</span>
                            <span className="detail-value text-red">{request.bloodType}</span>
                          </div>
                          <div className="blood-detail-box">
                            <span className="detail-label">Units Needed</span>
                            <span className="detail-value">{request.unitsRequired}</span>
                          </div>
                        </div>

                        <div className="info-row">
                          <span>📍 Location:</span>
                          <strong>{[request.hospital?.district, request.hospital?.address].filter(Boolean).join(', ') || request.location || 'Hargeisa'}</strong>
                        </div>
                        <div className="info-row">
                          <span>📅 Date:</span>
                          <strong>{date}</strong>
                        </div>
                        <div className="info-row">
                          <span>⏰ Time:</span>
                          <strong>{time}</strong>
                        </div>
                        
                        <Link to="/login" className="btn-view-request">View Emergency Request</Link>
                      </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. How Blood Donation Works */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <div className="section-title">
            <h2>How Blood Donation Works</h2>
            <p>A safe, medical-first approach to donating blood</p>
          </div>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-icon">🏥</div>
              <h3>Step 1 - Find a Nearby Hospital</h3>
              <p>Find a hospital or medical center near you to begin the process.</p>
            </div>
            <div className="step-item">
              <div className="step-icon">📅</div>
              <h3>Step 2 - Book a Donation</h3>
              <p>Book a blood donation appointment with the nearest available hospital.</p>
            </div>
            <div className="step-item">
              <div className="step-icon">👨‍⚕️</div>
              <h3>Step 3 - Visit the Doctor</h3>
              <p>Visit the hospital and receive a medical check-up from a healthcare professional.</p>
            </div>
            <div className="step-item">
              <div className="step-icon">🩸</div>
              <h3>Step 4 - Donate Blood</h3>
              <p>After being medically approved, you can donate blood and help save a life.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Blood Donation Matters */}
      <section id="about" className="benefits-section">
        <div className="container">
          <div className="section-title">
            <h2>Why Blood Donation Matters</h2>
            <p>The impact of your contribution</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">❤️</div>
              <h3>Save Lives</h3>
              <p>One blood donation can help patients who urgently need blood.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🩸</div>
              <h3>Support Emergency Patients</h3>
              <p>Blood is essential during accidents, surgeries, childbirth emergencies, and other critical situations.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🏥</div>
              <h3>Help Hospitals</h3>
              <p>Hospitals need a reliable blood supply to treat patients quickly.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">👨‍⚕️</div>
              <h3>Support Doctors</h3>
              <p>Doctors can respond faster when the required blood group is available.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Book a Blood Donation */}
      <section className="booking-info-section">
        <div className="container booking-info-container">
          <div className="booking-info-text">
            <h2>Book Your Blood Donation</h2>
            <p className="lead-text">Choose a nearby hospital, select an available doctor or appointment time, and book your blood donation visit.</p>
            <div className="booking-flow">
              <span className="flow-step">Choose Hospital</span>
              <span className="flow-arrow">→</span>
              <span className="flow-step">Choose Doctor</span>
              <span className="flow-arrow">→</span>
              <span className="flow-step">Choose Date & Time</span>
              <span className="flow-arrow">→</span>
              <span className="flow-step highlight">Book Appointment</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Find a Nearby Hospital */}
      <section id="hospitals" className="hospitals-section">
        <div className="container">
          <div className="section-title">
            <h2>Find a Hospital Near You</h2>
            <p>Find the nearest hospital where you can book a blood donation appointment and speak with a medical professional.</p>
          </div>
          
          {loadingHospitals ? (
            <div className="loading-state">Loading hospitals...</div>
          ) : hospitals.length === 0 ? (
            <div className="no-data-box">No hospitals available at the moment.</div>
          ) : (
            <div className="hospital-grid">
              {hospitals.slice(0, 6).map((hospital) => (
                <div key={hospital._id} className="hospital-card">
                  <div className="hospital-header">
                    <h3>🏥 {hospital.name}</h3>
                    <span className="status-open">Open</span>
                  </div>
                  <div className="hospital-body">
                    <p><strong>📍 Location:</strong> {[hospital.district, hospital.address].filter(Boolean).join(', ') || 'Not specified'}</p>
                    <p><strong>👨‍⚕️ Available Doctors:</strong> {hospital.doctorsCount || 'Multiple Available'}</p>
                    <p><strong>🩸 Donation:</strong> Available</p>
                    <p><strong>🕒 Hours:</strong> 24 Hours Open</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. Hospitals Are the Registered Organizations */}
      <section className="hospital-trust-section">
        <div className="container trust-container">
          <h2>Trusted Hospitals, Better Blood Management</h2>
          <p>
            Hospitals are registered and verified on our platform to manage blood donation services, emergency blood requests, doctors, appointments, and blood availability.
          </p>
          <Link to="/login" className="btn-white">Hospital Login</Link>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-col">
            <div className="footer-brand">
              <span className="brand-icon">🩸</span>
              <span>LifeLink</span>
            </div>
            <p className="footer-desc">
              A professional blood donation management system connecting medical professionals and verified hospitals with critical blood supplies.
            </p>
          </div>
          
          <div className="footer-col">
            <h4>Quick Links</h4>
            <a href="#emergencies">Emergency Requests</a>
            <a href="#hospitals">Hospitals</a>
            <a href="#how-it-works">How It Works</a>
          </div>

          <div className="footer-col">
            <h4>Portal</h4>
            <Link to="/login" className="footer-login-link">Hospital Login</Link>
            <a href="#contact">Contact Support</a>
          </div>

          <div className="footer-col disclaimer-col">
            <h4>Medical Disclaimer</h4>
            <p className="medical-disclaimer">
              🚨 For medical emergencies, contact your nearest hospital or emergency medical service immediately.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Blood Donation Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

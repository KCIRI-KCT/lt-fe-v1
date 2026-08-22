// import React, { useState } from 'react';
// import { Search, ChevronLeft, ChevronRight, Clock, Shield, ArrowRight, UserCheck, PhoneCall } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

export const MaintenancePage: React.FC = () => {
  // const navigate = useNavigate();
  // const [activeSlide, setActiveSlide] = useState<number>(0);
  // const [activeTab, setActiveTab] = useState<string>('Home');

  // const slides = [
  //   {
  //     titlePrefix: "L&T - KCIRI",
  //     titleMain: "Maintenance",
  //     titleAccent: "Service",
  //     description: "Our intranet application (10.1.150.142) is undergoing scheduled system maintenance to upgrade AI vision models and enhance overall performance."
  //   },
  //   {
  //     titlePrefix: "System Upgrade",
  //     titleMain: "Under Active",
  //     titleAccent: "Progress",
  //     description: "Estimated completion time is within 2 hours. All site monitoring cameras, PPE detection algorithms, and safety modules will resume shortly."
  //   },
  //   {
  //     titlePrefix: "Intranet Node",
  //     titleMain: "Server Host",
  //     titleAccent: "10.1.150.142:3000",
  //     description: "If you need immediate emergency access or technical assistance during this window, please reach out to the KCIRI IT Infrastructure Helpdesk."
  //   }
  // ];

  // const handleNextSlide = () => {
  //   setActiveSlide((prev) => (prev + 1) % slides.length);
  // };

  // const handlePrevSlide = () => {
  //   setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  // };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      {/* Inline styles for key layout components */}
      <style>{`
        .m-header {
          background-color: #0b0f19;
          color: #ffffff;
          padding: 16px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .m-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-decoration: none;
        }
        .m-logo-icon {
          width: 34px;
          height: 34px;
          background-color: #f43f5e;
          color: #ffffff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 16px;
        }
        .m-brand-text {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
        }
        .m-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .m-nav-item {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 0;
          position: relative;
          transition: color 0.2s;
        }
        .m-nav-item:hover, .m-nav-item.active {
          color: #ffffff;
          font-weight: 600;
        }
        .m-nav-item.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 6px;
          background-color: #f43f5e;
          border-radius: 50%;
        }
        .m-search-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .m-search-btn:hover {
          color: #ffffff;
        }
        .m-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px;
          width: 100%;
        }
        .m-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .m-header { padding: 16px 20px; }
          .m-nav { display: none; }
          .m-hero-grid { grid-template-columns: 1fr; gap: 32px; text-align: center; }
        }
        .m-svg-container {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          display: block;
        }
        .m-prefix {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #f43f5e;
          display: block;
          margin-bottom: 8px;
        }
        .m-title {
          font-size: 48px;
          font-weight: 900;
          line-height: 1.1;
          color: #0f172a;
          margin: 0 0 16px 0;
          letter-spacing: -1px;
        }
        .m-accent {
          color: #f43f5e;
        }
        .m-desc {
          font-size: 16px;
          color: #475569;
          line-height: 1.6;
          margin-bottom: 24px;
          max-width: 480px;
        }
        .m-readmore {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #1e293b;
          font-size: 14px;
          font-weight: 700;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .m-readmore-line {
          width: 40px;
          height: 2px;
          background-color: #cbd5e1;
          transition: background-color 0.2s, width 0.2s;
        }
        .m-readmore:hover .m-readmore-line {
          background-color: #f43f5e;
          width: 60px;
        }
        .m-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 32px;
        }
        .m-arrow-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .m-arrow-btn:hover {
          border-color: #f43f5e;
          color: #f43f5e;
          background: #fff1f2;
        }
        .m-about-sec {
          background-color: #f8fafc;
          border-top: 1px solid #e2e8f0;
          padding: 64px 24px;
          text-align: center;
        }
        .m-about-title {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 1px;
          color: #0f172a;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .m-underline {
          width: 60px;
          height: 4px;
          background-color: #f43f5e;
          border-radius: 2px;
          margin: 0 auto 20px auto;
        }
        .m-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
          max-width: 960px;
          margin: 32px auto 0 auto;
          text-align: left;
        }
        .m-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          transition: transform 0.2s, border-color 0.2s;
        }
        .m-card:hover {
          transform: translateY(-2px);
          border-color: #fda4af;
        }
        .m-card-icon {
          width: 40px;
          height: 40px;
          background-color: #fff1f2;
          color: #f43f5e;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .m-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 30px;
          padding: 8px 20px;
          margin-top: 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .m-footer {
          background-color: #0b0f19;
          color: #94a3b8;
          font-size: 12px;
          padding: 20px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #1e293b;
        }
      `}</style>

      {/* 2. HERO MAINTENANCE SECTION */}
      <main style={{ flex: 1 }}>
        <div className="m-container">
          <div className="m-hero-grid">
            
            {/* Left Side: Vector Illustration */}
            <div>
              <svg viewBox="0 0 500 500" className="m-svg-container" fill="none">
                {/* Large Dark Gear */}
                <g transform="translate(160, 200)">
                  <path
                    fill="#1e293b"
                    d="M 0 -100 L 18 -100 L 25 -75 L 48 -67 L 70 -80 L 83 -67 L 70 -45 L 78 -22 L 100 -18 L 100 0 L 75 8 L 67 31 L 80 53 L 67 66 L 45 53 L 22 61 L 18 83 L 0 83 L -18 83 L -25 61 L -48 53 L -70 66 L -83 53 L -70 31 L -78 8 L -100 0 L -100 -18 L -75 -22 L -67 -45 L -80 -67 L -67 -80 L -45 -70 L -22 -78 L -18 -100 Z"
                  />
                  <circle cx="0" cy="-8" r="45" fill="#ffffff" />
                </g>

                {/* Medium Dark Gear */}
                <g transform="translate(320, 240)">
                  <path
                    fill="#1e293b"
                    d="M 0 -75 L 14 -75 L 19 -56 L 36 -50 L 53 -60 L 62 -50 L 53 -34 L 59 -17 L 75 -14 L 75 0 L 56 6 L 50 23 L 60 40 L 50 49 L 34 40 L 17 46 L 14 62 L 0 62 L -14 62 L -19 46 L -36 40 L -53 49 L -62 40 L -53 23 L -59 6 L -75 0 L -75 -14 L -56 -17 L -50 -34 L -60 -50 L -50 -62 L -34 -53 L -17 -59 L -14 -75 Z"
                  />
                  <circle cx="0" cy="-6" r="32" fill="#ffffff" />
                </g>

                {/* Ladder */}
                <path stroke="#1e293b" strokeWidth="8" strokeLinecap="round" d="M120 420 L210 160" />
                <path stroke="#1e293b" strokeWidth="8" strokeLinecap="round" d="M170 420 L260 160" />
                <line x1="135" y1="375" x2="185" y2="375" stroke="#1e293b" strokeWidth="6" />
                <line x1="150" y1="330" x2="200" y2="330" stroke="#1e293b" strokeWidth="6" />
                <line x1="165" y1="285" x2="215" y2="285" stroke="#1e293b" strokeWidth="6" />
                <line x1="180" y1="240" x2="230" y2="240" stroke="#1e293b" strokeWidth="6" />
                <line x1="195" y1="195" x2="245" y2="195" stroke="#1e293b" strokeWidth="6" />

                {/* Engineer 1: Female Engineer on Ladder */}
                <g>
                  {/* Red Hardhat */}
                  <path fill="#f43f5e" d="M210 115 c-14 0-24 9-24 20 h48 c0-11-10-20-24-20z" />
                  <rect x="182" y="133" width="56" height="5" fill="#f43f5e" rx="2" />
                  {/* Head */}
                  <circle cx="210" cy="146" r="14" fill="#fcd34d" />
                  {/* Hair */}
                  <path fill="#0f172a" d="M196 138 c4-8 22-8 26 0 c4 6 2 16-2 20 c-4 3-20 3-24-20z" />
                  {/* Red Top */}
                  <path fill="#f43f5e" d="M190 165 h40 l4 32 h-48 z" />
                  {/* Overalls */}
                  <path fill="#0f172a" d="M194 180 h32 v110 h-32 z" />
                  {/* Arms */}
                  <path stroke="#fcd34d" strokeWidth="8" strokeLinecap="round" d="M198 170 L248 150" />
                  <path stroke="#fcd34d" strokeWidth="8" strokeLinecap="round" d="M218 170 L268 165" />
                </g>

                {/* Engineer 2: Standing Engineer with Wrench */}
                <g>
                  {/* Red Hardhat */}
                  <path fill="#f43f5e" d="M375 220 c-14 0-24 9-24 20 h48 c0-11-10-20-24-20z" />
                  <rect x="347" y="238" width="56" height="5" fill="#f43f5e" rx="2" />
                  {/* Head */}
                  <circle cx="375" cy="251" r="13" fill="#fcd34d" />
                  {/* Red Top */}
                  <path fill="#f43f5e" d="M353 268 h44 l4 42 h-52 z" />
                  {/* Trousers */}
                  <path fill="#0f172a" d="M356 310 h18 v110 h-18 z M378 310 h18 v110 h-18 z" />
                  {/* Wrench */}
                  <path fill="#fcd34d" stroke="#0f172a" strokeWidth="3" d="M305 260 L360 280 L355 292 L300 272 Z" />
                  <circle cx="302" cy="265" r="10" stroke="#0f172a" strokeWidth="5" fill="#fcd34d" />
                </g>

                {/* Traffic Cone */}
                <polygon points="430,420 445,365 460,420" fill="#f43f5e" />
                <rect x="420" y="420" width="50" height="8" fill="#f43f5e" rx="2" />
                <polygon points="435,402 443,380 455,402" fill="#ffffff" />
                
                {/* Red Toolbox */}
                <rect x="85" y="392" width="46" height="28" fill="#f43f5e" rx="4" />
                <rect x="100" y="384" width="16" height="8" fill="#0f172a" rx="2" />

                {/* Ground */}
                <line x1="40" y1="428" x2="480" y2="428" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>

            <div className="m-about-title">
              Our Website in Maintenance Mode
              <div className="m-underline" />
            </div>

          </div>
        </div>
      </main>

      {/* 3. ABOUT OUR SYSTEM SECTION */}
      <section className="m-about-sec">
        <div className="m-about-title">ABOUT US</div>
        <div className="m-underline" />

        <p style={{ maxWidth: '720px', margin: '0 auto', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
          The L&T - KCIRI Application integrates AI vision monitoring, 
          PPE compliance tracking, site safety alerts, and workforce attendance across intranet host.
          Scheduled maintenance ensures zero data loss and maximum security.
        </p>

        {/* <div className="m-card-grid">
          <div className="m-card">
            <div className="m-card-icon"><Shield size={20} /></div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '6px' }}>AI Safety Engine</div>
            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>Real-time helmet, vest, and intrusion detection across CCTV streams.</div>
          </div>

          <div className="m-card">
            <div className="m-card-icon"><Clock size={20} /></div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '6px' }}>Workforce Management</div>
            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>Automated shift attendance console and site engineer dashboards.</div>
          </div>

          <div className="m-card">
            <div className="m-card-icon"><PhoneCall size={20} /></div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '6px' }}>24/7 IT Support</div>
            <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>Intranet support available at extension +91 (0422) 266-4100.</div>
          </div>
        </div> */}

        {/* <div className="m-pill">
          <UserCheck size={18} color="#f43f5e" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            System Technicians Hard At Work • Expected Uptime Soon
          </span>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#f43f5e',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '8px'
            }}
          >
            <span>Go to Login</span>
            <ArrowRight size={14} />
          </button>
        </div> */}
      </section>

      {/* 4. FOOTER */}
      <footer className="m-footer">
        <div>© 2026 KCIRI Application. All Rights Reserved.</div>
        {/* <div style={{ fontFamily: 'monospace' }}>Host: 10.1.150.142:3000</div> */}
      </footer>

    </div>
  );
};

export default MaintenancePage;

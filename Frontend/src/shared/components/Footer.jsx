import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="au-footer" role="contentinfo">
      <div className="au-footer__inner container">
        <div className="au-footer__cols">
          <div className="au-footer__col contact">
            <h4 className="au-footer__title">Contact</h4>
            <address className="au-address">
              <div>Centre for e-Governance</div>
              <div>First floor, Centre for Excellence Building</div>
              <div>Anna University, Chennai - 600025</div>
            </address>

            <div className="au-contact">
              <div><strong>Phone</strong></div>
              <div>044-2235 7972 (Support Desk)</div>
              <div>044-2235 7973 (Admission/Fee)</div>
              <div>044-2235 7963 (Office)</div>

              <div className="au-contact__email">
                <strong>Email</strong>
                <div><a href="mailto:support@auegov.ac.in">support@auegov.ac.in</a></div>
              </div>
            </div>
          </div>

          <div className="au-footer__col links">
            <h4 className="au-footer__title">Academic</h4>
            <ul className="au-list">
              <li><a href="https://cac.annauniv.edu" target="_blank" rel="noopener noreferrer">Centre for Academic Courses</a></li>
              <li><a href="https://acoe.annauniv.edu" target="_blank" rel="noopener noreferrer">Additional Controller of Examinations</a></li>
              <li><a href="https://aucoe.annauniv.edu" target="_blank" rel="noopener noreferrer">Controller of Examinations</a></li>
              <li><a href="https://cfr.annauniv.edu" target="_blank" rel="noopener noreferrer">Centre for Research</a></li>
              <li><a href="https://annauniv.edu" target="_blank" rel="noopener noreferrer">Centre for Students Affairs</a></li>
            </ul>
          </div>

          <div className="au-footer__col links">
            <h4 className="au-footer__title">Centers</h4>
            <ul className="au-list">
              <li><a href="https://cfa.annauniv.edu" target="_blank" rel="noopener noreferrer">Centre for Admissions</a></li>
              <li><a href="https://cde.annauniv.edu" target="_blank" rel="noopener noreferrer">Centre for Distance Education</a></li>
              <li><a href="https://annauniv.edu" target="_blank" rel="noopener noreferrer">Centre for International Relations</a></li>
              <li><a href="https://iqac.annauniv.edu" target="_blank" rel="noopener noreferrer">Internal Quality Assurance Cell</a></li>
              <li><a href="https://cuic.annauniv.edu" target="_blank" rel="noopener noreferrer">Centre for University Industry Collaboration</a></li>
              <li><a href="https://library.annauniv.edu" target="_blank" rel="noopener noreferrer">University Library</a></li>
            </ul>
          </div>

          <div className="au-footer__col links">
            <h4 className="au-footer__title">Administrators</h4>
            <ul className="au-list">
              <li><a href="https://www.annauniv.edu" target="_blank" rel="noopener noreferrer">University Administration</a></li>
              <li><a href="https://www.annauniv.edu" target="_blank" rel="noopener noreferrer">Deans (UDs)</a></li>
              <li><a href="https://www.auegov.ac.in/Department/cse" target="_blank" rel="noopener noreferrer">Department of CSE (DCSE)</a></li>
            </ul>
          </div>

          <div className="au-footer__col links">
            <h4 className="au-footer__title">Our Map</h4>
            <ul className="au-list">
              <li>
                <a
                  href="https://maps.app.goo.gl/MQ15HhQqvQEQ9v4L9"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Google Maps
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="au-footer__bottom">
          <div>© {new Date().getFullYear()} Anna University · Department of Computer Science and Engineering</div>
          <div>Excellence Through Knowledge & Innovation</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

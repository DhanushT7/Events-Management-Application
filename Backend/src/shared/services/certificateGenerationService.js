import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Certificate from '../models/certificateModel.js';
import Event from '../models/eventModel.js';
import User from '../models/userModel.js';
import { ensureBuffer, isValidBuffer, getBufferSizeString } from '../utils/bufferUtils.js';
import { fetchHODInfo, fetchActiveHODWithSignature, ensureHODExists } from '../utils/hodUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CertificateGenerationService {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
    this.outputDir = path.join(__dirname, '../generated-certificates');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // Generate QR Code for certificate verification
  async generateQRCode(certificateId) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/${certificateId}`;
      const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
        type: 'image/png',
        width: 150,
        margin: 1,
        color: {
          dark: '#1a365d',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  // Load logo as base64 from Backend/src/assets directory
  async loadLogoAsBase64(logoPath) {
    try {
      // Try multiple possible paths - including both assets and assets/logo directories
      const possiblePaths = [
        // Try assets/logo directory first
        path.join(__dirname, '../assets/logo', logoPath),
        path.join(__dirname, '../../assets/logo', logoPath),
        // Try assets directory directly
        path.join(__dirname, '../assets', logoPath),
        path.join(__dirname, '../../assets', logoPath),
        // Try from process.cwd()
        path.join(process.cwd(), 'Backend', 'src', 'assets', 'logo', logoPath),
        path.join(process.cwd(), 'Backend', 'src', 'assets', logoPath),
        path.join(process.cwd(), 'src', 'assets', 'logo', logoPath),
        path.join(process.cwd(), 'src', 'assets', logoPath)
      ];
      
      console.log(`🔍 Attempting to load logo: ${logoPath}`);
      console.log(`🔍 __dirname: ${__dirname}`);
      console.log(`🔍 process.cwd(): ${process.cwd()}`);
      
      for (const fullPath of possiblePaths) {
        console.log(`🔍 Trying path: ${fullPath}`);
        if (fs.existsSync(fullPath)) {
          const logoBuffer = fs.readFileSync(fullPath);
          const base64Logo = logoBuffer.toString('base64');
          const mimeType = logoPath.endsWith('.png') ? 'image/png' : 'image/jpeg';
          console.log(`✅ Logo loaded successfully from: ${fullPath} (${mimeType})`);
          return `data:${mimeType};base64,${base64Logo}`;
        }
      }
      
      console.error(`❌ Logo file not found in any of the attempted paths for: ${logoPath}`);
      console.error(`❌ Available files in assets directory:`);
      
      // Debug: List files in assets directory
      try {
        const assetsDir = path.join(__dirname, '../assets');
        if (fs.existsSync(assetsDir)) {
          const files = fs.readdirSync(assetsDir);
          console.log(`📁 Assets directory (${assetsDir}):`, files);
        }
        
        const assetsLogoDir = path.join(__dirname, '../assets/logo');
        if (fs.existsSync(assetsLogoDir)) {
          const logoFiles = fs.readdirSync(assetsLogoDir);
          console.log(`📁 Assets/logo directory (${assetsLogoDir}):`, logoFiles);
        }
      } catch (debugError) {
        console.error('Debug error:', debugError);
      }
      
      return null;
    } catch (error) {
      console.error('Error loading logo:', error);
      return null;
    }
  }

  // Fetch certificate data from MongoDB
  async fetchCertificateData(certificateId) {
    try {
      const certificate = await Certificate.findOne({ certificateId })
        .populate('participantId', 'name email')
        .populate('eventId')
        .populate('issuedBy', 'name email');

      if (!certificate) {
        throw new Error(`Certificate with ID ${certificateId} not found`);
      }

      return {
        certificate,
        participant: certificate.participantId,
        event: certificate.eventId,
        issuedBy: certificate.issuedBy
      };
    } catch (error) {
      console.error('Error fetching certificate data:', error);
      throw error;
    }
  }

  // Calculate responsive font sizes based on text length
  calculateResponsiveFontSizes(text, baseSize, maxLength = 50) {
    const length = text.length;
    if (length <= maxLength) return baseSize;
    
    // Reduce font size by 1px for every 10 characters over maxLength
    const reduction = Math.floor((length - maxLength) / 10);
    return Math.max(baseSize - reduction, Math.floor(baseSize * 0.7)); // Minimum 70% of base size
  }

  // Format department text with proper line breaks
  formatDepartmentText(primaryDept, associativeDepts = []) {
    let deptText = primaryDept;
    
    if (associativeDepts && associativeDepts.length > 0) {
      const associativeText = associativeDepts.join(' & ');
      deptText = `${primaryDept} & ${associativeText}`;
    }
    
    return deptText;
  }

  // Generate HTML template with MongoDB data and responsive fonts
  async generateHTMLTemplate(certificateData) {
    const {
      participantName,
      eventTitle,
      eventDuration,
      eventDates,
      venue,
      mode,
      issuedDate,
      certificateId,
      qrCodeDataURL,
      skills = [],
      hodName = process.env.DEPARTMENT_HEAD || "Dr. Department Head",
      coordinatorName = "Program Coordinator",
      organizingDepartments = {},
      departmentApprovers = [],
      hodSignature = null
    } = certificateData;

    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const startDate = eventDates?.startDate ? formatDate(eventDates.startDate) : 'N/A';
    const endDate = eventDates?.endDate ? formatDate(eventDates.endDate) : 'N/A';
    const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`;

    // Load logos from Backend/logo directory
    const annaUnivLogo = await this.loadLogoAsBase64('anna-university-logo.jpg');
    const cegLogo = await this.loadLogoAsBase64('CEG_logo.png');

    // Format department text
    const primaryDept = organizingDepartments.primary || "Department of Computer Science and Engineering";
    const associativeDepts = organizingDepartments.associative || [];
    const fullDepartmentText = this.formatDepartmentText(primaryDept, associativeDepts);

    // Calculate responsive font sizes
    const eventTitleFontSize = this.calculateResponsiveFontSizes(eventTitle, 28, 60);
    const departmentFontSize = this.calculateResponsiveFontSizes(fullDepartmentText, 16, 80);
    const participantNameFontSize = this.calculateResponsiveFontSizes(participantName, 40, 30);
    const venueFontSize = this.calculateResponsiveFontSizes(venue, 12, 50);

    // Get HOD name - prioritize the passed hodName over defaults
    let finalHodName = hodName;
    
    // If hodName is the default value, try to get from department approvers
    if (hodName === process.env.DEPARTMENT_HEAD || hodName === "Dr. Department Head" || hodName === "Department Head") {
      if (departmentApprovers && departmentApprovers.length > 0) {
        const primaryApprover = departmentApprovers.find(approver => 
          approver.department === 'DCSE' || approver.approved
        );
        if (primaryApprover && primaryApprover.hodName) {
          finalHodName = primaryApprover.hodName;
        }
      }
    }

    // Format HOD name with Dr. prefix if not already present
    if (finalHodName && !finalHodName.toLowerCase().startsWith('dr.')) {
      finalHodName = `Dr. ${finalHodName}`;
    }

    console.log(`🔍 Certificate Generation - HOD Name: ${finalHodName} (original: ${hodName})`);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Completion</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Crimson+Text:wght@400;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', sans-serif;
                background: white;
                width: 297mm;
                height: 210mm;
                margin: 0;
                padding: 0;
                overflow: hidden;
            }
            
            .certificate {
                width: 297mm;
                height: 210mm;
                background: linear-gradient(135deg, #ffffff 0%, #fefefe 50%, #ffffff 100%);
                border: 15px solid #1e3a8a;
                border-radius: 20px;
                position: relative;
                box-shadow: 
                    0 0 0 3px #fbbf24,
                    0 0 0 6px #1e3a8a,
                    inset 0 1px 0 rgba(255,255,255,0.8);
                overflow: hidden;
                page-break-inside: avoid;
            }
            
            .certificate::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 20px;
                right: 20px;
                bottom: 20px;
                border: 4px double #1e3a8a;
                border-radius: 15px;
                background: 
                    radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 75% 75%, rgba(30, 58, 138, 0.08) 0%, transparent 50%),
                    linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%);
            }
            
            .decorative-corners {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 5;
            }
            
            .corner-design {
                position: absolute;
                width: 60px;
                height: 60px;
                background: linear-gradient(45deg, #fbbf24, #f59e0b);
                clip-path: polygon(0 0, 100% 0, 0 100%);
            }
            
            .corner-design.top-left {
                top: 15px;
                left: 15px;
            }
            
            .corner-design.top-right {
                top: 15px;
                right: 15px;
                transform: rotate(90deg);
            }
            
            .corner-design.bottom-left {
                bottom: 15px;
                left: 15px;
                transform: rotate(-90deg);
            }
            
            .corner-design.bottom-right {
                bottom: 15px;
                right: 15px;
                transform: rotate(180deg);
            }
            
            .header {
                text-align: center;
                padding: 25px 50px 15px;
                position: relative;
                z-index: 10;
                background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%);
            }
            
            .header-line {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                position: relative;
            }
            
            .logo-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                z-index: 15;
            }
            
            .university-logo {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                border: 3px solid #d4af37;
                box-shadow: 0 6px 12px rgba(0,0,0,0.2);
                object-fit: cover;
                background: white;
                padding: 4px;
                display: block;
            }
            
            .ceg-logo {
                width: 65px;
                height: 65px;
                border-radius: 12px;
                border: 3px solid #2d5aa0;
                box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                object-fit: cover;
                background: white;
                padding: 4px;
                display: block;
            }
            
            .logo-caption {
                font-size: 9px;
                color: #4a5568;
                font-weight: 600;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                line-height: 1.2;
                max-width: 80px;
            }
            
            .header-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                flex: 1;
            }
            
            .university-name {
                font-family: 'Playfair Display', serif;
                font-size: 36px;
                font-weight: 900;
                color: #1a365d;
                margin-bottom: 8px;
                letter-spacing: 3px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                line-height: 1.2;
            }
            
            .college-name {
                font-family: 'Playfair Display', serif;
                font-size: 22px;
                font-weight: 700;
                color: #2d5aa0;
                margin-bottom: 8px;
                letter-spacing: 1.5px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            
            .university-address {
                font-size: 13px;
                color: #4a5568;
                margin-bottom: 8px;
                font-weight: 500;
                line-height: 1.3;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .department {
                font-size: ${departmentFontSize}px;
                color: #2d5aa0;
                margin-bottom: 25px;
                font-weight: 700;
                letter-spacing: 1.2px;
                line-height: 1.3;
                text-align: center;
                max-width: 90%;
                margin-left: auto;
                margin-right: auto;
                word-wrap: break-word;
                hyphens: auto;
            }
            
            .certificate-title {
                font-family: 'Playfair Display', serif;
                font-size: 52px;
                font-weight: 900;
                color: #1a365d;
                margin-bottom: 15px;
                text-shadow: 3px 3px 6px rgba(0,0,0,0.15);
                letter-spacing: 5px;
                position: relative;
            }
            
            .certificate-title::after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 180px;
                height: 4px;
                background: linear-gradient(90deg, transparent 0%, #d4af37 50%, transparent 100%);
                border-radius: 2px;
            }
            
            .certificate-subtitle {
                font-family: 'Crimson Text', serif;
                font-size: 22px;
                color: #d4af37;
                margin-bottom: 25px;
                font-weight: 700;
                font-style: italic;
                letter-spacing: 2px;
            }
            
            .content {
                text-align: center;
                padding: 0 60px 30px;
                position: relative;
                z-index: 10;
            }
            
            .awarded-to {
                font-size: 18px;
                color: #4a5568;
                margin-bottom: 22px;
                font-weight: 500;
                font-style: italic;
                letter-spacing: 0.8px;
            }
            
            .participant-name {
                font-family: 'Playfair Display', serif;
                font-size: ${participantNameFontSize}px;
                font-weight: 800;
                color: #1a365d;
                margin-bottom: 22px;
                text-decoration: underline;
                text-decoration-color: #d4af37;
                text-underline-offset: 12px;
                text-decoration-thickness: 4px;
                letter-spacing: 2.5px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                line-height: 1.2;
                word-wrap: break-word;
                hyphens: auto;
            }
            
            .completion-text {
                font-size: 16px;
                color: #4a5568;
                margin-bottom: 18px;
                line-height: 1.5;
                font-weight: 500;
                letter-spacing: 0.5px;
            }
            
            .event-title {
                font-family: 'Playfair Display', serif;
                font-size: ${eventTitleFontSize}px;
                font-weight: 700;
                color: #2d5aa0;
                margin-bottom: 22px;
                font-style: italic;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
                line-height: 1.3;
                word-wrap: break-word;
                hyphens: auto;
                max-width: 100%;
                overflow-wrap: break-word;
            }
            
            .event-details {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 18px;
                margin: 25px 0;
                padding: 18px;
                background: linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(74, 144, 226, 0.12) 100%);
                border-radius: 12px;
                border: 1px solid rgba(212, 175, 55, 0.3);
                box-shadow: 0 3px 6px rgba(0,0,0,0.1);
            }
            
            .event-info {
                text-align: center;
                padding: 12px;
                background: rgba(255,255,255,0.8);
                border-radius: 10px;
                border: 1px solid rgba(212, 175, 55, 0.25);
            }
            
            .event-info strong {
                display: block;
                color: #1a365d;
                margin-bottom: 8px;
                font-weight: 800;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1.2px;
            }
            
            .event-info span {
                color: #4a5568;
                font-size: ${venueFontSize}px;
                font-weight: 600;
                word-wrap: break-word;
                hyphens: auto;
                line-height: 1.4;
                max-width: 100%;
                overflow-wrap: break-word;
            }
            
            .skills-section {
                margin: 22px 0;
                text-align: center;
            }
            
            .skills-title {
                font-size: 16px;
                color: #1a365d;
                margin-bottom: 15px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            .skills-list {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
            }
            
            .skill-tag {
                background: linear-gradient(135deg, #4a90e2 0%, #2d5aa0 100%);
                color: white;
                padding: 8px 15px;
                border-radius: 25px;
                font-size: 11px;
                font-weight: 700;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                letter-spacing: 0.5px;
            }
            
            .qr-section {
                position: absolute;
                left: 30px;
                bottom: 100px;
                text-align: center;
                z-index: 15;
            }
            
            .qr-code {
                width: 80px;
                height: 80px;
                border: 2px solid #d4af37;
                border-radius: 10px;
                padding: 4px;
                background: white;
                box-shadow: 0 6px 12px rgba(0,0,0,0.2);
            }
            
            .qr-text {
                font-size: 10px;
                color: #718096;
                margin-top: 8px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.8px;
            }
            
            .signatures-section {
                position: absolute;
                right: 30px;
                bottom: 80px;
                display: flex;
                flex-direction: column;
                gap: 30px;
                z-index: 15;
            }
            
            .signature-block {
                text-align: center;
                position: relative;
            }
            
            .signature-space {
                height: 25px;
                border-bottom: 1px solid #1a365d;
                margin-bottom: 8px;
                position: relative;
                background: linear-gradient(to right, transparent 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%);
                border-radius: 2px 2px 0 0;
                width: 150px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .signature-space::before {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(to right, transparent 0%, #d4af37 50%, transparent 100%);
            }
            
            .signature-image {
                max-width: 140px;
                max-height: 20px;
                object-fit: contain;
                z-index: 10;
                position: relative;
            }
            
            .signature-name {
                font-weight: 700;
                color: #1a365d;
                font-size: 10px;
                margin-bottom: 3px;
                letter-spacing: 0.3px;
                word-wrap: break-word;
                hyphens: auto;
            }
            
            .signature-title {
                font-size: 8px;
                color: #4a5568;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 2px;
            }
            
            .signature-department {
                font-size: 7px;
                color: #718096;
                margin-top: 1px;
                font-style: italic;
                font-weight: 500;
            }
            
            @media print {
                body {
                    background: white;
                    padding: 0;
                    margin: 0;
                }
                
                .certificate {
                    box-shadow: none;
                    border-radius: 0;
                    page-break-inside: avoid;
                    width: 100%;
                    height: 100%;
                }
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="decorative-corners">
                <div class="corner-design top-left"></div>
                <div class="corner-design top-right"></div>
                <div class="corner-design bottom-left"></div>
                <div class="corner-design bottom-right"></div>
            </div>
            
            <div class="header">
                <div class="header-line">
                    ${annaUnivLogo ? `
                    <div class="logo-container">
                        <img src="${annaUnivLogo}" alt="Anna University Logo" class="university-logo">
                        <div class="logo-caption">Anna University<br>Chennai</div>
                    </div>
                    ` : ''}
                    
                    <div class="header-content">
                        <div class="university-name">ANNA UNIVERSITY</div>
                        <div class="college-name">College of Engineering</div>
                        <div class="university-address">Sardar Patel Road, Guindy, Chennai - 600 025</div>
                        <div class="department">${fullDepartmentText}</div>
                    </div>
                    
                    ${cegLogo ? `
                    <div class="logo-container">
                        <img src="${cegLogo}" alt="CEG Logo" class="ceg-logo">
                        <div class="logo-caption">College of<br>Engineering<br>Guindy</div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="certificate-title">CERTIFICATE</div>
                <div class="certificate-subtitle">of Completion</div>
            </div>
            
            <div class="content">
                <div class="awarded-to">This is to certify that</div>
                <div class="participant-name">${participantName}</div>
                <div class="completion-text">
                    has successfully completed the program
                </div>
                <div class="event-title">"${eventTitle}"</div>
                
                <div class="event-details">
                    <div class="event-info">
                        <strong>Duration</strong>
                        <span>${eventDuration || 'N/A'}</span>
                    </div>
                    <div class="event-info">
                        <strong>Date</strong>
                        <span>${dateRange}</span>
                    </div>
                    <div class="event-info">
                        <strong>Venue</strong>
                        <span>${venue || 'N/A'}</span>
                    </div>
                    <div class="event-info">
                        <strong>Mode</strong>
                        <span>${mode || 'N/A'}</span>
                    </div>
                </div>
                
                ${skills.length > 0 ? `
                <div class="skills-section">
                    <div class="skills-title">Skills & Competencies Acquired</div>
                    <div class="skills-list">
                        ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="qr-section">
                <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code">
                <div class="qr-text">Scan to Verify</div>
            </div>
            
            <div class="signatures-section">
                <div class="signature-block">
                    <div class="signature-space">
                        ${hodSignature ? `<img src="${hodSignature}" alt="HOD Signature" class="signature-image">` : ''}
                    </div>
                    <div class="signature-name">${finalHodName}</div>
                    <div class="signature-title">Head of Department</div>
                    <div class="signature-department">Department of CSE</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Generate certificate from MongoDB data
  async generateCertificateFromDB(certificateId, formats = ['pdf', 'image']) {
    try {
      // Fetch certificate data from MongoDB
      const { certificate, participant, event } = await this.fetchCertificateData(certificateId);
      
      // Fetch active HOD information and signature - prioritize active HODs with signatures
      let activeHod = await User.findOne({ 
        role: 'hod', 
        isActive: true,
        'signature.isActive': true
      }).select('name signature department');
      
      // If no HOD with active signature found, try to find any active HOD
      if (!activeHod) {
        activeHod = await User.findOne({ 
          role: 'hod', 
          isActive: true 
        }).select('name signature department');
      }
      
      // If still no HOD found, try to find any HOD (even inactive)
      if (!activeHod) {
        activeHod = await User.findOne({ 
          role: 'hod'
        }).select('name signature department');
      }
      
      console.log(`🔍 Certificate Generation - Found HOD: ${activeHod ? activeHod.name : 'None'}`);
      console.log(`🔍 Certificate Generation - HOD has signature: ${activeHod?.signature?.imageData ? 'Yes' : 'No'}`);
      console.log(`🔍 Certificate Generation - Signature active: ${activeHod?.signature?.isActive ? 'Yes' : 'No'}`);
      
      // Generate QR code
      const qrCodeDataURL = await this.generateQRCode(certificateId);
      
      // Get HOD name and signature
      let hodName = "Department Head";
      let hodSignature = null;
      
      if (activeHod) {
        hodName = activeHod.name;
        // Only use signature if it exists and is active
        if (activeHod.signature?.imageData && activeHod.signature?.isActive) {
          hodSignature = activeHod.signature.imageData;
        }
      } else {
        // Fallback to environment variable or default
        hodName = process.env.DEPARTMENT_HEAD || "Dr. N. Sairam";
      }
      
      // Ensure HOD name has proper title
      if (hodName && !hodName.toLowerCase().startsWith('dr.')) {
        hodName = `Dr. ${hodName}`;
      }
      
      // Prepare certificate data with MongoDB information
      const certificateData = {
        participantName: participant.name,
        eventTitle: event.title,
        eventDuration: event.duration,
        eventDates: {
          startDate: event.startDate,
          endDate: event.endDate,
        },
        venue: event.venue,
        mode: event.mode,
        issuedDate: certificate.issuedDate,
        certificateId: certificate.certificateId,
        qrCodeDataURL,
        skills: certificate.skills || [],
        organizingDepartments: event.organizingDepartments || {},
        departmentApprovers: event.departmentApprovers || [],
        hodName: hodName,
        hodSignature: hodSignature,
        coordinatorName: "Program Coordinator"
      };
      
      console.log(`🔍 Certificate Generation - Final HOD Name: ${hodName}`);
      console.log(`🔍 Certificate Generation - Using HOD Signature: ${hodSignature ? 'Yes' : 'No'}`);
      
      // Generate certificate
      const results = await this.generateCertificate(certificateData, formats);
      
      // Update certificate record with generated data
      if (results.pdfBuffer) {
        // Safely convert to Buffer using utility function
        const pdfBuffer = ensureBuffer(results.pdfBuffer);
        if (isValidBuffer(pdfBuffer)) {
          certificate.certificateData.pdfBuffer = pdfBuffer;
          certificate.certificateData.fileSize = results.pdfSize;
          certificate.certificateData.contentType = 'application/pdf';
          certificate.certificateData.fileName = `certificate-${certificateId}.pdf`;
          console.log(`✅ PDF buffer saved successfully: ${getBufferSizeString(pdfBuffer)}`);
        } else {
          console.error('❌ Invalid PDF buffer generated');
        }
      }
      
      if (results.imageBuffer) {
        // Safely convert to Buffer using utility function
        const imageBuffer = ensureBuffer(results.imageBuffer);
        if (isValidBuffer(imageBuffer)) {
          certificate.certificateData.imageBuffer = imageBuffer;
          console.log(`✅ Image buffer saved successfully: ${getBufferSizeString(imageBuffer)}`);
        } else {
          console.error('❌ Invalid image buffer generated');
        }
      }
      
      certificate.status = 'generated';
      certificate.verification.qrCode = qrCodeDataURL;
      
      await certificate.save();
      
      return {
        ...results,
        certificate,
        certificateData
      };
      
    } catch (error) {
      console.error('Error generating certificate from DB:', error);
      throw error;
    }
  }

  // Generate certificate as PDF using Puppeteer with fixed dimensions
  async generatePDFCertificate(certificateData) {
    let browser;
    try {
      // Generate QR code if not provided
      if (!certificateData.qrCodeDataURL) {
        certificateData.qrCodeDataURL = await this.generateQRCode(certificateData.certificateId);
      }
      
      // Generate HTML
      const html = await this.generateHTMLTemplate(certificateData);
      
      // Launch Puppeteer
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-web-security']
      });
      
      const page = await browser.newPage();
      
      // Set content and wait for fonts to load
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Wait for fonts and images to fully load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate PDF with exact A4 landscape dimensions
      const pdfBuffer = await page.pdf({
        width: '297mm',
        height: '210mm',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm'
        },
        pageRanges: '1'
      });
      
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF certificate:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Generate certificate as PNG image using Puppeteer
  async generateImageCertificate(certificateData) {
    let browser;
    try {
      // Generate QR code if not provided
      if (!certificateData.qrCodeDataURL) {
        certificateData.qrCodeDataURL = await this.generateQRCode(certificateData.certificateId);
      }
      
      // Generate HTML
      const html = await this.generateHTMLTemplate(certificateData);
      
      // Launch Puppeteer
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-web-security']
      });
      
      const page = await browser.newPage();
      
      // Set viewport for A4 landscape dimensions
      await page.setViewport({
        width: 1123, // 297mm in pixels at 96 DPI
        height: 794,  // 210mm in pixels at 96 DPI
        deviceScaleFactor: 3
      });
      
      // Set content and wait for fonts to load
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      // Wait for fonts and images to fully load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate screenshot
      const imageBuffer = await page.screenshot({
        type: 'png',
        fullPage: true
      });
      
      return imageBuffer;
    } catch (error) {
      console.error('Error generating image certificate:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Generate both PDF and image formats
  async generateCertificate(certificateData, formats = ['pdf', 'image']) {
    const results = {};
    
    try {
      if (formats.includes('pdf')) {
        results.pdfBuffer = await this.generatePDFCertificate(certificateData);
        results.pdfSize = results.pdfBuffer.length;
      }
      
      if (formats.includes('image')) {
        results.imageBuffer = await this.generateImageCertificate(certificateData);
        results.imageSize = results.imageBuffer.length;
      }

      return results;
    } catch (error) {
      console.error('Error in certificate generation:', error);
      throw error;
    }
  }

  // Save certificate to file system
  async saveCertificateToFile(certificateData, buffer, format = 'pdf') {
    try {
      const fileName = `certificate-${certificateData.certificateId}.${format}`;
      const filePath = path.join(this.outputDir, fileName);
      
      fs.writeFileSync(filePath, buffer);
      
      return {
        fileName,
        filePath,
        size: buffer.length
      };
    } catch (error) {
      console.error('Error saving certificate to file:', error);
      throw error;
    }
  }

  // Create new certificate record in MongoDB
  async createCertificateRecord(participantId, eventId, issuedBy, additionalData = {}) {
    try {
      const participant = await User.findById(participantId);
      const event = await Event.findById(eventId);
      
      if (!participant || !event) {
        throw new Error('Participant or Event not found');
      }
      
      const certificateData = {
        participantId,
        eventId,
        issuedBy,
        participantName: participant.name,
        eventTitle: event.title,
        eventDuration: event.duration,
        eventDates: {
          startDate: event.startDate,
          endDate: event.endDate,
        },
        venue: event.venue,
        mode: event.mode,
        skills: additionalData.skills || [],
        status: 'draft',
        ...additionalData
      };
      
      const certificate = new Certificate(certificateData);
      await certificate.save();
      
      return certificate;
    } catch (error) {
      console.error('Error creating certificate record:', error);
      throw error;
    }
  }

  // Generate simple fallback certificate (text-based)
  generateFallbackCertificate(certificateData) {
    const {
      participantName,
      eventTitle,
      eventDuration,
      eventDates,
      venue,
      mode,
      issuedDate,
      certificateId,
      hodName = process.env.DEPARTMENT_HEAD || "Dr. Department Head",
      coordinatorName = "Program Coordinator",
      organizingDepartments = {}
    } = certificateData;

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const startDate = formatDate(eventDates.startDate);
    const endDate = formatDate(eventDates.endDate);
    const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
    
    const primaryDept = organizingDepartments.primary || "Department of Computer Science and Engineering";
    const associativeDepts = organizingDepartments.associative || [];
    const fullDepartmentText = this.formatDepartmentText(primaryDept, associativeDepts);

    return `
════════════════════════════════════════════════════════════════════���══════════
                                ANNA UNIVERSITY
                    ${fullDepartmentText}
                         Sardar Patel Road, Guindy, Chennai - 600 025
═══════════════════════════════════════════════════════════════════════════════

                                  CERTIFICATE
                                 of Completion

This is to certify that

                              ${participantName.toUpperCase()}

has successfully completed the program

                                "${eventTitle}"

Duration: ${eventDuration}                    Date: ${dateRange}
Venue: ${venue}                              Mode: ${mode}

${certificateData.skills && certificateData.skills.length > 0 ? `
Skills & Competencies Acquired: ${certificateData.skills.join(', ')}
` : ''}

Issued on: ${formatDate(issuedDate)}
Certificate ID: ${certificateId}

_____________________                                    _____________________
${coordinatorName}                                      ${hodName}
Program Coordinator                                      Head of Department

This certificate is digitally verifiable.
Verification URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/${certificateId}

═══════════════════════════════════════════════════════════════════════════════
    `.trim();
  }
}

export default CertificateGenerationService;
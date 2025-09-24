import event from "../../../shared/models/eventModel.js";
import ConvenorCommittee from "../../../shared/models/convenorCommitteeModel.js";
import NoteOrder from "../../../shared/models/noteOrderModel.js";
import { generateEventBrochure } from "../../../shared/services/advancedBrochureGenerator.js";

// Create a new training programme
export const createProgramme = async (req, res) => {
  try {
    if (!req.body.title || !req.body.startDate || !req.body.endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Debug: Log the problematic field
    console.log("🔍 Debugging registrationProcedure field:");
    console.log("Type:", typeof req.body.registrationProcedure);
    console.log("Value:", req.body.registrationProcedure);

    // Helper function to safely parse JSON or handle objects
    const safeJSONParse = (data, fallback = {}) => {
      try {
        // If it's already an object, return it directly
        if (typeof data === 'object' && data !== null) {
          return data;
        }
        
        // If it's a string, try to parse it
        if (typeof data === 'string') {
          if (!data || data === 'undefined' || data === 'null') {
            return fallback;
          }
          return JSON.parse(data);
        }
        
        // For any other type, return fallback
        return fallback;
      } catch (error) {
        console.error("❌ JSON Parse Error for:", typeof data === 'string' ? data.substring(0, 100) + "..." : data);
        console.error("❌ Error:", error.message);
        return fallback;
      }
    };

    const budgetBreakdown = safeJSONParse(req.body.budgetBreakdown, {});

    // Server-side calculation of income and totals (to avoid zeroes)
    const calculatedIncome = (budgetBreakdown.income || []).map((inc) => {
      const participants = Number(inc.expectedParticipants || 0);
      const perAmount = Number(inc.perParticipantAmount || 0);
      const gst = Number(inc.gstPercentage || 0);
      const income = participants * perAmount * (1 - gst / 100);
      return { ...inc, income };
    });

    const totalIncome = calculatedIncome.reduce((s, i) => s + Number(i.income || 0), 0);
    const totalExpenditure = (budgetBreakdown.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
    const universityOverhead = totalIncome * 0.3;

    // Create NoteOrder document for initial budget
    const noteOrderData = new NoteOrder({
      income: calculatedIncome,
      expenses: budgetBreakdown.expenses || [],
      totalIncome,
      totalExpenditure,
      universityOverhead,
    });

    const savedNoteOrder = await noteOrderData.save();

    const programme = new event({
      title: req.body.title,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      venue: req.body.venue,
      mode: req.body.mode || "Online",
      duration: req.body.duration,
      type: req.body.type,
      objectives: req.body.objectives,
      outcomes: req.body.outcomes,
      budget: Number(req.body.budget) || 0,
      coordinators: safeJSONParse(req.body.coordinators, []),
      targetAudience: safeJSONParse(req.body.targetAudience, []),
      resourcePersons: safeJSONParse(req.body.resourcePersons, []),
      approvers: safeJSONParse(req.body.approvers, []),
      budgetBreakdown: { ...budgetBreakdown, income: calculatedIncome, totalIncome, totalExpenditure, universityOverhead },
      noteOrder: savedNoteOrder._id, // Reference to NoteOrder document
      // Handle organizing departments
      organizingDepartments: safeJSONParse(req.body.organizingDepartments, {
        primary: "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)",
        associative: []
      }),
      // Handle department approvers
      departmentApprovers: safeJSONParse(req.body.departmentApprovers, [{
        department: "DCSE",
        hodName: "",
        hodDesignation: "HoD, DCSE & Director, CCS",
        approved: false,
        approvedDate: null,
        signature: ""
      }]),
      // Handle registration procedure with safe parsing
      registrationProcedure: safeJSONParse(req.body.registrationProcedure, { enabled: false }),
      createdBy: req.body.createdBy,
      reviewedBy: req.body.reviewedBy,
    });

    const savedProgramme = await programme.save();
    
    // 🎨 AUTO-GENERATE AI BROCHURE: Generate advanced AI brochure automatically after event creation
    try {
      console.log(`🎨 Auto-generating AI brochure for event: ${savedProgramme.title} (ID: ${savedProgramme._id})`);

      // Generate advanced AI brochure using the advancedBrochureGenerator
      const brochureDoc = await generateEventBrochure(savedProgramme);
      
      if (brochureDoc) {
        const pdfBuffer = Buffer.from(brochureDoc.output('arraybuffer'));
        
        // Save AI brochure data directly to MongoDB
        const brochureUpdateData = {
          brochureGenerated: true,
          brochureGeneratedAt: new Date(),
          brochurePDF: {
            data: pdfBuffer,
            contentType: 'application/pdf',
            fileName: `AI_Brochure_${savedProgramme.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
            generatedAt: new Date(),
            version: '2.0',
            features: ['ai-content', 'smart-layout', 'registration-form', 'organizing-committee', 'intelligent-descriptions']
          },
          brochureGenerationHistory: [{
            generatedAt: new Date(),
            version: '2.0',
            features: ['ai-content', 'smart-layout', 'registration-form', 'organizing-committee'],
            fileSize: pdfBuffer.length,
            generatedBy: req.user?._id
          }]
        };

        // Update the saved programme with AI brochure data
        await event.findByIdAndUpdate(savedProgramme._id, brochureUpdateData);

        console.log(`✅ AI Brochure generated and saved to MongoDB for event: ${savedProgramme.title}`);

        // Return response with brochure status
        const responseData = {
          ...savedProgramme.toObject(),
          brochureGenerated: true,
          brochureGeneratedAt: new Date().toISOString(),
          brochureType: 'ai-enhanced'
        };

        res.status(201).json(responseData);
      } else {
        throw new Error('Failed to generate AI brochure document');
      }

    } catch (brochureError) {
      console.error(`❌ Failed to auto-generate AI brochure for event ${savedProgramme.title}:`, brochureError);

      // Don't fail the event creation if brochure generation fails
      // Just log the error and return the event without brochure
      const responseData = {
        ...savedProgramme.toObject(),
        brochureGenerated: false,
        brochureError: brochureError.message
      };

      res.status(201).json(responseData);
    }
  } catch (error) {
    console.error("❌ Error creating programme:", error);
    res.status(500).json({
      message: "Error creating programme",
      error: error.message,
    });
  }
};

// Get all programmes for the current coordinator
export const getProgrammes = async (req, res) => {
  try {
    let query = {};
    
    // Filter events based on user role
    if (req.user && req.user._id) {
      if (req.user.role === 'coordinator') {
        // Coordinators can only see events they created
        query.createdBy = req.user._id;
      } else if (req.user.role === 'hod') {
        // HODs can see all events in their department
        if (req.user.department) {
          query['organizingDepartments.primary'] = req.user.department;
        }
      } else if (req.user.role === 'admin') {
        // Admins can see all events (no filter)
        query = {};
      }
    }

    const programmes = await event
      .find(query)
      .populate('createdBy', 'name email role')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${programmes.length} programmes for user ${req.user?.name || 'anonymous'} (role: ${req.user?.role || 'none'})`);

    res.json(programmes);
  } catch (error) {
    console.error("❌ Error fetching programmes:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ FIXED: Get single programme by ID with proper expense synchronization for editing
export const getProgrammeById = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id)
      .populate({
        path: 'organizingCommittee.member',
        model: 'ConvenorCommittee'
      })
      .populate('noteOrder'); // Populate the noteOrder reference
    
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    // Fetch all available organizing committee members for selection
    const availableCommitteeMembers = await ConvenorCommittee.find({ 
      isActive: true
    }).sort({ 
      roleCategory: 1, 
      role: 1,
      createdAt: -1 
    });

    // ✅ CRITICAL FIX: Proper expense synchronization for editing
    let programmeData = programme.toObject();

    // NoteOrder is now populated, so programmeData.noteOrder contains the NoteOrder object
    // No migration needed since noteOrder is created separately during event creation

    // Determine which expenses to use for editing (priority: claim bill > budget breakdown)
    let expensesToUse = [];
    let sourceOfExpenses = 'none';
    
    if (programme.claimBill?.expenses && Array.isArray(programme.claimBill.expenses) && programme.claimBill.expenses.length > 0) {
      expensesToUse = programme.claimBill.expenses;
      sourceOfExpenses = 'claimBill';

    } else if (programme.budgetBreakdown?.expenses && Array.isArray(programme.budgetBreakdown.expenses) && programme.budgetBreakdown.expenses.length > 0) {
      expensesToUse = programme.budgetBreakdown.expenses;
      sourceOfExpenses = 'budgetBreakdown';

    }
    
    // ✅ IMPORTANT: Ensure both budgetBreakdown and claimBill have the same expenses for editing
    if (expensesToUse.length > 0) {
      // Ensure budget breakdown exists
      if (!programmeData.budgetBreakdown) {
        programmeData.budgetBreakdown = {};
      }
      
      // Calculate total expenditure
      const totalExpenditure = expensesToUse.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      
      // Update budget breakdown with the most current expenses
      programmeData.budgetBreakdown.expenses = expensesToUse;
      programmeData.budgetBreakdown.totalExpenditure = totalExpenditure;
      
      // If claim bill exists, ensure it also has the same expenses
      if (programmeData.claimBill) {
        programmeData.claimBill.expenses = expensesToUse;
        programmeData.claimBill.totalExpenditure = totalExpenditure;
      }
      
      // Add metadata for debugging
      programmeData.budgetBreakdown.expenseSource = sourceOfExpenses;

    }

    // Add available organizing committee members to the response
    const programmeWithCommittee = {
      ...programmeData,
      availableCommitteeMembers
    };

    res.json(programmeWithCommittee);
  } catch (error) {
    console.error("❌ Error fetching programme:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update organizing committee for an event
export const updateOrganizingCommittee = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { organizingCommittee, committeeDisplaySettings } = req.body;

    const programme = await event.findById(eventId);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    // Update organizing committee
    if (organizingCommittee) {
      programme.organizingCommittee = organizingCommittee;
    }

    // Update display settings
    if (committeeDisplaySettings) {
      programme.committeeDisplaySettings = {
        ...programme.committeeDisplaySettings,
        ...committeeDisplaySettings
      };
    }

    await programme.save();

    // Populate the committee members for response
    const updatedProgramme = await event.findById(eventId)
      .populate({
        path: 'organizingCommittee.member',
        model: 'ConvenorCommittee'
      });

    res.json({
      message: "Organizing committee updated successfully",
      organizingCommittee: updatedProgramme.organizingCommittee,
      committeeDisplaySettings: updatedProgramme.committeeDisplaySettings
    });
  } catch (error) {
    console.error("❌ Error updating organizing committee:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all available committee members
export const getAvailableCommitteeMembers = async (req, res) => {
  try {
    const members = await ConvenorCommittee.find({ isActive: true })
      .sort({ 
        roleCategory: 1, 
        role: 1,
        name: 1 
      });

    // Group by role category for easier frontend handling
    const groupedMembers = members.reduce((acc, member) => {
      const category = member.roleCategory || 'COMMITTEE';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(member);
      return acc;
    }, {});

    res.json({
      members,
      groupedMembers
    });
  } catch (error) {
    console.error("❌ Error fetching committee members:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add new committee member
export const addCommitteeMember = async (req, res) => {
  try {
    const { name, designation, department, role, roleCategory, description } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    const newMember = new ConvenorCommittee({
      name,
      designation,
      department,
      role,
      roleCategory: roleCategory || 'COMMITTEE',
      description,
      isActive: true,
      createdBy: req.user?._id
    });

    await newMember.save();

    res.status(201).json({
      message: "Committee member added successfully",
      member: newMember
    });
  } catch (error) {
    console.error("❌ Error adding committee member:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update registration procedure
export const updateRegistrationProcedure = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { registrationProcedure } = req.body;

    const programme = await event.findById(eventId);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    programme.registrationProcedure = {
      ...programme.registrationProcedure,
      ...registrationProcedure
    };

    await programme.save();

    res.json({
      message: "Registration procedure updated successfully",
      registrationProcedure: programme.registrationProcedure
    });
  } catch (error) {
    console.error("❌ Error updating registration procedure:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete programme
export const deleteProgramme = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }
    await programme.deleteOne();
    res.json({ message: "Programme removed" });
  } catch (error) {
    console.error("❌ Error deleting programme:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Generate Enhanced Brochure PDF (Backend-generated)


// Generate Advanced Brochure PDF (Frontend-compatible)
export const generateAdvancedBrochurePDF = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    console.log(`🎨 Generating advanced brochure PDF for event: ${eventId}`);
    
    // Get event data
    const eventData = await event.findById(eventId);
    
    if (!eventData) {
      return res.status(404).json({ message: "Event not found" });
    }

    // This endpoint returns the event data for frontend PDF generation
    // The frontend will use the advancedBrochureGenerator.js to create the PDF
    res.json({
      success: true,
      message: "Event data retrieved for advanced brochure generation",
      event: eventData,
      generateUrl: `/api/events/${eventId}/brochure/advanced/generate`
    });
    
  } catch (error) {
    console.error("❌ Error preparing advanced brochure data:", error);
    res.status(500).json({
      message: "Error preparing advanced brochure data",
      error: error.message,
    });
  }
};

// Download existing brochure PDF from database
export const downloadBrochurePDF = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }
    
    // Retrieve event with PDF data
    const eventData = await event.findById(eventId).select('brochurePDF title');
    
    if (!eventData) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!eventData.brochurePDF || !eventData.brochurePDF.data) {
      return res.status(404).json({ message: "No brochure PDF found for this event" });
    }

    // Extract PDF data
    const { data: pdfBuffer, contentType, fileName } = eventData.brochurePDF;
    
    // Validate PDF data
    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(404).json({ message: "Brochure PDF data is empty or corrupted" });
    }
    
    // Set response headers for PDF
    res.setHeader("Content-Type", contentType || "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader("Content-Disposition", `inline; filename="${fileName || 'brochure.pdf'}"`);
    res.setHeader("Cache-Control", "private, max-age=3600");
    
    // Send PDF buffer
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error("❌ Error downloading brochure PDF:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Save frontend-generated brochure PDF to database
export const saveBrochurePDF = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    const eventData = await event.findById(eventId);
    
    if (!eventData) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if brochure PDF file is provided
    if (!req.file) {
      return res.status(400).json({ message: "No brochure PDF file provided" });
    }

    console.log("💾 Saving frontend-generated brochure PDF for event:", eventData.title);

    // Save the PDF to the database
    eventData.brochurePDF = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
      fileName: req.file.originalname || `Brochure_${eventData.title.replace(/\s+/g, "_")}.pdf`,
    };

    await eventData.save();
    console.log("✅ Frontend brochure PDF saved successfully in database");

    res.status(200).json({
      success: true,
      message: "Brochure PDF saved successfully",
      fileName: eventData.brochurePDF.fileName
    });
    
  } catch (error) {
    console.error("❌ Error saving brochure PDF:", error);
    res.status(500).json({
      message: "Error saving brochure PDF",
      error: error.message,
    });
  }
};
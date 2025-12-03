import mongoose, { mongo } from "mongoose";

const eventSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    venue: {
      type: String,
      required: true,
    },

    mode: {
      type: String,
      required: true,
      enum: ["Online", "Offline", "Hybrid"],
    },

    duration: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    objectives: {
      type: String,
      required: true,
    },

    outcomes: {
      type: String,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },

    claimBill: {
      expenses: [
        {
          category: String,
          budgetAmount: Number,
          actualAmount: Number,
          amount: Number, // ✅ CRITICAL: Added missing amount field
          description: String,
          // Individual item approval status
          itemStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
          },
          approvedAmount: {
            type: Number,
            default: 0,
          },
          rejectionReason: {
            type: String,
            default: "",
          },
          reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          reviewDate: {
            type: Date,
          },
          coordinatorApprovalDate: {
            type: Date,
          },
          receiptGenerated: {
            type: Boolean,
            default: false,
          },
          receiptNumber: {
            type: String,
          },
          receiptData: {
            data: Buffer,
            contentType: String,
            fileName: String,
          },
        },
      ],
      totalBudgetAmount: Number,
      totalExpenditure: Number,
      totalApprovedAmount: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "under_review"],
        default: "pending"
      },
      submissionDate: {
        type: Date,
        default: Date.now
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      approvalDate: Date,
      approvalComments: String,
      claimId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Claim",
      }
    },

    claimPDF: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },

    // AI-Enhanced Brochure PDF (Single unified brochure system)
    brochurePDF: {
      data: Buffer,
      contentType: String,
      fileName: String,
      generatedAt: {
        type: Date,
        default: Date.now
      },
      version: {
        type: String,
        default: '2.0'
      },
      features: {
        type: [String],
        default: ['ai-content', 'smart-layout', 'registration-form', 'organizing-committee', 'intelligent-descriptions']
      }
    },

    // Brochure generation tracking
    brochureGenerated: {
      type: Boolean,
      default: false,
    },

    brochureGeneratedAt: {
      type: Date,
    },

    // Brochure generation metadata
    brochureGenerationHistory: [{
      generatedAt: {
        type: Date,
        default: Date.now
      },
      version: {
        type: String,
        default: '2.0'
      },
      features: {
        type: [String],
        default: ['ai-content', 'smart-layout', 'registration-form', 'organizing-committee']
      },
      fileSize: Number,
      generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }],

    claimSubmitted: { type: Boolean, default: false },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewComments: {
      type: String,
    },

    coordinators: [
      {
        name: String,
        designation: String,
        department: String,
      },
    ],

    // Organizing departments
    organizingDepartments: {
      primary: {
        type: String,
        default: "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING",
      },
      associative: {
        type: [String], // Array of additional departments like "CENTRE FOR CYBER SECURITY (CCS)"
        default: [],
      }
    },

    // HOD approvers for different departments
    departmentApprovers: [
      {
        department: String, // e.g., "DCSE", "CCS", etc.
        hodName: String,
        hodDesignation: String,
        approved: {
          type: Boolean,
          default: false,
        },
        approvedDate: Date,
        signature: String, // Path to signature image or base64
      },
    ],

    targetAudience: {
      type: [String],
      required: true,
    },
    resourcePersons: {
      type: [String],
      required: true,
    },

    // Registration procedure (optional, for brochure generation)
    registrationProcedure: {
      enabled: {
        type: Boolean,
        default: false
      },
      instructions: {
        type: String,
        default: ""
      },
      submissionMethod: {
        type: String,
        enum: ["email", "online", "physical", "other"],
        default: "email"
      },
      deadline: {
        type: Date
      },
      participantLimit: {
        type: Number
      },
      selectionCriteria: {
        type: String,
        default: "first come first served basis"
      },
      confirmationDate: {
        type: Date
      },
      confirmationMethod: {
        type: String,
        enum: ["email", "phone", "website", "other"],
        default: "email"
      },
      certificateRequirements: {
        enabled: {
          type: Boolean,
          default: false
        },
        attendanceRequired: {
          type: Boolean,
          default: true
        },
        evaluation: {
          quiz: {
            enabled: { type: Boolean, default: false },
            percentage: { type: Number, default: 0 }
          },
          assignment: {
            enabled: { type: Boolean, default: false },
            percentage: { type: Number, default: 0 }
          },
          labWork: {
            enabled: { type: Boolean, default: false },
            percentage: { type: Number, default: 0 }
          },
          finalTest: {
            enabled: { type: Boolean, default: false },
            percentage: { type: Number, default: 0 }
          }
        }
      },
      additionalNotes: {
        type: String,
        default: ""
      },
      paymentDetails: {
        enabled: {
          type: Boolean,
          default: false
        },
        accountName: {
          type: String,
          default: "DIRECTOR, CSRC"
        },
        accountNumber: {
          type: String,
          default: "37614464781"
        },
        accountType: {
          type: String,
          default: "SAVINGS"
        },
        bankBranch: {
          type: String,
          default: "State Bank of India, Anna University"
        },
        ifscCode: {
          type: String,
          default: "SBIN0006463"
        },
        additionalPaymentInfo: {
          type: String,
          default: ""
        }
      },
      registrationForm: {
        enabled: {
          type: Boolean,
          default: false
        },
        includeInBrochure: {
          type: Boolean,
          default: true
        },
        fields: {
          name: { type: Boolean, default: true },
          ageAndDob: { type: Boolean, default: true },
          qualification: { type: Boolean, default: true },
          institution: { type: Boolean, default: true },
          category: {
            enabled: { type: Boolean, default: true },
            options: {
              type: [String],
              default: [
                "Student from a Non-Government School",
                "Student of / who has just passed Class XII from a Government School*",
                "A programming enthusiast"
              ]
            }
          },
          address: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          mobile: { type: Boolean, default: true },
          signature: { type: Boolean, default: true }
        },
        additionalRequirements: {
          type: String,
          default: "*Proof has to be submitted with the application"
        },
        customFields: [{
          fieldName: String,
          fieldType: {
            type: String,
            enum: ["text", "number", "email", "date", "select", "checkbox"],
            default: "text"
          },
          required: { type: Boolean, default: false },
          options: [String] // For select type
        }]
      }
    },

    // Organizing Committee (linked to ConvenorCommittee model)
    organizingCommittee: [{
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ConvenorCommittee"
      },
      customName: String, // Override name if needed
      customDesignation: String, // Override designation if needed
      customDepartment: String, // Override department if needed
      order: {
        type: Number,
        default: 0
      }
    }],

    // Committee display preferences
    committeeDisplaySettings: {
      showInBrochure: {
        type: Boolean,
        default: true
      },
      groupByCategory: {
        type: Boolean,
        default: true
      },
      showDepartments: {
        type: Boolean,
        default: true
      },
      customTitle: {
        type: String,
        default: "ORGANIZING COMMITTEE"
      }
    },

    approvers: [
      {
        name: String,
        role: String,
      },
    ],

    // Note Order - Reference to separate NoteOrder document
    noteOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NoteOrder",
    },

    budgetBreakdown: {
      income: [
        {
          category: String,
          expectedParticipants: Number,
          perParticipantAmount: Number,
          gstPercentage: { type: Number, default: 0 },
          income: Number, // auto-calculated value from frontend
        },
      ],
      expenses: [
        {
          category: String,
          amount: Number,
        },
      ],
      totalIncome: Number, // sum of all income[].income
      totalExpenditure: Number, // sum of all expenses[].amount
      universityOverhead: Number, // 30% of totalIncome
    },

  },

  {
    timestamps: true,
  }
);

const event = mongoose.model("Event", eventSchema);
export default event;

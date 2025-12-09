import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "user",
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      required: true,
    },

    department: {
      type: String
    },

    // Active status for HODs (only one active HOD allowed)
    isActive: {
      type: Boolean,
      default: function() {
        return this.role !== 'hod'; // Non-HODs are active by default, HODs need to be explicitly activated
      }
    },

    institution: {
      type: String,
      required: false,
      default: "Anna University",
    },

    password: {
      type: String,
      required: true,
    },

    // Signature management for HODs
    signature: {
      imageData: {
        type: String, // Base64 encoded signature image
        default: null
      },
      fileName: {
        type: String,
        default: null
      },
      uploadedAt: {
        type: Date,
        default: null
      },
      isActive: {
        type: Boolean,
        default: false
      },
      signatureType: {
        type: String,
        enum: ['drawn', 'uploaded'],
        default: 'uploaded'
      }
    },

    // HOD specific information
    designation: {
      type: String,
      default: function() {
        if (this.role === 'hod') {
          return `Head of Department, ${this.department || 'CSE'}`;
        }
        return null;
      }
    },

    // Extended profile information
    phone: {
      type: String,
      default: null
    },

    employeeId: {
      type: String,
      default: null
    },

    joiningDate: {
      type: Date,
      default: null
    },

    address: {
      type: String,
      default: null
    },

    bio: {
      type: String,
      default: null
    },

    specializations: [{
      type: String
    }],

    qualifications: [{
      degree: String,
      institution: String,
      year: String
    }],

    profileImage: {
      type: String, // Base64 or URL
      default: null
    },

    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      eventReminders: {
        type: Boolean,
        default: true
      },
      twoFactorAuth: {
        type: Boolean,
        default: false
      }
    },

    // OTP-based password reset metadata
    resetOtpHash: {
      type: String,
      default: null
    },
    resetOtpExpires: {
      type: Date,
      default: null
    },
    resetOtpAttempts: {
      type: Number,
      default: 0
    },
    resetOtpSession: {
      type: String,
      default: null
    },
    resetOtpSessionExpires: {
      type: Date,
      default: null
    },
    resetOtpVerifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const user = mongoose.model("User", userSchema);
export default user;
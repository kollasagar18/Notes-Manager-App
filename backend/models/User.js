const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },

    // ✅ Email login
    email: { 
      type: String, 
      unique: true,          // must be unique
      sparse: true,          // allow null / missing
      lowercase: true, 
      trim: true 
    },

    // ✅ Phone login
    phone: { 
      type: String, 
      unique: true,          // must be unique
      sparse: true,          // allow null / missing
      trim: true 
    },

    password: { 
      type: String, 
      required: true 
    },

    otp: { 
      type: String, 
      default: null 
    },

    otpExpires: { 
      type: Date, 
      default: null 
    },

    isVerified: { 
      type: Boolean, 
      default: false 
    },

    isAdmin: { 
      type: Boolean, 
      default: false        // ✅ Admin flag
    }
  },
  { timestamps: true }
);

// ✅ Ensure indexes are created properly
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("User", userSchema);

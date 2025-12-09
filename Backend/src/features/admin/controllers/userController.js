import User from "../../../shared/models/userModel.js";
import Event from "../../../shared/models/eventModel.js";
import encrypt from "../../../../passwordManager/encryption.js";
import multer from 'multer';
import csv from 'csv-parser';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  }
});

// Helper function to extract name from email
const extractNameFromEmail = (email) => {
  const localPart = email.split('@')[0];
  // Remove numbers and special characters, split by dots/underscores
  const nameParts = localPart
    .replace(/[0-9]/g, '')
    .split(/[._-]/)
    .filter(part => part.length > 0)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
  
  return nameParts.join(' ') || 'User';
};

// Get all users with pagination and filtering
export const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      department, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Filter by department
    if (department && department !== 'all') {
      query.department = department;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      message: "Error fetching users", 
      error: error.message 
    });
  }
};

// Get all events for admin dashboard
export const getAllEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const events = await Event.find(query)
      .populate('createdBy', 'name email department')
      .populate('reviewedBy', 'name email department')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.status(200).json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ 
      message: "Error fetching events", 
      error: error.message 
    });
  }
};

// Add single user
export const addUser = async (req, res) => {
  try {
    const { email, role, department } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Please enter a valid email address" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User with this email already exists" 
      });
    }

    // Check HOD constraint
    if (role.toLowerCase() === 'hod') {
      const existingHod = await User.findOne({ 
        role: { $regex: '^hod$', $options: 'i' },
        isActive: true 
      });
      
      if (existingHod) {
        // Deactivate existing HOD
        existingHod.isActive = false;
        await existingHod.save();
      }
    }

    // Extract name from email
    const name = extractNameFromEmail(email);

    // Create new user
    const newUser = new User({
      name,
      email,
      role: role.toLowerCase(),
      department,
      password: email, // Use email as password
      isActive: true,
      institution: 'Anna University'
    });

    await newUser.save();

    res.status(201).json({
      message: "User added successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        isActive: newUser.isActive
      }
    });

  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ 
      message: "Error adding user", 
      error: error.message 
    });
  }
};

// Bulk add users via CSV/Excel
export const bulkAddUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let users = [];

    // Parse CSV file
    if (fileExt === '.csv') {
      users = await new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', reject);
      });
    } 
    // Parse Excel file
    else if (fileExt === '.xlsx' || fileExt === '.xls') {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      users = xlsx.utils.sheet_to_json(worksheet);
    }

    // Validate file structure
    if (users.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        message: "File is empty or has no valid data rows" 
      });
    }

    // Check for required columns
    const requiredColumns = ['email', 'role', 'department'];
    const firstRow = users[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        message: `Missing required columns: ${missingColumns.join(', ')}. Please use the provided template.` 
      });
    }

    const results = {
      success: [],
      errors: [],
      warnings: [],
      hodReplaced: null,
      totalProcessed: users.length
    };

    let existingHod = null;
    const validRoles = ['participant', 'coordinator', 'hod'];

    for (let i = 0; i < users.length; i++) {
      const userData = users[i];
      const rowNumber = i + 2; // +2 because Excel/CSV rows start at 1 and we skip header
      
      try {
        let { email, role, department } = userData;

        // Trim whitespace
        email = email?.toString().trim();
        role = role?.toString().trim().toLowerCase();
        department = department?.toString().trim();

        // Validate required fields
        if (!email || !role || !department) {
          results.errors.push({
            row: rowNumber,
            email: email || 'Missing',
            error: 'Missing required fields (email, role, department)'
          });
          continue;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          results.errors.push({
            row: rowNumber,
            email,
            error: 'Invalid email format'
          });
          continue;
        }

        
        // Validate role
        if (!validRoles.includes(role)) {
          results.errors.push({
            row: rowNumber,
            email,
            error: `Invalid role '${role}'. Valid roles: ${validRoles.join(', ')}`
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          results.errors.push({
            row: rowNumber,
            email,
            error: 'User with this email already exists'
          });
          continue;
        }

        // Handle HOD constraint
        if (role === 'hod') {
          if (!existingHod) {
            existingHod = await User.findOne({ 
              role: { $regex: '^hod$', $options: 'i' },
              isActive: true 
            });
          }
          
          if (existingHod && !results.hodReplaced) {
            existingHod.isActive = false;
            await existingHod.save();
            results.hodReplaced = {
              name: existingHod.name,
              email: existingHod.email
            };
            results.warnings.push({
              message: `Previous HOD (${existingHod.name}) has been deactivated`
            });
          }
        }

        // Extract name from email
        const name = extractNameFromEmail(email);

        // Create new user
        const newUser = new User({
          name,
          email,
          role,
          department,
          password: email, // Use email as password
          isActive: true,
          institution: 'Anna University'
        });

        await newUser.save();

        results.success.push({
          row: rowNumber,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department
        });

      } catch (error) {
        results.errors.push({
          row: rowNumber,
          email: userData.email || 'Unknown',
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Determine response status based on results
    let statusCode = 200;
    let message = "Bulk user addition completed successfully";
    
    if (results.errors.length > 0 && results.success.length === 0) {
      statusCode = 400;
      message = "Bulk user addition failed - no users were added";
    } else if (results.errors.length > 0) {
      message = "Bulk user addition completed with some errors";
    }

    res.status(statusCode).json({
      message,
      results,
      summary: {
        total: results.totalProcessed,
        successful: results.success.length,
        failed: results.errors.length,
        warnings: results.warnings.length
      }
    });

  } catch (error) {
    console.error('Bulk add users error:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: "Error processing bulk user addition", 
      error: error.message 
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, department, isActive, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle HOD role change
    if (role && role.toLowerCase() === 'hod' && user.role !== 'hod') {
      const existingHod = await User.findOne({ 
        role: { $regex: '^hod$', $options: 'i' },
        isActive: true,
        _id: { $ne: userId }
      });
      
      if (existingHod) {
        existingHod.isActive = false;
        await existingHod.save();
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role.toLowerCase();
    if (department) user.department = department;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    
    // Update password if provided
    if (password && password.trim() !== '') {
      user.password = password;
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: "Error updating user", 
      error: error.message 
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deletion of admin users
    if (user.role === 'admin') {
      return res.status(403).json({ 
        message: "Cannot delete admin users" 
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      message: "Error deleting user", 
      error: error.message 
    });
  }
};

// Bulk delete users
export const bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        message: "User IDs array is required and cannot be empty" 
      });
    }

    // Find users to be deleted
    const usersToDelete = await User.find({ 
      _id: { $in: userIds } 
    }).select('_id role email name');

    if (usersToDelete.length === 0) {
      return res.status(404).json({ message: "No users found to delete" });
    }

    // Check for admin users that cannot be deleted
    const adminUsers = usersToDelete.filter(user => user.role === 'admin');
    if (adminUsers.length > 0) {
      return res.status(403).json({ 
        message: `Cannot delete admin users: ${adminUsers.map(u => u.email).join(', ')}` 
      });
    }

    // Perform bulk deletion
    const deleteResult = await User.deleteMany({ 
      _id: { $in: userIds },
      role: { $ne: 'admin' } // Extra safety check
    });

    res.status(200).json({
      message: `Successfully deleted ${deleteResult.deletedCount} users`,
      deletedCount: deleteResult.deletedCount,
      requestedCount: userIds.length
    });

  } catch (error) {
    console.error('Bulk delete users error:', error);
    res.status(500).json({ 
      message: "Error deleting users", 
      error: error.message 
    });
  }
};

// Get HOD (existing function)
export const getHod = async (req, res) => {
  try {
    const hod = await User
      .findOne({
        role: { $regex: "^HOD$", $options: "i" },
        isActive: true
      })
      .select("-password");

    res.status(200).send(hod);
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalEvents,
      activeEvents,
      usersByRole,
      recentUsers,
      recentEvents
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'active' }),
      User.aggregate([
        { $match: { role: { $ne: 'admin' } } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      User.find({ role: { $ne: 'admin' } })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5),
      Event.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.status(200).json({
      totalUsers,
      totalEvents,
      activeEvents,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentUsers,
      recentEvents
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      message: "Error fetching dashboard statistics", 
      error: error.message 
    });
  }
};

// Role-wise password reset
export const resetPasswordByRole = async (req, res) => {
  try {
    const { role, resetType } = req.body;

    // Validate input
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const validRoles = ['participant', 'coordinator', 'hod'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be participant, coordinator, or hod" });
    }

    const validResetTypes = ['email', 'default'];
    if (!validResetTypes.includes(resetType)) {
      return res.status(400).json({ message: "Invalid reset type. Must be 'email' or 'default'" });
    }

    // Find all users with the specified role
    const users = await User.find({ role });

    if (users.length === 0) {
      return res.status(404).json({ message: `No users found with role: ${role}` });
    }

    const updatedUsers = [];
    const errors = [];

    // Process each user
    for (const user of users) {
      try {
        let newPassword;
        
        if (resetType === 'email') {
          newPassword = user.email; // Set password to user's email
        } else {
          newPassword = 'password123'; // Set default password
        }

        // Encrypt the new password
        const encryptedPassword = await encrypt(newPassword);

        // Update user's password
        await User.findByIdAndUpdate(user._id, { 
          password: encryptedPassword 
        });

        updatedUsers.push({
          id: user._id,
          name: user.name,
          email: user.email,
          newPassword: resetType === 'email' ? user.email : 'password123'
        });

        // Log the password reset
        console.log(`[ROLE-WISE PASSWORD RESET] ${new Date().toISOString()}`);
        console.log(`User: ${user.name} (${user.email})`);
        console.log(`Role: ${role}`);
        console.log(`New Password: ${newPassword}`);
        console.log('---');

      } catch (userError) {
        console.error(`Error resetting password for user ${user.email}:`, userError);
        errors.push({
          email: user.email,
          error: userError.message
        });
      }
    }

    // Prepare response
    const response = {
      message: `Password reset completed for role: ${role}`,
      summary: {
        totalUsers: users.length,
        successfulResets: updatedUsers.length,
        failedResets: errors.length,
        resetType: resetType === 'email' ? 'Reset to email address' : 'Reset to default (password123)'
      },
      updatedUsers,
      errors
    };

    if (errors.length > 0) {
      console.warn(`Some password resets failed for role ${role}:`, errors);
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Role-wise password reset error:', error);
    res.status(500).json({ 
      message: "Error during role-wise password reset", 
      error: error.message 
    });
  }
};

// Reset password for a single user
export const resetUserPassword = async (req, res) => {
  try {
    const role = req.user?.role;
    const allowed = ['admin','hod','coordinator'];
    if (!allowed.includes(role)) {
      return res.status(403).json({ message: 'Not authorized to reset passwords' });
    }
    const { userId } = req.params;
    const { password } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ message: "Valid 'password' is required in body" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent resetting admin password unless requester is admin (enforced by route middleware ideally)
    if (user.role === 'admin' && role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can reset admin passwords' });
    }
    // Hash/encrypt new password
    const encryptedPassword = await encrypt(password);

    await User.findByIdAndUpdate(userId, { password: encryptedPassword });

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Single user password reset error:', error);
    return res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

// Bulk reset passwords for multiple users
export const bulkResetPasswords = async (req, res) => {
  try {
    const role = req.user?.role;
    const allowed = ['admin','hod','coordinator'];
    if (!allowed.includes(role)) {
      return res.status(403).json({ message: 'Not authorized to reset passwords' });
    }
    const { userIds, password } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "'userIds' must be a non-empty array" });
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ message: "Valid 'password' is required in body" });
    }

    // Fetch users to validate and exclude admins
    const users = await User.find({ _id: { $in: userIds } }).select('_id role email');
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found for provided IDs' });
    }

    const adminUsers = users.filter(u => u.role === 'admin');
    if (adminUsers.length > 0 && role !== 'admin') {
      return res.status(403).json({ message: `Only admin can reset admin user passwords: ${adminUsers.map(u => u.email).join(', ')}` });
    }

    const encryptedPassword = await encrypt(password);

    const result = await User.updateMany(
      { _id: { $in: userIds }, role: { $ne: 'admin' } },
      { $set: { password: encryptedPassword } }
    );

    return res.status(200).json({
      message: `Passwords reset for ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount,
      requestedCount: userIds.length
    });
  } catch (error) {
    console.error('Bulk password reset error:', error);
    return res.status(500).json({ message: 'Error resetting passwords', error: error.message });
  }
};
import { RequestHandler } from "express";
import { dataStore } from "../data/store";
import { AuthRequest, RegisterRequest, AuthResponse } from "@shared/api";

// Simple JWT-like token generation (use proper JWT in production)
function generateToken(userId: string): string {
  return Buffer.from(`${userId}:${Date.now()}`).toString('base64');
}

function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [userId] = decoded.split(':');
    return userId;
  } catch {
    return null;
  }
}

export const handleLogin: RequestHandler = (req, res) => {
  try {
    const { email, password }: AuthRequest = req.body;

    if (!email || !password) {
      const response: AuthResponse = {
        success: false,
        message: "Email and password are required"
      };
      return res.status(400).json(response);
    }

    const user = dataStore.getUserByEmail(email);
    if (!user) {
      const response: AuthResponse = {
        success: false,
        message: "Invalid email or password"
      };
      return res.status(401).json(response);
    }

    // In a real app, you'd verify the hashed password
    // For demo purposes, we'll accept any password for existing users
    const token = generateToken(user.id);

    const response: AuthResponse = {
      success: true,
      user,
      token,
      message: "Login successful"
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    const response: AuthResponse = {
      success: false,
      message: "Internal server error"
    };
    res.status(500).json(response);
  }
};

export const handleRegister: RequestHandler = (req, res) => {
  try {
    const { email, password, name, phone, location, role, stallName, businessType }: RegisterRequest = req.body;

    if (!email || !password || !name || !phone || !location || !role) {
      const response: AuthResponse = {
        success: false,
        message: "All required fields must be provided"
      };
      return res.status(400).json(response);
    }

    // Check if user already exists
    const existingUser = dataStore.getUserByEmail(email);
    if (existingUser) {
      const response: AuthResponse = {
        success: false,
        message: "User with this email already exists"
      };
      return res.status(409).json(response);
    }

    // Create new user
    const user = dataStore.createUser({
      email,
      name,
      phone,
      location,
      role,
      stallName: role === 'vendor' ? stallName : undefined,
      businessType: role === 'supplier' ? businessType : undefined
    });

    const token = generateToken(user.id);

    const response: AuthResponse = {
      success: true,
      user,
      token,
      message: "Registration successful"
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    const response: AuthResponse = {
      success: false,
      message: "Internal server error"
    };
    res.status(500).json(response);
  }
};

// Middleware to verify authentication
export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token required" });
  }

  const userId = verifyToken(token);
  if (!userId) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }

  const user = dataStore.getUserById(userId);
  if (!user) {
    return res.status(403).json({ success: false, message: "User not found" });
  }

  // Add user to request object
  (req as any).user = user;
  next();
};

export const handleProfile: RequestHandler = (req, res) => {
  const user = (req as any).user;
  res.json({ success: true, data: user });
};

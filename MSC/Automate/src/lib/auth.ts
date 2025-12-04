import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export interface JWTPayload {
  username: string;
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  error?: string;
  expiresIn?: string;
}

/**
 * Validate credentials against environment variables
 */
export function validateCredentials(username: string, password: string): boolean {
  const validUsername = process.env.AUTH_USERNAME;
  const validPassword = process.env.AUTH_PASSWORD;

  if (!validUsername || !validPassword) {
    console.error("AUTH_USERNAME or AUTH_PASSWORD not set in environment");
    return false;
  }

  return username === validUsername && password === validPassword;
}

/**
 * Generate a JWT token for authenticated user
 */
export function generateToken(username: string): string {
  const payload: JWTPayload = {
    username,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Authenticate user with credentials
 */
export function authenticate(username: string, password: string): AuthResult {
  if (!username || !password) {
    return {
      success: false,
      error: "Username and password are required",
    };
  }

  if (!validateCredentials(username, password)) {
    return {
      success: false,
      error: "Invalid credentials",
    };
  }

  const token = generateToken(username);

  return {
    success: true,
    token,
    expiresIn: JWT_EXPIRES_IN,
  };
}

/**
 * Extract token from Authorization header or cookie
 */
export function extractToken(authHeader?: string | null, cookieHeader?: string | null): string | null {
  // Try Authorization header first (Bearer token)
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try cookie
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    if (cookies["auth-token"]) {
      return cookies["auth-token"];
    }
  }

  return null;
}

/**
 * Check if a request is authenticated
 */
export function isAuthenticated(authHeader?: string | null, cookieHeader?: string | null): boolean {
  const token = extractToken(authHeader, cookieHeader);
  
  if (!token) {
    return false;
  }

  const payload = verifyToken(token);
  return payload !== null;
}

/**
 * Get authenticated user from token
 */
export function getAuthenticatedUser(authHeader?: string | null, cookieHeader?: string | null): JWTPayload | null {
  const token = extractToken(authHeader, cookieHeader);
  
  if (!token) {
    return null;
  }

  return verifyToken(token);
}

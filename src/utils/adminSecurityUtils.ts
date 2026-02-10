/**
 * Admin Security Utilities
 * 
 * This module provides utilities for managing admin panel security.
 * Use these functions to generate password hashes and manage admin credentials.
 */

/**
 * Generate SHA-256 hash of a password
 * Use this to create hashes for the admin password verification
 * 
 * @param password The password to hash
 * @returns Promise resolving to the SHA-256 hash as a hex string
 * 
 * @example
 * const hash = await hashPassword('myNewPassword123');
 * console.log('Update ADMIN_PASSWORD_HASH in backend to:', hash);
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a random admin token (for reference)
 * The backend generates tokens automatically on successful login
 * 
 * @returns A random token string
 */
export function generateAdminToken(): string {
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const tokenArray = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return 'admin_' + tokenArray;
}

/**
 * Validate admin token expiration
 * Tokens expire after 24 hours
 * 
 * @param loginTime The timestamp when login occurred (from localStorage)
 * @returns true if token is still valid, false if expired
 */
export function isTokenExpired(loginTime: string | null): boolean {
  if (!loginTime) return true;
  
  const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  const loginTimestamp = parseInt(loginTime);
  const expiresAt = loginTimestamp + TOKEN_EXPIRATION_MS;
  
  return Date.now() > expiresAt;
}

/**
 * Get time remaining until token expiration
 * 
 * @param loginTime The timestamp when login occurred (from localStorage)
 * @returns Milliseconds remaining until expiration, or 0 if expired
 */
export function getTokenTimeRemaining(loginTime: string | null): number {
  if (!loginTime) return 0;
  
  const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  const loginTimestamp = parseInt(loginTime);
  const expiresAt = loginTimestamp + TOKEN_EXPIRATION_MS;
  
  return Math.max(0, expiresAt - Date.now());
}

/**
 * IMPORTANT: How to change the admin password
 * 
 * 1. Run this in your browser console or use the hashPassword function:
 *    import { hashPassword } from '@/utils/adminSecurityUtils';
 *    const hash = await hashPassword('your_new_secure_password_here');
 *    console.log(hash);
 * 
 * 2. Copy the hash output
 * 
 * 3. Update the backend file: supabase/functions/server/index.tsx
 *    Replace the ADMIN_PASSWORD_HASH value with your new hash:
 *    const ADMIN_PASSWORD_HASH = 'paste_the_hash_here';
 * 
 * 4. Redeploy the backend
 * 
 * Security Tips:
 * - Use a strong password with mix of uppercase, lowercase, numbers, and symbols
 * - Do not share the password with unauthorized people
 * - Change password periodically
 * - Keep the backend code secure and never expose password hashes in client-side code
 */

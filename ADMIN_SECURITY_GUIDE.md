# Admin Panel Security Guide

## Overview

Your admin panel is protected with a secure password authentication system. This guide explains how to manage and change your admin credentials.

## Current Setup

- **Admin URL**: `/admin_abdulaziz787/`
- **Current Password**: `7777` (you should change this)
- **Authentication Method**: SHA-256 password hashing with token-based sessions
- **Session Duration**: 24 hours
- **Token Storage**: Browser localStorage (secure for single-device access)

## How the Security Works

1. **Password Entry**: You access the admin panel at `/admin_abdulaziz787/` and enter your password
2. **Hash Verification**: The password is sent to the backend where it's hashed using SHA-256 and compared with the stored hash
3. **Token Generation**: On success, the backend generates a secure random token and stores it in a key-value store
4. **Token Validation**: All admin operations verify the token is still valid and hasn't expired
5. **Session Timeout**: After 24 hours, the token expires automatically and you must log in again

## Changing Your Admin Password

Follow these steps to change your password to something more secure:

### Step 1: Generate Password Hash

Open your browser console (F12) and run:

```javascript
// Import the utility function
import { hashPassword } from '/src/utils/adminSecurityUtils.ts';

// Or use this directly in the browser console:
async function hashNewPassword() {
  const encoder = new TextEncoder();
  const data = encoder.encode('YOUR_NEW_PASSWORD_HERE');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  console.log('Copy this hash:', hash);
  return hash;
}

hashNewPassword();
```

Replace `'YOUR_NEW_PASSWORD_HERE'` with your desired password.

### Step 2: Update Backend Hash

1. Open the file: `supabase/functions/server/index.tsx`
2. Find this line (around line 212):
   ```typescript
   const ADMIN_PASSWORD_HASH = await hashPassword('7777');
   ```

3. Replace it with:
   ```typescript
   const ADMIN_PASSWORD_HASH = 'paste_your_hash_here';
   ```

   Replace `'paste_your_hash_here'` with the hash you generated in Step 1.

4. Save the file and deploy your backend

### Step 3: Test New Password

1. Clear your browser's localStorage: 
   - Press F12 to open DevTools
   - Go to Application > Local Storage
   - Find and delete the `adminToken` and `adminLoginTime` entries

2. Navigate to `/admin_abdulaziz787/`
3. Enter your new password to verify it works

## Password Security Best Practices

✅ **DO:**
- Use a strong password with mixed case, numbers, and symbols
- Example: `MyLib#2024!Secure@Pass`
- Change password every 3-6 months
- Use a password manager to remember it
- Keep the password private and only shared with trusted people

❌ **DON'T:**
- Use simple passwords like sequential numbers (7777, 1234)
- Share the password via email or messaging apps
- Write it down where others can see it
- Reuse passwords from other accounts
- Expose the hash in any public repository

## Session Management

### Token Expiration
- Your admin session expires after 24 hours of the initial login
- The admin panel will warn you with 5 minutes remaining
- You'll need to log in again with your password
- The warning shows in the admin panel header: "Session expires in X min"

### Automatic Logout
When your session expires, you'll be automatically logged out and returned to the home page with a message.

### Manual Logout
Click the "Выйти" (Logout) button in the top-right corner of the admin panel to end your session immediately.

## URL Obfuscation

Your admin panel URL is intentionally obfuscated:
- `/admin_abdulaziz787/` is your secret admin link
- It's not easy to guess or find through normal navigation
- This provides basic protection against casual access attempts
- However, **the password is the primary security mechanism**

## Troubleshooting

### "Invalid password" Error
- Check your password is correct (case-sensitive)
- Verify you're using the right password if recently changed
- Clear browser cache and try again

### Session Expired
- This is normal after 24 hours
- Simply enter your password again to log back in
- You won't lose any data - the session just requires re-authentication

### Can't Remember Password
- There's no password recovery mechanism
- You'll need to generate a new password hash and update the backend
- See "Changing Your Admin Password" section above

## Advanced Security (Optional)

For even more security, you could:

1. **Add IP Whitelisting**: Restrict admin access to specific IP addresses
2. **Add 2FA**: Implement two-factor authentication
3. **Use Environment Variables**: Store the password hash as an environment variable
4. **Add Rate Limiting**: Limit login attempts to prevent brute force attacks
5. **Add Audit Logging**: Log all admin actions for accountability

Contact your development team if you want to implement these features.

## Files Modified for Security

- `supabase/functions/server/index.tsx` - Backend password hashing and token management
- `src/app/pages/AdminPanel.tsx` - Frontend login form and session management
- `src/utils/adminSecurityUtils.ts` - Password hashing utilities
- `src/app/routes.tsx` - Admin route configuration

---

**Last Updated**: February 10, 2026
**Version**: 1.0

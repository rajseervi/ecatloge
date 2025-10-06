# 🔧 Authentication Troubleshooting Guide

## Common Issues and Solutions

---

## ❌ Error: `/?error=Configuration`

### Cause:
Missing or incorrect environment variables for NextAuth.

### Solution:
1. Check that `.env.local` contains:
   ```env
   NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
   NEXTAUTH_URL=http://localhost:3003
   ```

2. **Restart your dev server** (environment variables only load on startup):
   ```bash
   # Stop server: Ctrl + C
   npm run dev
   ```

3. Clear browser cache and try again

---

## ❌ Login Modal Doesn't Appear

### Cause:
SessionProvider not wrapping the app, or client component issues.

### Solution:
1. Check `src/app/layout.tsx` has:
   ```tsx
   <SessionProvider>
     {children}
   </SessionProvider>
   ```

2. Verify `src/components/SessionProvider.tsx` exists and has `"use client"` directive

3. Hard refresh browser: `Ctrl + Shift + R`

---

## ❌ Error: "Invalid email or password" (but credentials are correct)

### Cause:
Firebase user doesn't exist yet.

### Solution:
1. Navigate to: `http://localhost:3003/setup-admin`
2. Create an admin user with the credentials you're trying to use
3. Try logging in again

---

## ❌ Error: "Firebase: Error (auth/configuration-not-found)"

### Cause:
Firebase configuration is missing or incorrect.

### Solution:
1. Check `src/lib/firebase.ts` has valid Firebase config:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     // ... other config
   };
   ```

2. Verify Firebase project exists and Authentication is enabled:
   - Go to: https://console.firebase.google.com
   - Select your project
   - Go to Authentication → Sign-in method
   - Enable "Email/Password" provider

---

## ❌ Middleware Redirects to "/" Immediately

### Cause:
Token validation failing or middleware configuration issue.

### Solution:
1. Check `src/middleware.ts` has correct configuration:
   ```typescript
   export const config = {
     matcher: [
       "/admin/:path*",
       "/inventory/:path*",
     ],
   };
   ```

2. Verify you're logged in:
   - Open browser DevTools → Application → Cookies
   - Look for `next-auth.session-token` cookie
   - If missing, log in again

3. Check terminal for middleware errors

---

## ❌ TypeScript Errors After Implementation

### Cause:
Missing type definitions or incorrect imports.

### Solution:
1. Verify `src/types/next-auth.d.ts` exists

2. Run TypeScript check:
   ```bash
   npx tsc --noEmit
   ```

3. If errors persist, restart VS Code:
   - Press `Ctrl + Shift + P`
   - Type "Reload Window"
   - Press Enter

---

## ❌ "Authentication Required" Page Shows Even When Logged In

### Cause:
Session not being detected on client side.

### Solution:
1. Check browser console for errors (F12)

2. Verify session status:
   ```typescript
   // Add this temporarily to any protected page
   const { data: session, status } = useSession();
   console.log("Session:", session, "Status:", status);
   ```

3. Clear all cookies and log in again:
   - DevTools → Application → Cookies → Clear all
   - Navigate to `/admin` and log in

---

## ❌ Logout Button Doesn't Work

### Cause:
SessionProvider not wrapping the component, or signOut not imported.

### Solution:
1. Check the component has:
   ```typescript
   import { signOut } from "next-auth/react";
   ```

2. Verify the button calls:
   ```typescript
   onClick={() => signOut()}
   ```

3. Check browser console for errors

4. Ensure SessionProvider wraps the entire app in root layout

---

## ❌ Can't Create Admin User (Setup Page)

### Cause:
Firebase Authentication not properly configured.

### Solution:
1. Check Firebase Console:
   - Go to Authentication → Sign-in method
   - Ensure "Email/Password" is enabled

2. Check browser console for specific Firebase error

3. Common Firebase errors:
   - `auth/weak-password`: Use stronger password (min 6 chars)
   - `auth/email-already-in-use`: User already exists, try logging in
   - `auth/invalid-email`: Check email format

---

## ❌ Session Expires Too Quickly

### Cause:
Session maxAge is too short.

### Solution:
1. Edit `src/app/api/auth/[...nextauth]/route.ts`:
   ```typescript
   session: { 
     strategy: "jwt",
     maxAge: 30 * 24 * 60 * 60, // 30 days (adjust as needed)
   },
   ```

2. Restart dev server

---

## ❌ Protected Routes Still Accessible Without Login

### Cause:
Middleware not running or routes not in matcher.

### Solution:
1. Check `src/middleware.ts` matcher includes your route:
   ```typescript
   matcher: [
     "/admin/:path*",      // Protects /admin and all sub-routes
     "/inventory/:path*",  // Protects /inventory and all sub-routes
   ]
   ```

2. Verify middleware file is in `src/` directory (not `src/app/`)

3. Restart dev server

4. Clear browser cache

---

## 🔍 Debugging Tips

### Enable Verbose Logging:

Add to `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
export const authOptions: NextAuthOptions = {
  debug: true, // Add this line
  // ... rest of config
};
```

### Check Session in Browser:

Open DevTools Console and run:
```javascript
// Check if session exists
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

### Check Environment Variables:

Add to any server component:
```typescript
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "Set" : "Missing");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
```

### Monitor Network Requests:

1. Open DevTools → Network tab
2. Try logging in
3. Look for requests to `/api/auth/signin`
4. Check response for errors

---

## 🆘 Still Having Issues?

### Checklist:
- [ ] Dev server restarted after adding environment variables
- [ ] `.env.local` is in root directory (not `src/`)
- [ ] Firebase Authentication is enabled in Firebase Console
- [ ] Email/Password provider is enabled in Firebase
- [ ] Browser cache cleared (Ctrl + Shift + R)
- [ ] No console errors in browser DevTools
- [ ] No errors in terminal where dev server is running

### Get More Help:

1. **Check the terminal output** where `npm run dev` is running
   - Look for any red error messages
   - Copy the full error message

2. **Check browser console** (F12 → Console tab)
   - Look for any red errors
   - Copy the error message

3. **Verify file structure:**
   ```
   src/
   ├── middleware.ts                    ← Must be here
   ├── app/
   │   ├── layout.tsx                   ← Has SessionProvider
   │   ├── admin/
   │   │   └── layout.tsx               ← Has ProtectedRoute
   │   └── api/
   │       └── auth/
   │           └── [...nextauth]/
   │               └── route.ts         ← NextAuth config
   ├── components/
   │   ├── SessionProvider.tsx
   │   ├── ProtectedRoute.tsx
   │   └── LoginModal.tsx
   └── types/
       └── next-auth.d.ts
   ```

---

## ✅ Everything Working?

If authentication is working correctly, you should be able to:
- ✅ Access `/admin` and see "Authentication Required" page
- ✅ Click "Sign In" and see login modal
- ✅ Log in with valid credentials
- ✅ See the admin dashboard
- ✅ Click "Log out" and be redirected to home
- ✅ Try accessing `/admin` again and be prompted to log in

---

## 🔐 Security Checklist (Before Production):

- [ ] Change `NEXTAUTH_SECRET` to a secure random value
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Delete `src/app/setup-admin/page.tsx` after creating admin users
- [ ] Enable Firebase Security Rules
- [ ] Use HTTPS in production
- [ ] Set secure cookie options in NextAuth config
- [ ] Implement rate limiting for login attempts
- [ ] Add CORS configuration if needed
- [ ] Review Firebase Authentication settings
- [ ] Enable 2FA for admin accounts (optional)

---

## 📚 Additional Resources:

- NextAuth.js Docs: https://next-auth.js.org/
- Firebase Auth Docs: https://firebase.google.com/docs/auth
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- JWT Tokens: https://jwt.io/

---

**Last Updated:** After fixing Configuration error
**Status:** All known issues documented
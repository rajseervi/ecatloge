# 🚀 Quick Start: Authentication Setup

## Step 1: Create Your First Admin User

### Option A: Using the Setup Page (Easiest)

1. Navigate to: **http://localhost:3003/setup-admin**
2. Fill in the form:
   - Email: `admin@example.com` (or your preferred email)
   - Password: `admin123` (or your preferred password)
   - Confirm Password: (same as above)
3. Click **"Create Admin Account"**
4. Success! You can now log in

⚠️ **IMPORTANT**: Delete `src/app/setup-admin/page.tsx` after creating your admin account!

### Option B: Using Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select project: **e-cat-master**
3. Click **Authentication** → **Users** → **Add User**
4. Enter email and password
5. Click **Add User**

---

## Step 2: Test the Login

1. Navigate to: **http://localhost:3003/admin**
2. You'll see "Authentication Required" page
3. Click **"Sign In"** button
4. Login modal appears
5. Enter your credentials
6. Click **"Sign In"**
7. You're in! 🎉

---

## Step 3: Test Protected Routes

Try accessing these URLs without being logged in:

- ✅ `/admin` - Should require login
- ✅ `/admin/settings` - Should require login
- ✅ `/inventory` - Should require login
- ❌ `/` - Public (no login required)
- ❌ `/product/[id]` - Public (no login required)

---

## Step 4: Test Logout

1. Click **"Log out"** button in the header
2. You'll be redirected to home page
3. Try accessing `/admin` again
4. You'll need to log in again ✅

---

## Step 5: Clean Up (Important!)

After creating your admin account:

1. **Delete the setup page**:
   ```
   Delete: src/app/setup-admin/page.tsx
   ```

2. **Add environment variable** (optional but recommended):
   
   Create/update `.env.local`:
   ```env
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3003
   ```

   Generate a secret:
   ```bash
   openssl rand -base64 32
   ```

---

## 🎯 Quick Test Checklist

- [ ] Created admin user (via setup page or Firebase Console)
- [ ] Tested login at `/admin`
- [ ] Verified redirect to dashboard after login
- [ ] Tested accessing `/inventory` (should work without re-login)
- [ ] Tested logout functionality
- [ ] Verified login required after logout
- [ ] Deleted `src/app/setup-admin/page.tsx`
- [ ] Added `NEXTAUTH_SECRET` to `.env.local`

---

## 🐛 Troubleshooting

### Can't create admin user?
- Check Firebase Console that Authentication is enabled
- Verify your Firebase config in `src/lib/firebase.ts`

### Login not working?
- Check that you're using the correct email/password
- Look at browser console for errors
- Verify Firebase Auth is enabled

### Redirects to home instead of showing login modal?
- Clear browser cache and cookies
- Restart development server
- Check browser console for errors

### Session doesn't persist?
- Add `NEXTAUTH_SECRET` to `.env.local`
- Clear browser cookies
- Restart development server

---

## 📝 Default Test Credentials

If you used the setup page with default values:

- **Email**: `admin@example.com`
- **Password**: `admin123`

⚠️ Change these in production!

---

## ✅ You're All Set!

Your admin and inventory pages are now protected. Only authenticated users can access them.

**What's Protected:**
- `/admin` - Admin dashboard
- `/admin/settings` - Admin settings
- `/inventory` - Inventory management

**What's Public:**
- `/` - Product catalog
- `/product/[id]` - Product details
- `/scan` - QR scanner

---

## 🔐 Security Reminders

1. ✅ Delete `src/app/setup-admin/page.tsx` after setup
2. ✅ Use strong passwords for admin accounts
3. ✅ Add `NEXTAUTH_SECRET` to environment variables
4. ✅ Never commit `.env.local` to version control
5. ✅ Use different credentials for production

---

**Need Help?** Check `AUTH_PROTECTION_SUMMARY.md` for detailed documentation.
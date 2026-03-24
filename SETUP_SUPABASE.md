# Setting Up Supabase Tracking

Follow these steps to enable user tracking and analytics in your IPTV player.

## Step 1: Create a Supabase Project

1. Visit [Supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project" 
4. Enter a project name, password, and select a region
5. Wait for the project to be created

## Step 2: Get Your Credentials

1. Go to Project Settings → API
2. Copy these two values:
   - **Project URL** (VITE_SUPABASE_URL)
   - **Anon/Public Key** (VITE_SUPABASE_ANON_KEY)

## Step 3: Create Environment Variables

1. Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Create Database Tables

### Option A: Automatic SQL Execution (Recommended)

If your environment supports SQL script execution:

```bash
# Make sure you have proper Supabase CLI setup
supabase db push
```

### Option B: Manual SQL Execution (Web UI)

1. Go to your Supabase project dashboard
2. Click **SQL Editor** on the left sidebar
3. Click **New Query**
4. Copy the entire content from `scripts/001_create_tracking_tables.sql`
5. Paste it into the SQL editor
6. Click **Run**

You should see a success message. If there are errors, check:
- Table names don't already exist
- You have proper permissions
- All syntax is correct

### Option C: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-id

# Push the migration
supabase db push
```

## Step 5: Verify Tables Were Created

1. Go to **Table Editor** in your Supabase dashboard
2. You should see three new tables:
   - `user_sessions`
   - `user_page_views`
   - `user_events`

3. Click each table to verify the columns are correct

## Step 6: Configure RLS (Row Level Security)

The migration script automatically sets up RLS policies. Verify they're in place:

1. Click on **Authentication** → **Policies** in the left sidebar
2. For each table, you should see policies for:
   - `Allow inserts` - Anonymous users can log their sessions
   - `Allow reads` - Authenticated users can view analytics

## Step 7: Install Dependencies

Install the Supabase JavaScript client:

```bash
npm install @supabase/supabase-js
```

Or if using yarn/pnpm:
```bash
yarn add @supabase/supabase-js
# or
pnpm add @supabase/supabase-js
```

## Step 8: Start the Development Server

```bash
npm run dev
```

Your IPTV player should now be tracking user sessions and analytics!

## Verify It's Working

1. Open your application in a browser
2. Open browser DevTools (F12 → Console)
3. You should see logs like:
   ```
   [v0] Tracking initialized with session: [uuid]
   [v0] Session tracked: [uuid]
   ```

4. Click the Analytics button (📊) in the navigation menu
5. You should see your session data appearing in the dashboard

## Troubleshooting

### No data appearing in Analytics

**Problem:** Analytics dashboard shows no data
- Check browser console for errors (F12 → Console)
- Verify `.env.local` has correct Supabase credentials
- Ensure tables exist in Supabase
- Check that RLS policies allow inserts

**Solution:**
```javascript
// Add debug logging in browser console
// Check if Supabase client is initialized
console.log(import.meta.env.VITE_SUPABASE_URL);
```

### "Supabase not configured" warning

**Problem:** Console shows "Supabase not configured"
- Environment variables not loaded

**Solution:**
1. Restart dev server: `npm run dev`
2. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### CORS errors

**Problem:** "CORS error" in console when trying to fetch data

**Solution:**
1. Go to Supabase dashboard
2. Project Settings → API
3. Scroll to "CORS Configuration"
4. Add your application URL to allowed origins

Example:
```
http://localhost:5173
https://yourdomain.com
```

### Location data not showing

**Problem:** City/Country shows "unknown"

**Possible causes:**
- ipapi.co API is rate-limited or blocked
- User has VPN/Proxy active
- Network blocks external API calls

**Solution:**
- Use alternative geolocation service
- Contact your ISP/network administrator

## Security Best Practices

1. **Keep Keys Secret**
   - Never commit `.env.local` to git
   - Use `.gitignore` to exclude it

2. **Use RLS Policies**
   - Policies are already configured
   - Verify in Supabase dashboard

3. **Rotate Keys Regularly**
   - Go to Supabase API settings
   - Click "Rotate Key" periodically

4. **Monitor Data**
   - Review analytics regularly
   - Delete old data as per retention policy

## Privacy Compliance

⚠️ **Legal Notice:** This tracking system collects user data. Ensure compliance with:

- **GDPR** (Europe) - EU regulations on data protection
- **CCPA** (California) - California Consumer Privacy Act
- **LGPD** (Brazil) - Brazilian data protection law
- **Other local laws** - Check your jurisdiction

**Required steps:**
1. ✅ Add privacy policy mentioning tracking
2. ✅ Implement user consent mechanism
3. ✅ Provide data access/deletion requests
4. ✅ Document data retention policies
5. ✅ Implement data minimization

## Next Steps

1. Review `SUPABASE_INTEGRATION.md` for detailed API documentation
2. Customize analytics dashboard as needed
3. Implement consent management if required
4. Set up data retention policies
5. Monitor analytics regularly

## Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Vue 3 Docs:** https://vuejs.org
- **Environment Variables:** https://vitejs.dev/guide/env-and-modes.html
- **Supabase Community:** https://supabase.com/community

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review console errors (F12 → Console)
3. Check Supabase logs in the dashboard
4. Visit Supabase community forums

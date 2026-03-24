# Supabase Integration - User Tracking & Analytics

This project includes comprehensive user tracking and analytics powered by Supabase.

## Features

### Data Collected

The system automatically collects the following user data:

- **IP & Network Information**
  - IP Address (IPv4/IPv6)
  - ISP / Organization
  - ASN (Autonomous System Number)

- **Geolocation Data**
  - Country, Region, City
  - Latitude & Longitude
  - Timezone
  
- **Device & Browser Information**
  - OS Name & Version (Windows, macOS, Linux, iOS, Android)
  - Browser Name & Version (Chrome, Firefox, Safari, Edge)
  - Device Type, Brand, Model
  - Screen Resolution & Color Depth
  - Device Pixel Ratio

- **Device Fingerprinting**
  - Canvas Fingerprint
  - WebGL Fingerprint
  - Combined Device Fingerprint

- **Session Data**
  - Session Start/End Time
  - Page Views Count
  - Last Activity
  - Referrer

- **Page Views**
  - Page URL & Title
  - Time Spent on Page
  - Viewport Dimensions
  - Scroll Depth

- **Custom Events**
  - User Interactions
  - Navigation Events
  - Application Events

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Create Database Tables

Run the SQL migration in your Supabase SQL editor:

```sql
-- Copy the content from: scripts/001_create_tracking_tables.sql
```

Or execute the migration file directly if your setup supports it.

### 4. Verify RLS Policies

The migration includes Row Level Security (RLS) policies that allow:
- **Anonymous inserts** - Any user can log their own session/events
- **Authenticated reads** - Only authenticated users can view analytics

You can further restrict these in the Supabase dashboard if needed.

## API Reference

### useTracking Composable

Use the tracking composable in any Vue component:

```javascript
import { useTracking } from '@/composables/useTracking';

export default {
  setup() {
    const { 
      sessionId,
      initializeTracking,
      trackPage,
      logEvent,
      trackInteraction
    } = useTracking();

    // Initialize tracking
    onMounted(async () => {
      await initializeTracking();
    });

    // Track custom event
    const handleClick = () => {
      trackInteraction('button_clicked', 'click', { 
        buttonName: 'submit' 
      });
    };

    return { handleClick };
  }
};
```

### Tracking Service Functions

#### `trackSession(userData)`
Tracks a user session with all collected data.

**Parameters:**
- `userData` (optional) - User data object with IP, geolocation, device info, etc.

**Returns:** Session object with ID and metadata

#### `trackPageView(sessionId, pageUrl, pageTitle, timeOnPage)`
Tracks a page view within a session.

**Parameters:**
- `sessionId` - The session ID to associate with
- `pageUrl` - The URL of the page
- `pageTitle` - The title of the page
- `timeOnPage` - Time spent on page in milliseconds

#### `trackEvent(sessionId, eventName, eventData)`
Tracks a custom event.

**Parameters:**
- `sessionId` - The session ID to associate with
- `eventName` - Name of the event
- `eventData` - Optional JSON object with event metadata

#### `collectUserData()`
Collects all user data without storing it.

**Returns:** User data object

#### `generateDeviceFingerprint()`
Generates a device fingerprint using canvas and WebGL.

**Returns:** Object with device, canvas, and webgl fingerprints

#### `parseUserAgent(userAgent)`
Parses user agent string to extract OS and browser information.

**Returns:** Object with OS and browser details

#### `getLocationData()`
Fetches user's location based on IP using ipapi.co.

**Returns:** Geolocation object

#### `getScreenInfo()`
Gets screen and display information.

**Returns:** Screen info object

## Analytics Dashboard

Access the analytics dashboard by clicking the 📊 button in the navigation menu.

### Dashboard Features

- **Summary Stats** - Total sessions, page views, events, unique countries
- **Top Locations** - Most visited countries and cities with coordinates
- **Top Browsers** - Most used browsers and operating systems
- **Top ISPs** - Most common internet service providers
- **Recent Sessions** - Latest user sessions with details

### Data Visualization

Each table includes:
- Search and filtering capabilities
- Sortable columns
- Direct links to Google Maps for location data

## Database Schema

### user_sessions Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ip_address | VARCHAR | User's IP address |
| country_code | VARCHAR(2) | ISO country code |
| country_name | VARCHAR | Country name |
| city | VARCHAR | City name |
| latitude | DECIMAL | Geographic latitude |
| longitude | DECIMAL | Geographic longitude |
| timezone | VARCHAR | User's timezone |
| isp | VARCHAR | Internet service provider |
| device_fingerprint | VARCHAR | Combined device fingerprint |
| canvas_fingerprint | VARCHAR | Canvas-based fingerprint |
| webgl_fingerprint | VARCHAR | WebGL-based fingerprint |
| os_name | VARCHAR | Operating system |
| os_version | VARCHAR | OS version |
| browser_name | VARCHAR | Browser name |
| browser_version | VARCHAR | Browser version |
| user_agent | TEXT | Full user agent string |
| screen_width | INT | Screen width in pixels |
| screen_height | INT | Screen height in pixels |
| screen_color_depth | INT | Color depth |
| language | VARCHAR | User's language |
| referrer | TEXT | HTTP referrer |
| session_start | TIMESTAMP | Session start time |
| session_end | TIMESTAMP | Session end time |
| page_views | INT | Number of page views |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### user_page_views Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Foreign key to user_sessions |
| page_url | TEXT | Page URL |
| referrer_url | TEXT | Page referrer |
| time_on_page | INT | Time spent in milliseconds |
| created_at | TIMESTAMP | Record creation time |

### user_events Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Foreign key to user_sessions |
| event_name | VARCHAR | Event name |
| event_data | JSONB | Event data as JSON |
| created_at | TIMESTAMP | Record creation time |

## Privacy & Legal Considerations

⚠️ **Important:** This tracking system collects user data including IP addresses and device fingerprints. Ensure you:

1. **Have proper consent** - Include tracking disclosure in your privacy policy
2. **Comply with regulations** - GDPR, CCPA, LGPD, and other privacy laws
3. **Secure the data** - Implement appropriate access controls and data protection
4. **Provide opt-out** - Allow users to opt-out of tracking if required
5. **Data retention** - Implement data deletion policies

## Troubleshooting

### Analytics Not Recording

1. Check environment variables are set correctly
2. Verify Supabase project is accessible
3. Check browser console for errors
4. Ensure tables were created successfully
5. Verify RLS policies allow inserts

### Location Data Not Available

- Some networks block IP geolocation APIs
- VPN/Proxy usage may return different locations
- `ipapi.co` might be rate-limited or unavailable

### Performance Issues

- Consider implementing data archival for old records
- Add database indexes (already included in migration)
- Monitor table size and implement cleanup policies

## Security Notes

- Device fingerprints are hashed using base64 encoding
- Only anonymous inserts are allowed by default
- RLS policies restrict analytics reads to authenticated users
- IP addresses are stored in plain text - consider encryption for sensitive deployments

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review browser console for error messages
3. Verify database tables and RLS policies in Supabase dashboard

# Authentication Setup Guide

This guide will help you set up the authentication system for your Little Life Bloom virtual pet app.

## Database Setup

### 1. Run the Database Schema

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL script

This will create:
- `users` table for storing user profiles
- `pet_data` table for storing pet state
- Row Level Security (RLS) policies
- Triggers for automatic user profile creation
- Functions for updating timestamps

### 2. Verify Tables Created

After running the schema, you should see these tables in your Supabase dashboard:
- `public.users`
- `public.pet_data`

## Features Implemented

### Authentication System
- **Registration**: Simple username/password registration
- **Login**: Username/password authentication
- **Session Management**: Automatic session persistence
- **Logout**: Secure sign out functionality

### Data Persistence
- **Cloud Storage**: Pet data is saved to Supabase database
- **Local Backup**: Data is also cached in localStorage
- **Automatic Sync**: Data syncs between local and cloud storage
- **Offline Support**: App works offline with local data

### User Experience
- **Form Validation**: Client-side validation with helpful error messages
- **Loading States**: Visual feedback during authentication
- **Error Handling**: Clear error messages for failed operations
- **Responsive Design**: Works on all device sizes

## How It Works

1. **Registration**: Users create an account with username and password
2. **Login**: Users sign in with their credentials
3. **Data Sync**: Pet state is automatically saved to the database
4. **Persistence**: Users can access their pet from any device
5. **Security**: All data is protected with Row Level Security

## Security Features

- Passwords are encrypted by Supabase Auth
- Row Level Security ensures users can only access their own data
- Session tokens are automatically managed
- All database operations are authenticated

## Testing the System

1. Start the development server: `npm run dev`
2. Try registering a new account
3. Sign out and sign back in
4. Verify your pet data persists across sessions
5. Test on different devices/browsers

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Check your Supabase URL and API key
2. **Authentication Fails**: Verify the database schema was run correctly
3. **Data Not Syncing**: Check browser console for errors

### Debug Steps

1. Check Supabase dashboard for any failed queries
2. Verify RLS policies are enabled
3. Check browser network tab for API calls
4. Ensure user metadata is being set correctly

## Future Enhancements

- Email verification
- Password reset functionality
- Social login options
- Multiple pets per user
- Pet sharing features
- Achievement system

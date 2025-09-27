import { cookies } from 'next/headers';
import { supabaseMainAdmin } from '@/lib/supabaseMainAdmin';

export async function getUser() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('sessionCookie');
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    // Check session
    const { data: session, error: sessionError } = await supabaseMainAdmin
      .from('sessions')
      .select('user_id, expires')
      .eq('token', sessionCookie.value)
      .single();
    
    if (sessionError || !session) {
      return null;
    }
    
    // Check if session has expired
    const now = new Date();
    const expiryDate = new Date(session.expires);
    
    if (now > expiryDate) {
      // Delete session if it has expired
      await supabaseMainAdmin
        .from('sessions')
        .delete()
        .eq('token', sessionCookie.value);
      return null;
    }
    
    // Get user information from main 'users' table
    const { data: user, error: userError } = await supabaseMainAdmin
      .from('users')
      .select('user_id, username, email, first_name, role, created_at, last_login')
      .eq('user_id', session.user_id)
      .single();
    
    if (userError || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();
  return user !== null;
}

export async function logout(): Promise<void> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('sessionCookie');

  // Delete session from database
  if (sessionCookie) {
    try {
      await supabaseMainAdmin
        .from('sessions')
        .delete()
        .eq('token', sessionCookie.value);
    } catch (error) {
      console.error('Error deleting session from database:', error);
    }
  }

  // Clear the session cookie
  cookieStore.set({
    name: 'sessionCookie',
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });
}

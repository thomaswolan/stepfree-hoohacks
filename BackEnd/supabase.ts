import { createClient } from '@supabase/supabase-js'

// Define environment variables for Supabase URL and Anon Key
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY || ''

// Validate that the required environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

// Create a typed Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// --- Auth Helper Functions ---

/**
 * Sign up a new user with email and password
 * @param email - User's email
 * @param password - User's password
 */
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
  return data
}

/**
 * Sign in using email and password
 * @param email - User's email
 * @param password - User's password
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get the current authenticated user
 */
export const getUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  return user
}

// --- Route Tracking for User ---

/**
 * Track and insert route history for a user
 * @param userId - ID of the authenticated user
 * @param startPoint - Starting point of the route
 * @param endPoint - Destination point
 * @param routeData - JSON object containing route details
 * @param duration - Time taken to complete the route
 */
export const insertRouteHistory = async (
  userId: string,
  startPoint: string,
  endPoint: string,
  routeData: object,
  duration: number
) => {
  const { error } = await supabase.from('route_history').insert([
    {
      user_id: userId,
      start_point: startPoint,
      end_point: endPoint,
      route_data: routeData,
      duration: duration,
      completed_at: new Date(),
    },
  ])

  if (error) throw error
}

/**
 * Get route history for a user
 * @param userId - ID of the authenticated user
 */
export const getRouteHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('route_history')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) throw error
  return data
}

// --- Export the Supabase client for direct use ---
export default supabase
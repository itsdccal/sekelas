import { NextResponse } from 'next/server';

/**
 * Mock logout endpoint for development.
 * Clears auth cookies.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.delete('auth_token');
  response.cookies.delete('user_role');

  return response;
}

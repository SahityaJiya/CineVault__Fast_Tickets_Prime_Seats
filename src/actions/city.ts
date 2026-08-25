'use server';

import { cookies } from 'next/headers';

export async function setSelectedCityAction(citySlug: string) {
  const cookieStore = await cookies();
  cookieStore.set('selected_city', citySlug, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  });
}

export async function getSelectedCityAction(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get('selected_city')?.value || 'mumbai';
}
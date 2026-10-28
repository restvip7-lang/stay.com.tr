import type { APIRoute } from 'astro';
import { checkPassword, endSession, startSession } from '../../../lib/adminAuth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  if (form.get('logout')) {
    endSession(cookies);
    return redirect('/admin/', 303);
  }
  if (checkPassword(String(form.get('password') ?? ''))) {
    startSession(cookies);
    return redirect('/admin/', 303);
  }
  await new Promise((r) => setTimeout(r, 800));
  return redirect('/admin/?error=1', 303);
};

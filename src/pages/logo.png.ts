import type { APIRoute } from 'astro';
import { logoPng } from '../lib/og';

export const GET: APIRoute = () => logoPng();

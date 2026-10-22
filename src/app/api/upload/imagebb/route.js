import { auth } from '@/lib/auth';

const IMAGEBB_ENDPOINT = 'https://api.imgbb.com/1/upload';
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 30;

const uploadCounts = new Map();

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = uploadCounts.get(ip);

  if (!entry || now - entry.startedAt > RATE_LIMIT_WINDOW_MS) {
    uploadCounts.set(ip, { startedAt: now, count: 1 });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return Response.json(
      { error: 'Too many upload requests. Please try again later.' },
      { status: 429 }
    );
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user?.role !== 'admin') {
    return Response.json({ error: 'Admin access required.' }, { status: 401 });
  }

  const apiKey = process.env.ImageBB_api_key;
  if (!apiKey) {
    return Response.json(
      { error: 'ImageBB API key is not configured on the server.' },
      { status: 500 }
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Expected multipart/form-data upload.' }, { status: 400 });
  }

  const files = formData
    .getAll('images')
    .filter((entry) => entry && typeof entry === 'object' && typeof entry.arrayBuffer === 'function');

  if (files.length === 0) {
    return Response.json({ error: 'No image files were provided.' }, { status: 400 });
  }

  if (files.length > MAX_FILES) {
    return Response.json(
      { error: `You can upload at most ${MAX_FILES} images at once.` },
      { status: 400 }
    );
  }

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return Response.json(
        { error: 'Only JPEG, PNG, WebP, and GIF images are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return Response.json(
        { error: 'Each image must be 5 MB or smaller.' },
        { status: 400 }
      );
    }
  }

  try {
    const urls = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');

      const body = new FormData();
      body.append('image', base64);
      if (file.name) body.append('name', file.name);

      const res = await fetch(`${IMAGEBB_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        body,
      });
      const json = await res.json();

      if (!res.ok || !json?.data?.url) {
        const message = json?.error?.message || 'ImageBB upload failed.';
        throw new Error(message);
      }

      urls.push(json.data.display_url || json.data.url);
    }

    return Response.json({ urls });
  } catch (err) {
    return Response.json(
      { error: err.message || 'Failed to upload images.' },
      { status: 502 }
    );
  }
}

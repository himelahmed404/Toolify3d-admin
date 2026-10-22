# Deploy admin on Vercel

1. [Vercel Dashboard](https://vercel.com) → **Add New** → **Project** → import `0xW1zard/Toolify3d-admin` (or your admin repo name).
2. Framework Preset: **Next.js**. Root Directory: `.`
3. **Environment Variables** — from `.env.example`:
   - `API_URL` = Render API origin (Next rewrite for `/api/v1`).
   - `NEXT_PUBLIC_API_URL` = **same** Render origin (browser Socket.IO; rewrites do not apply).
   - `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` = this admin deployment URL.
   - `MONGO_URI` = shared Atlas URI.
   - `ImageBB_api_key` = upload key.
4. Deploy.
5. Ensure at least one Mongo user has `role: admin` (signup is disabled in admin Better Auth).
6. Update Render `CLIENT_URL` and `BETTER_AUTH_URL` to include this admin origin.

CLI (optional):

```bash
npx vercel link
npx vercel --prod
```

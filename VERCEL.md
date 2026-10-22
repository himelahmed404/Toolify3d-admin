# Deploy admin on Vercel

**Project (created + linked):** `himelahmed/toolify3d-admin`  
**GitHub:** https://github.com/himelahmed404/Toolify3d-admin

1. Open [Vercel → toolify3d-admin](https://vercel.com/himelahmed/toolify3d-admin).
2. **Settings → Environment Variables** — add every key from `.env.example` (none are set yet):
   - `API_URL` = Render API origin (Next rewrite for `/api/v1`).
   - `NEXT_PUBLIC_API_URL` = **same** Render origin (browser Socket.IO; rewrites do not apply).
   - `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` = this admin deployment URL.
   - `MONGO_URI` = shared Atlas URI (same as store + API).
   - `ImageBB_api_key` = upload key.
   - `BETTER_AUTH_SECRET` = strong random secret.
3. Deploy Production (`Deployments` → Deploy, or CLI below).
4. Ensure at least one Mongo user has `role: admin` (signup is disabled in admin Better Auth).
5. Update Render `CLIENT_URL` and `BETTER_AUTH_URL` to include this admin origin (`../SMOKE_TEST.md`).

CLI:

```bash
cd toolify-3d_admin
vercel link --yes --project toolify3d-admin   # already done locally
vercel --prod
```

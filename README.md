# Travel Bag Packer Frontend

React + Vite frontend for the Travel Bag Packer application, configured for zero-configuration deployment on **Render Static Sites**.

---

## 🚀 Quick Deployment on Render

### Option 1: Automatic via Blueprint (`render.yaml`)
1. In the [Render Dashboard](https://dashboard.render.com), click **New +** > **Blueprint**.
2. Connect your GitHub repository: `travel-bag-packer-frontend`.
3. Render automatically detects `render.yaml` and deploys the Static Site.
4. Set `VITE_API_BASE_URL` to your backend URL (e.g. `https://travel-bag-backend.onrender.com`).

### Option 2: Manual Setup on Render
1. In the Render Dashboard, click **New +** > **Static Site**.
2. Connect your GitHub repository: `travel-bag-packer-frontend`.
3. Configure the settings:
   - **Name**: `travel-bag-frontend`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://travel-bag-backend.onrender.com` (or your backend URL)
5. Under **Redirects/Rewrites**:
   - `public/_redirects` is bundled in the build output (`dist/_redirects`), routing `/*` to `/index.html` with HTTP 200.
6. Click **Create Static Site**.

---

## 🛠️ Local Development

```bash
npm install
npm run dev
```
The app will run at `http://localhost:5173` and connect to backend on `http://localhost:8080`.

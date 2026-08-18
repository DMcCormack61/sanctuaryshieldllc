# Deploy the Sanctuary Shield incident desk

This app is a **Node.js** site (map, database, sign-in). SiteGround Shared and Cloud hosting **do not run Node.js**. Uploading this folder into `public_html` will not start the desk.

Keep the existing marketing site on SiteGround. Run the desk on **Vercel** (free) at:

**https://desk.sanctuaryshieldllc.com**

Then point two SiteGround pages at it so visitors never leave your brand.

```
www.sanctuaryshieldllc.com          → SiteGround (current site)
desk.sanctuaryshieldllc.com         → this incident desk (Vercel)
/church-attack-headlines.html       → redirects to the desk
```

Time: about 30–45 minutes. You need a credit card on file for Vercel/Neon only if you leave the free tier later — the free plans are enough to start.

---

## What you will create

| Piece | Where | Purpose |
| --- | --- | --- |
| Source repo | GitHub | Holds the app code |
| App host | [Vercel](https://vercel.com) | Builds and serves the desk |
| Database | [Neon](https://neon.tech) | Stores incidents, watchlists, notes |
| Subdomain | SiteGround DNS | `desk.sanctuaryshieldllc.com` |
| Redirects | SiteGround File Manager | Old headlines URL still works |

---

## 1. Put the code on GitHub

1. Create a free account at [github.com](https://github.com) if you do not have one.
2. Click **New repository**. Name it `incident-desk`. Leave it **Private**.
3. Unzip `sanctuary-shield-incident-desk-source.zip` on your computer.
4. On GitHub, choose **uploading an existing file** and drag in everything from the unzipped folder (including hidden files such as `.gitignore`).
5. Click **Commit changes**.

You should see folders named `src`, `migrations`, `public`, and `deploy`.

---

## 2. Create the database (Neon)

1. Sign up at [neon.tech](https://neon.tech) with the same email.
2. Create a project named `sanctuary-shield`.
3. Region: pick **US East** (closest to Pennsylvania).
4. After it is created, open **Dashboard → Connection details**.
5. Copy the **pooled** connection string. It starts with `postgresql://` and includes `-pooler` in the host.
6. Keep this tab open.

---

## 3. Deploy the app (Vercel)

1. Sign up at [vercel.com](https://vercel.com) with **Continue with GitHub**.
2. Click **Add New… → Project**.
3. Import `incident-desk`.
4. Before you click Deploy, open **Environment Variables** and add:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | the Neon pooled string from step 2 |
| `BETTER_AUTH_URL` | `https://desk.sanctuaryshieldllc.com` |
| `BETTER_AUTH_SECRET` | a long random string (see below) |
| `VITE_PUBLIC_HOSTNAME` | `desk.sanctuaryshieldllc.com` |
| `VITE_AUTH_ENABLED` | `true` |

To make `BETTER_AUTH_SECRET`, in a browser console or any password generator create **at least 32 random characters**. Example shape (do not reuse this): `k7Q2mN9pR4wX8vL3tY6bC1hJ5sF0aD2e`.

5. Click **Deploy**. Wait until it says Ready. You will get a temporary URL like `incident-desk-xxx.vercel.app`. Open it. You should see the navy Sanctuary Shield header and the world map.

If the map is empty, refresh once — the first visit loads the incident file into Neon.

---

## 4. Attach desk.sanctuaryshieldllc.com

### In Vercel

1. Project → **Settings → Domains**.
2. Add `desk.sanctuaryshieldllc.com`.
3. Vercel will show a **CNAME** value, usually `cname.vercel-dns.com`.

### In SiteGround

1. Log in to [Site Tools](https://my.siteground.com).
2. Open the **sanctuaryshieldllc.com** site.
3. Go to **Domain → DNS Zone Editor**.
4. Add a record:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| CNAME | `desk` | `cname.vercel-dns.com` | default |

5. Save. DNS can take from 5 minutes to a few hours.
6. Back in Vercel, wait until the domain shows **Valid**.

Do **not** change the `www` or `@` records. Those keep the marketing site on SiteGround.

Visit **https://desk.sanctuaryshieldllc.com**. You should see the desk on your domain with a padlock.

---

## 5. Wire the existing SiteGround pages

Unzip `siteground-public-upload.zip`. In Site Tools:

1. Open **Site → File Manager**.
2. Go to `public_html`.
3. **Download a backup** of `church-attack-headlines.html` first (right-click → Download).
4. Upload the new `church-attack-headlines.html` (replace).
5. Upload `incident-desk.html` as a new file.
6. Open the existing `.htaccess` in `public_html`. **Do not delete it.** Scroll to the bottom and paste the three lines from `ADD-TO-HTACCESS.txt`. Save.

On the marketing homepage, add a nav or button link:

- Label: **Incident desk**
- URL: `https://desk.sanctuaryshieldllc.com/`

Anyone who still has the old headlines bookmark will land on the desk.

---

## 6. Sign-in on your own domain

The public desk (map, incidents, briefing) works with **no account**.

Watchlist and private notes need sign-in.

- **Google / X** on `desk.sanctuaryshieldllc.com` only work if this project is published through the Grok deploy pipeline (that injects broker keys). A standalone Vercel project will not get those keys.
- Until then, visitors can use the desk as guests. The **Sign in** button may fail on the custom domain. That does not affect the public record.

If you later want staff accounts without Google, ask to turn on email-and-password sign-in.

---

## 7. Checklist

- [ ] `https://desk.sanctuaryshieldllc.com` loads the navy header and world map
- [ ] An incident row opens a detail page
- [ ] `https://www.sanctuaryshieldllc.com/church-attack-headlines.html` redirects to the desk
- [ ] The main marketing site is unchanged
- [ ] `www` still points at SiteGround

---

## If something fails

| Symptom | Fix |
| --- | --- |
| SiteGround shows raw code or a blank page after you uploaded the source zip | You uploaded the Node app into `public_html`. Remove it. Only the two HTML files and the htaccess snippet belong on SiteGround. |
| Vercel build fails on `DATABASE_URL` | Paste the **pooled** Neon URL, not the direct one. |
| Domain says Invalid | The CNAME name must be exactly `desk`, value `cname.vercel-dns.com`. Wait for DNS. |
| Map is empty | Open the Vercel **Functions** log for the first request. Confirm Neon allows connections from anywhere (default). Refresh the desk. |
| Old headlines page still shows the previous feed | Browser cache, or `.htaccess` was not saved. Try a private window. |

---

## What not to do

- Do not point `www.sanctuaryshieldllc.com` at Vercel. That would take down the marketing site.
- Do not unzip the source package into `public_html`.
- Do not delete SiteGround’s existing `.htaccess`.
- Do not put secrets (`DATABASE_URL`, `BETTER_AUTH_SECRET`) in any file you upload to SiteGround.

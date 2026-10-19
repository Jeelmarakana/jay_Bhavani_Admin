# Jay Bhavani Ornaments — inquiry and admin starter

This is a new Angular + Node.js application for collecting product inquiries and
letting an authenticated admin review the client's message and optional design
reference image. The source for the previous localhost website was not present
in this folder, so this project is a standalone replacement starter rather than
an integration into that original site.

## Requirements

- Node.js 20 or newer
- MongoDB running locally or a MongoDB connection string

## Start the Node.js API

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Edit `server/.env` and set `MONGODB_URI`, `CLIENT_ORIGIN`, a unique
`JWT_SECRET` (at least 32 characters), `ADMIN_EMAIL`, and a strong
`ADMIN_PASSWORD` (at least 12 characters). Create the first admin and start the
API:

```powershell
npm run create-admin
npm run dev
```

The API listens on `http://localhost:3000`. Uploaded customer reference images
are stored outside the public web root and can only be retrieved by a logged-in
admin. In production, use private persistent storage and HTTPS.

## Start Angular

In a second terminal:

```powershell
cd client
npm install
npm start
```

Open `http://localhost:4200`. The public page is the client inquiry form; admin
sign-in is at `/admin/login`.

## Included

- Client inquiry form with required-field validation and optional image preview
- JPG, PNG, WebP upload limit of 5 MB, checked by the API as well as the browser
- MongoDB inquiry persistence and request rate limit
- Admin login using bcrypt password hashes and expiring JWTs
- Protected dashboard, searchable/status-filtered inbox, inquiry details,
  private image viewing, status/admin notes, WhatsApp link, and delete action

Admin account creation uses the credentials in the local `.env`; keep that file
private. Run `npm run create-admin` again to change the configured password.

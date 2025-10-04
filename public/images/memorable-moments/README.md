# Memorable Moments Images

This directory stores user-uploaded images for the "Memorable Moments" section.

## How It Works

1. **Upload**: Images are uploaded through the admin panel at `/admin/memorable-moments`
2. **Storage**: Images are stored in this directory (`public/images/memorable-moments/`)
3. **Optimization**: Images are automatically optimized to 1200x800px, 85% quality JPEG
4. **Database**: Image paths are stored in the database as `/images/memorable-moments/filename.jpg`

## Image Handling

The application uses different rendering methods for local vs external images:

- **Local images** (`/images/...`): Use native `<img>` tags with cache-busting query parameters
- **External images**: Use Next.js `<Image>` component with unoptimized mode

## Cache Busting

All local images automatically include a timestamp query parameter (`?t=timestamp`) to prevent caching issues after rebuild/restart.

## Persistence

- This directory is tracked by git (via `.gitkeep`)
- Uploaded images persist across builds and deployments
- Images are served directly from the public folder

## Troubleshooting

If images disappear after rebuild:

1. Check that files exist in `public/images/memorable-moments/`
2. Verify database has correct paths (should start with `/images/`)
3. Clear browser cache and hard refresh (Ctrl+Shift+R)
4. Restart the development server

## File Format

- Supported uploads: JPEG, PNG, WebP
- All images converted to optimized JPEG on upload
- Max file size: 5MB
- Naming: `timestamp_originalname.jpg`

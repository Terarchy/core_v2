# Deployment Guide: Netlify with Supabase

This guide walks you through deploying the Terarchy application to Netlify with a Supabase PostgreSQL database.

## 1. Set Up Supabase Database

1. Create an account on [Supabase](https://supabase.com)
2. Create a new project
3. Note your database connection string: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres`
4. Initialize your database schema:
   - In the Supabase dashboard, navigate to the SQL Editor
   - Use the Prisma schema from this project to create your tables
   - Alternatively, you can set up a migration process using Prisma

## 2. Configure Netlify Deployment

### Manual Deployment

1. Create an account on [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, etc.)
4. Select the repository containing this project
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables:
   - Go to Site settings → Environment variables
   - Add all variables from `.env.example` with your actual values
   - Make sure to set `NEXTAUTH_URL` to your Netlify domain
7. Deploy the site

### CLI Deployment

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Log in to your Netlify account: `netlify login`
3. Initialize the project: `netlify init`
4. Deploy: `netlify deploy --prod`

## 3. Database Migrations

After deploying your site, you'll need to set up your database schema:

1. Use Prisma to run migrations against your Supabase database:

   ```
   npx prisma migrate deploy
   ```

   You may need to set up a CI/CD pipeline to run this automatically.

## 4. Email Configuration

For email magic links to work, configure your email provider:

1. Set up an SMTP service like SendGrid, Mailgun, etc.
2. Add the SMTP configuration to your Netlify environment variables

## 5. Testing Your Deployment

1. Visit your Netlify domain
2. Test user authentication
3. Test database operations

## 6. Troubleshooting

- **Database Connection Issues**: Verify your Supabase connection string and make sure network access is allowed
- **Build Failures**: Check Netlify build logs for errors
- **API Routes Not Working**: Ensure your Netlify functions are configured correctly

## 7. Performance Optimization

- Enable Supabase connection pooling for better performance
- Set up a CDN for static assets
- Consider implementing caching strategies

---

For additional help, refer to:

- [Netlify Next.js Documentation](https://docs.netlify.com/integrations/frameworks/next-js/overview/)
- [Supabase Documentation](https://supabase.com/docs)

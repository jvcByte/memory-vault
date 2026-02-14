# Deployment Checklist

## Pre-Deployment

- [ ] All environment variables set in `.env.local`
- [ ] Supabase database setup complete
- [ ] Test login works locally
- [ ] Test admin panel works locally
- [ ] At least one memory created
- [ ] Both user accounts created (owner + viewer)

## Vercel Deployment

### 1. Push to GitHub
\`\`\`bash
git add .
git commit -m "Initial MemoryVault setup"
git push origin main
\`\`\`

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Framework Preset: Next.js (auto-detected)
5. Root Directory: `./memory-vault`

### 3. Configure Environment Variables
Add these in Vercel project settings:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
\`\`\`

### 4. Deploy
Click "Deploy" and wait ~2 minutes

## Post-Deployment

### 1. Update Supabase Auth Settings
1. Go to Supabase Dashboard
2. Authentication > URL Configuration
3. Add to "Redirect URLs":
   - `https://your-project.vercel.app/auth/callback`
   - `https://your-project.vercel.app/**`

### 2. Test Production
- [ ] Visit your Vercel URL
- [ ] Test login with magic link
- [ ] Verify memories display
- [ ] Test admin panel (owner only)
- [ ] Test on mobile device

### 3. Custom Domain (Optional)
1. In Vercel: Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars
5. Add custom domain to Supabase redirect URLs

## Performance Optimization

### Enable Vercel Analytics
1. Vercel Dashboard > Analytics
2. Enable Web Analytics
3. Monitor Core Web Vitals

### Optimize Images
- Use WebP format for photos
- Compress images before upload
- Recommended max size: 1920x1080, <500KB

### Database Optimization
- Add indexes for frequently queried fields
- Enable Supabase connection pooling
- Monitor query performance in Supabase Dashboard

## Security Checklist

- [ ] Service role key never exposed in client code
- [ ] RLS policies enabled on all tables
- [ ] Storage bucket policies configured
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Environment variables secured
- [ ] No sensitive data in git history

## Monitoring

### Vercel
- Check deployment logs
- Monitor function execution times
- Review error logs

### Supabase
- Monitor database usage
- Check auth logs
- Review storage usage

## Backup Strategy

### Database Backup
\`\`\`bash
# Export all data
supabase db dump > backup.sql
\`\`\`

Or use Supabase Dashboard:
1. Table Editor > Select table
2. Export as CSV
3. Store securely

### Storage Backup
Download all images from Supabase Storage bucket periodically

## Rollback Plan

If something goes wrong:

1. **Vercel**: Deployments > Previous deployment > Promote to Production
2. **Database**: Restore from backup SQL file
3. **Storage**: Re-upload backed up images

## Cost Estimates

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month, unlimited deployments
- **Supabase**: 500MB database, 1GB storage, 50K monthly active users

### Paid Plans (if needed)
- **Vercel Pro**: $20/month (1TB bandwidth)
- **Supabase Pro**: $25/month (8GB database, 100GB storage)

## Maintenance

### Weekly
- [ ] Check error logs
- [ ] Monitor storage usage
- [ ] Test critical features

### Monthly
- [ ] Review analytics
- [ ] Backup database
- [ ] Update dependencies: `pnpm update`

### Quarterly
- [ ] Security audit
- [ ] Performance review
- [ ] User feedback review

## Troubleshooting Production Issues

**"Authentication not working"**
- Check Supabase redirect URLs include production domain
- Verify environment variables in Vercel
- Check Supabase auth logs

**"Images not loading"**
- Verify storage bucket is public
- Check CORS settings in Supabase
- Confirm image URLs are correct

**"Slow page loads"**
- Enable Vercel Edge Functions
- Optimize images
- Add database indexes
- Enable Supabase connection pooling

**"Build fails"**
- Check build logs in Vercel
- Verify all dependencies installed
- Test build locally: `pnpm build`

## Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

🚀 Ready for production!

# Developer Playbook

## Development Environment Setup

### Prerequisites
- Node.js 20+
- pnpm 9.12.3+
- Git
- Supabase CLI (for local development)

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd m1ssion

# Install dependencies
corepack enable
pnpm install --frozen-lockfile

# Run security guard (must pass)
pnpm run -s prebuild

# Start development server
pnpm run dev
```

## Architecture Guidelines

### Frontend Structure
```
src/
├── components/     # Reusable UI components
├── pages/          # Route components
├── lib/            # Utilities and helpers
├── hooks/          # Custom React hooks
├── integrations/   # Third-party service wrappers
└── types/          # TypeScript definitions
```

### Code Organization Principles
- **Single Responsibility**: Each file/component has one clear purpose
- **Composition Over Inheritance**: Prefer functional composition
- **Co-location**: Keep related code together
- **Explicit Over Implicit**: Clear naming and explicit dependencies

## Critical Rules

### Push SAFE Guard
**NEVER modify these files without review:**
- `scripts/push-guard.cjs`
- `src/lib/vapid-loader.ts`
- `public/vapid-public.txt`
- Push notification flow in Service Worker

The guard prevents:
- Hardcoded secrets
- Project reference exposure
- VAPID key leaks
- Insecure token handling

### Environment Variables
```typescript
// ✅ CORRECT
const url = import.meta.env.VITE_SUPABASE_URL;

// ❌ WRONG - hardcoded
const url = "https://vkjrqirvdvjbemsfzxof.supabase.co";
```

### Supabase Client
Always use the singleton client:
```typescript
import { supabase } from "@/integrations/supabase/client";
```

Never create multiple instances - causes auth issues.

## Testing Strategy

### Pre-commit Checks
```bash
# Type checking
pnpm run type-check

# Lint
pnpm run lint

# Security guard
pnpm run prebuild

# Build verification
pnpm run build
```

### Manual Testing Checklist
- [ ] Auth flow (signup, login, logout)
- [ ] Push notification subscription
- [ ] Location permission flow
- [ ] Mission progress
- [ ] Payment flow (Stripe test mode)
- [ ] Mobile responsiveness
- [ ] PWA install

## Deployment

### Build Process
```bash
# Production build with guard
pnpm run -s prebuild && pnpm run build
```

Build output goes to `dist/` directory.

### Environment Configuration
Required environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Additional vars for Edge Functions (set in Supabase dashboard)

### Deploy Checklist
- [ ] Guard passes (no warnings)
- [ ] Build completes without errors
- [ ] Edge Functions deployed
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] CORS settings verified
- [ ] SSL certificates valid

## Debugging

### Console Logging
Use structured logging:
```typescript
console.info('[Feature] Action', { context });
console.error('[Feature] Error:', error);
```

### Browser DevTools
- Check Console for errors
- Network tab for API calls
- Application tab for Service Worker status
- Storage tab for tokens/cache

### Supabase Logs
- Edge Function logs in dashboard
- Database logs for RLS policy hits
- Auth logs for authentication issues

## Common Issues

### Push Notifications Not Working
1. Check Service Worker registration
2. Verify VAPID key is loaded correctly
3. Check browser permission status
4. Look for FCM/APNs errors in logs
5. Verify token in database

### Build Failures
1. Run `pnpm run -s prebuild` first
2. Check for TypeScript errors
3. Verify all imports are valid
4. Clear node_modules and reinstall
5. Check for circular dependencies

### RLS Policy Denials
1. Check user is authenticated
2. Verify user_id matches auth.uid()
3. Review policy conditions
4. Test with service role key (dev only)
5. Check for missing policies

## Performance Optimization

### Code Splitting
- Lazy load routes with React.lazy
- Dynamic imports for heavy components
- Minimize initial bundle size

### Asset Optimization
- Compress images (WebP format)
- Lazy load images below fold
- Use appropriate image sizes
- Implement loading states

### Database Queries
- Add indexes on frequently queried columns
- Use select() to limit returned columns
- Batch operations when possible
- Cache stable data client-side

## Security Best Practices

- Never commit secrets to git
- Use environment variables for config
- Implement RLS on all tables
- Validate all user inputs
- Sanitize data before display
- Use parameterized queries
- Keep dependencies updated
- Follow OWASP guidelines

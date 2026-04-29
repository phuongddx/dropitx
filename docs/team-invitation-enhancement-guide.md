# Team Invitation Enhancement Guide

This guide provides instructions for implementing the enhanced team invitation features in DropItX based on the comprehensive research completed.

## Overview

The enhanced invitation system includes:

1. **Enhanced Email Validation** - Real-time validation with typo detection
2. **Improved Copy UX** - Smart copy button with fallback support
3. **Status Indicators** - Visual badges for invite states
4. **Resend Functionality** - Resend expired or pending invites
5. **Bulk Invite Capabilities** - Multiple invites in a single request
6. **Enhanced Sharing** - Native email and Slack integration

## New Components

### 1. Enhanced Email Validation Hook

**File:** `hooks/use-email-validation.ts`

```tsx
import { useEmailValidation } from "@/hooks/use-email-validation";

// Usage in form component
const { email, setEmail, errors, isValid, hasErrors } = useEmailValidation();
```

**Features:**
- Real-time email validation
- Common typo detection (`.con` → `.com`, `.gmal` → `.gmail`, etc.)
- Maximum length validation (255 characters)
- Space validation
- Visual feedback with error messages

### 2. Smart Copy Button

**File:** `components/copy-button.tsx`

```tsx
import { CopyButton } from "@/components/copy-button";

// Usage
<CopyButton text="https://dropitx.com/invite?token=abc123" label="Copy Invite Link" />
```

**Features:**
- Modern clipboard API with fallback for older browsers
- Success/failure visual feedback
- Automatic state reset
- Accessible with proper ARIA labels

### 3. Enhanced Invite Dialog

**File:** `components/enhanced-invite-dialog.tsx`

```tsx
import { EnhancedInviteDialog } from "@/components/enhanced-invite-dialog";

// Usage
<EnhancedInviteDialog
  teamSlug={team.slug}
  open={isInviteDialogOpen}
  onOpenChange={setIsInviteDialogOpen}
  onInviteCreated={handleInviteCreated}
  pendingInvites={pendingInvites}
/>
```

**Features:**
- Enhanced email validation with real-time feedback
- Improved status badges (pending, accepted, expired)
- Resend functionality for expired invites
- Email and Slack sharing integration
- Better visual design with role indicators

### 4. Bulk Invite Dialog

**File:** `components/bulk-invite-dialog.tsx`

```tsx
import { BulkInviteDialog } from "@/components/bulk-invite-dialog";

// Usage
<BulkInviteDialog
  teamSlug={team.slug}
  open={isBulkInviteDialogOpen}
  onOpenChange={setIsBulkInviteDialogOpen}
  onInvitesCreated={handleInvitesCreated}
/>
```

**Features:**
- Multiple email input (comma or newline separated)
- Bulk API endpoint for efficiency
- Progress indicators and error handling
- Results summary with success/failure breakdown
- Copy functionality for failed/success lists

## API Enhancements

### 1. Resend Invite Endpoint

**File:** `app/api/dashboard/teams/[slug]/invites/[inviteId]/resend/route.ts`

**Features:**
- Resend pending invites with same token
- Generate new tokens for expired invites
- Extend expiry for resent invites
- Proper error handling and validation

### 2. Bulk Invite Endpoint

**File:** `app/api/dashboard/teams/[slug]/invites/bulk/route.ts`

**Features:**
- Process up to 50 emails per request
- Detect and skip duplicate invites
- Comprehensive error reporting
- Detailed success/failure breakdown

## Integration Steps

### Step 1: Add New Components

1. Copy all new component files to your project:
   - `hooks/use-email-validation.ts`
   - `components/copy-button.tsx`
   - `components/enhanced-invite-dialog.tsx`
   - `components/bulk-invite-dialog.tsx`

2. Add missing UI components:
   - `components/ui/textarea.tsx`

### Step 2: Update Existing Usage

Replace the existing `InviteMemberDialog` with the enhanced version:

**Before:**
```tsx
<InviteMemberDialog
  teamSlug={team.slug}
  open={isInviteDialogOpen}
  onClose={() => setIsInviteDialogOpen(false)}
  onInviteCreated={handleInviteCreated}
  pendingInvites={pendingInvites}
/>
```

**After:**
```tsx
<EnhancedInviteDialog
  teamSlug={team.slug}
  open={isInviteDialogOpen}
  onOpenChange={setIsInviteDialogOpen}
  onInviteCreated={handleInviteCreated}
  pendingInvites={pendingInvites}
/>
```

### Step 3: Add Bulk Invite Option

Add bulk invite functionality alongside the existing single invite:

```tsx
<div className="flex gap-2">
  <EnhancedInviteDialog
    teamSlug={team.slug}
    open={isInviteDialogOpen}
    onOpenChange={setIsInviteDialogOpen}
    onInviteCreated={handleInviteCreated}
    pendingInvites={pendingInvites}
  >
    <Button>
      <UserPlus className="size-4 mr-2" />
      Invite Member
    </Button>
  </EnhancedInviteDialog>
  
  <BulkInviteDialog
    teamSlug={team.slug}
    open={isBulkInviteDialogOpen}
    onOpenChange={setIsBulkInviteDialogOpen}
    onInvitesCreated={handleInviteCreated}
  />
</div>
```

### Step 4: Update Team Member Display

Enhance the `TeamMemberRow` component to show better status indicators:

```tsx
// Add status badge support
<StatusBadge status={getStatus(invite)} expiresAt={invite.expires_at} />
```

## Usage Patterns

### Pattern 1: Enhanced Single Invite

Use the enhanced dialog for individual team member invitations:

```tsx
// In your team dashboard
function TeamDashboard({ team, pendingInvites }) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Invite Actions */}
      <div className="flex gap-2">
        <EnhancedInviteDialog
          teamSlug={team.slug}
          open={isInviteDialogOpen}
          onOpenChange={setIsInviteDialogOpen}
          onInviteCreated={() => {
            // Refresh data after invite creation
            fetchTeamData();
          }}
          pendingInvites={pendingInvites}
        />
      </div>

      {/* Pending Invites Display */}
      <div className="space-y-2">
        <h3 className="font-medium">Pending Invites</h3>
        {pendingInvites.map(invite => (
          <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium">{invite.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={getStatus(invite)} expiresAt={invite.expires_at} />
                  <span className="text-xs text-muted-foreground">
                    Expires {formatDate(invite.expires_at)}
                  </span>
                </div>
              </div>
            </div>
            {/* Actions... */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Pattern 2: Bulk Team Onboarding

Use the bulk invite for onboarding multiple team members:

```tsx
function TeamOnboarding() {
  const [isBulkInviteDialogOpen, setIsBulkInviteDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Invite Your Team</h2>
        <p className="text-muted-foreground">
          Send invitations to multiple team members at once for faster setup.
        </p>
      </div>

      <BulkInviteDialog
        teamSlug={team.slug}
        open={isBulkInviteDialogOpen}
        onOpenChange={setIsBulkInviteDialogOpen}
        onInvitesCreated={() => {
          // Refresh team data after bulk invite
          fetchTeamData();
        }}
      />

      {/* Add some helpful tips */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Separate emails with commas or new lines</li>
          <li>• You can invite up to 50 people at once</li>
          <li>• Duplicate emails will be automatically detected</li>
          <li>• Use different roles based on team responsibilities</li>
        </ul>
      </div>
    </div>
  );
}
```

## Testing Recommendations

### 1. Email Validation Testing

Test various email formats and edge cases:

```tsx
// Test cases
const testEmails = [
  "valid@example.com",           // Valid
  "user.name@domain.co.uk",      // Valid with subdomain
  "invalid.email",               // Invalid (missing @)
  "invalid@domain",              // Invalid (missing TLD)
  "invalid@domain.",            // Invalid (ending dot)
  "invalid@.com",               // Invalid (missing domain)
  "test@con",                   // Invalid (typo: .con → .com)
  "test@gmal.com",              // Invalid (typo: gmal → gmail)
  "test@gmail.con",             // Invalid (typo: .con → .com)
  "test@tempmail.org",          // Valid (but disposable if implemented)
  "",                           // Invalid (empty)
  "   ",                         // Invalid (whitespace only)
  "test@domain.com ",           // Valid (trailing space)
  " test@domain.com",           // Valid (leading space)
];
```

### 2. Bulk Invite Testing

Test bulk operations with different scenarios:

```tsx
// Test scenarios
const testScenarios = [
  { emails: ["valid1@example.com", "valid2@example.com"], expected: "success" },
  { emails: ["valid1@example.com", "invalid-email"], expected: "partial_failure" },
  { emails: Array(51).fill("valid@example.com"), expected: "error_limit" }, // Over limit
  { emails: ["existing@example.com", "existing@example.com"], expected: "duplicates" },
];
```

### 3. API Testing

Test the new API endpoints:

```bash
# Test resend endpoint
curl -X POST "http://localhost:3000/api/dashboard/teams/slug/invites/123/resend" \
  -H "Authorization: Bearer token"

# Test bulk invite endpoint
curl -X POST "http://localhost:3000/api/dashboard/teams/slug/invites/bulk" \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"emails":["user1@example.com","user2@example.com"],"role":"editor"}'
```

## Migration Checklist

- [ ] Add new component files to project
- [ ] Create missing UI components (Textarea)
- [ ] Replace existing InviteMemberDialog usage
- [ ] Add new API route files
- [ ] Update team member display components
- [ ] Test email validation thoroughly
- [ ] Test bulk invite functionality
- [ ] Test resend functionality
- [ ] Verify accessibility compliance
- [ ] Update documentation if needed

## Performance Considerations

1. **Bulk API**: The bulk endpoint processes up to 50 emails efficiently, reducing API calls
2. **Debounced Validation**: Email validation is immediate but optimized for performance
3. **Error Handling**: Comprehensive error handling prevents UI blocking
4. **Memory Management**: Results are cleared when dialogs are closed to prevent memory leaks

## Security Considerations

1. **Email Validation**: Prevents malformed email injection
2. **Rate Limiting**: Consider implementing rate limiting on bulk endpoints
3. **Token Generation**: Uses cryptographically secure random tokens
4. **Input Sanitization**: All inputs are properly validated and sanitized

## Accessibility Features

1. **Focus Management**: Proper focus trapping in dialogs
2. **Keyboard Navigation**: Full keyboard accessibility
3. **Screen Reader Support**: Proper ARIA labels and descriptions
4. **Color Contrast**: WCAG 2.2 AA compliant color schemes
5. **Error Feedback**: Clear visual and textual error messages

This enhanced invitation system provides a significant improvement over the original implementation while maintaining compatibility with existing DropItX patterns and architecture.
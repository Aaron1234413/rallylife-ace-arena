# Complete Onboarding Flow Testing Checklist

## Pre-Testing Setup
- [x] Database trigger created for automatic token initialization
- [x] `initialize_player_tokens` function updated to give 100 starting tokens
- [x] Manual token initialization added to onboarding completion
- [x] Fixed coach_cxp query to filter by user ID

## 1. Test Complete Onboarding Flow End-to-End

### Step 1: Basic Information
- [ ] Full name input works correctly
- [ ] Location input shows Google Places autocomplete
- [ ] Location input populates with selected address
- [ ] Can proceed to next step with valid data
- [ ] Validation prevents proceeding with empty required fields

### Step 2: UTR Verification
- [ ] UTR rating dropdown shows proper 1.0-16.5 scale with 0.5 increments
- [ ] Manual skill level options reflect UTR-based ranges
- [ ] UTR lookup functionality works with various name formats
- [ ] Can verify actual UTR ratings
- [ ] Can proceed with manual level selection
- [ ] UTR branding and guidelines are properly displayed

### Step 3: Availability
- [ ] Time slot selection interface works
- [ ] Can save availability preferences
- [ ] Data persists correctly

### Step 4: Welcome Screen
- [ ] Displays proper UTR status (verified or manual)
- [ ] Shows selected location
- [ ] Token initialization happens on completion
- [ ] Redirects to dashboard properly

## 2. Google Places Autocomplete Testing

### Test Cases:
- [ ] "New York, NY" - should show multiple NYC options
- [ ] "Los Angeles" - should show LA options
- [ ] "London" - should show London, UK and other Londons
- [ ] "123 Main St" - should show address suggestions
- [ ] Invalid/non-existent location - should handle gracefully

### Functionality:
- [ ] Dropdown appears when typing
- [ ] Selecting an option populates the field
- [ ] Selected location data includes coordinates
- [ ] Works on both desktop and mobile

## 3. UTR Lookup Testing

### Test with Various Name Formats:
- [ ] "John Smith" (common name)
- [ ] "María García" (name with accents)
- [ ] "李小明" (non-Latin characters)
- [ ] "John" (single name)
- [ ] "Jean-Pierre" (hyphenated name)
- [ ] "van der Berg" (name with particles)
- [ ] Empty/invalid names

### Expected Behaviors:
- [ ] Successful matches return UTR rating
- [ ] Multiple matches show selection options
- [ ] No matches show appropriate message
- [ ] Error handling for API failures
- [ ] Fallback to manual entry always available

## 4. Token Initialization Testing

### New User Flow:
- [ ] Create new user account
- [ ] Complete onboarding process
- [ ] Verify user receives exactly 100 tokens
- [ ] Check both profiles and token_balances tables
- [ ] Confirm lifetime_tokens_earned starts at 0

### Database Trigger Testing:
- [ ] New user signup automatically triggers token initialization
- [ ] All player systems initialize (HP, XP, Avatar, Tokens)
- [ ] No errors in database logs
- [ ] Trigger works for different signup methods (email, OAuth if applicable)

## 5. Existing Users Token Verification

### For Existing Users:
- [ ] Users who already had tokens keep their existing balance
- [ ] Users without tokens get initialized with 100
- [ ] No duplicate records created
- [ ] Lifetime earned tokens preserved
- [ ] Daily streak and login data maintained

### Migration Verification:
- [ ] Run migration script successfully
- [ ] Check all users have token records
- [ ] Verify no data loss
- [ ] Confirm backward compatibility

## 6. Dashboard Integration Testing

### After Onboarding:
- [ ] Dashboard loads without errors
- [ ] Token count displays correctly (100 for new users)
- [ ] User profile information shows properly
- [ ] No coach-related errors for player accounts
- [ ] All dashboard features accessible

## 7. Edge Cases and Error Handling

### Network Issues:
- [ ] Graceful handling of Google Places API failures
- [ ] UTR lookup timeout handling
- [ ] Database connection issues during onboarding

### Data Validation:
- [ ] XSS prevention in text inputs
- [ ] SQL injection protection
- [ ] Proper sanitization of location data

### UI/UX:
- [ ] Loading states during API calls
- [ ] Proper error messages for users
- [ ] Responsive design on mobile devices
- [ ] Accessibility compliance

## 8. Performance Testing

### Load Times:
- [ ] Google Places API response time
- [ ] UTR lookup response time
- [ ] Database operations complete quickly
- [ ] Overall onboarding flow completion time

## Test Results Summary

### Successful Tests:
- Document which tests pass

### Failed Tests:
- Document failures with error details
- Note reproduction steps
- Suggest fixes

### Performance Metrics:
- API response times
- Database operation times
- Overall user experience ratings
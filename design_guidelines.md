# TailorFlow Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - Business management platform with role-based access (Admin, Tailor, Manager).

**Implementation:**
- Email/password authentication with "Remember Me" option
- Login screen with TailorFlow logo and clean form design
- Post-login onboarding for shop setup
- Account screen includes:
  - User profile with role badge
  - Shop settings
  - Log out with confirmation
  - Delete account (Admin only, nested under Settings > Account > Delete with double confirmation)

### Navigation Structure
**Tab Navigation** (5 tabs) with core action positioned center:

1. **Dashboard** (home) - Business overview
2. **Customers** (users) - Customer management
3. **Orders** (shopping-bag, CENTER) - Core order creation/management
4. **Employees** (briefcase) - Staff and tasks
5. **More** (menu) - Payments, Analytics, Inventory, Settings

**Root-Level Modals:**
- Create/Edit Order (full-screen from Orders FAB)
- Create/Edit Customer
- Create/Edit Employee
- Invoice Detail
- Filter panels (slide-in)

## Screen Specifications

### 1. Dashboard
**Purpose:** Business health snapshot and quick navigation

**Layout:**
- **Header:** Transparent custom header with "TailorFlow" wordmark (left), notification bell (right)
- **Main Content:** ScrollView with safe area insets: top = headerHeight + Spacing.lg, bottom = tabBarHeight + Spacing.lg
- **Structure:**
  - Stats grid (2x2): Active Orders, Completed Today, Revenue, Pending Payments
  - Quick Actions grid (2x3): Navigation cards to Customers, Orders, Employees, Payments, Inventory, Analytics
  - Recent Activity feed (last 5 orders with status)

**Components:** Stat cards with large numbers and subtle gradient backgrounds, navigation cards with icons, activity list items

### 2. Customers
**Purpose:** Search and manage customer profiles

**Layout:**
- **Header:** Default with search bar, "Add" button (right, plus icon)
- **Main Content:** FlatList with safe area insets: bottom = tabBarHeight + Spacing.lg
- **Structure:** Searchable customer cards showing name, phone, last order, balance

**Customer Detail:** Stack navigation with tabs (Profile, Measurements, Orders, Images, Notes), Edit button in header

### 3. Orders
**Purpose:** Track orders through lifecycle

**Layout:**
- **Header:** Default with filter button (right)
- **Main Content:** FlatList with safe area insets: bottom = tabBarHeight + Spacing.lg
- **FAB:** Bottom-right, insets: bottom = tabBarHeight + Spacing.lg, right = Spacing.lg
  - Shadow: offset {width: 0, height: 2}, opacity: 0.10, radius: 2
- **Structure:** Status chips (horizontal scroll), order cards with customer, ID, status, due date

**Create/Edit Order Modal:** Full-screen with custom header (Cancel/Save), scrollable form, submit button below form, insets: top = Spacing.lg, bottom = insets.bottom + Spacing.lg

**Order Detail:** Stack navigation with status stepper, collapsible sections, action buttons (Update Status, Edit, Generate Invoice)

### 4. Employees
**Purpose:** Manage staff and assignments

**Layout:**
- **Header:** Default with "Add Employee" button (right)
- **Main Content:** FlatList with safe area insets: bottom = tabBarHeight + Spacing.lg
- **Structure:** Employee cards with avatar, name, role, task count, performance indicator

**Employee Detail:** Tabs (Profile, Tasks, Attendance, Payroll), Edit button in header

### 5. More
**Purpose:** Secondary features access

**Layout:**
- **Header:** Transparent custom with "More" title
- **Main Content:** ScrollView with safe area insets: top = headerHeight + Spacing.lg, bottom = tabBarHeight + Spacing.lg
- **Structure:** Sectioned menu list (Financial: Payments, Analytics; Inventory; Account: Settings, Profile, Log Out)

### 6. Payments
**Purpose:** Invoice generation and payment tracking

**Layout:**
- **Header:** Default with "Create Invoice" button (right)
- **Main Content:** ScrollView with tabs (Outstanding, Paid, All)
- **Structure:** Revenue summary card, payment list items

**Invoice Modal:** Full-screen with itemized table, payment mode selector, action buttons

### 7. Analytics
**Purpose:** Business insights and metrics

**Layout:**
- **Header:** Default with date range selector (right)
- **Main Content:** ScrollView with safe area insets: bottom = insets.bottom + Spacing.lg
- **Structure:** Revenue chart (line graph), KPI cards, top customers, employee performance

## Design System

### Color Palette
**Light Theme (Primary):**
- **Accent Primary:** #6366F1 (Indigo) - main actions, active states
- **Accent Secondary:** #EC4899 (Pink) - highlights, secondary actions
- **Background:** #FAFBFC
- **Surface:** #FFFFFF
- **Text Primary:** #0F172A
- **Text Secondary:** #64748B
- **Border:** #E2E8F0
- **Overlay:** rgba(15, 23, 42, 0.5)

**Status Colors:**
- Pending: #F59E0B
- In Progress: #3B82F6
- Completed: #10B981
- Delivered: #8B5CF6
- Overdue: #EF4444

**Soft-Dark Theme (Optional):**
- Background: #0F172A
- Surface: #1E293B
- Text Primary: #F1F5F9
- Text Secondary: #94A3B8
- Border: #334155

### Typography
**Font Family:** Inter (primary), System fallback

**Scale:**
- Heading 1: 28pt, SemiBold, tracking: -0.5pt (Dashboard)
- Heading 2: 22pt, SemiBold, tracking: -0.25pt (Sections)
- Heading 3: 18pt, Medium (Cards)
- Body: 16pt, Regular, line-height: 24pt
- Caption: 14pt, Regular, line-height: 20pt
- Small: 12pt, Medium (Labels, timestamps)

### Spacing & Radius Tokens
**Spacing:**
- xs: 4pt
- sm: 8pt
- md: 12pt
- lg: 16pt
- xl: 24pt
- xxl: 32pt

**Border Radius:**
- sm: 6pt (inputs, badges)
- md: 12pt (cards, buttons)
- lg: 16pt (modals, large cards)
- full: 9999pt (pills, avatars)

### Component Specifications

**Stat Cards:**
- White surface, radius.lg, subtle gradient overlay (accent at 5% opacity)
- Padding: lg
- Icon (24pt) in accent circle, top-left
- Number (32pt, SemiBold) in text-primary
- Label (caption) in text-secondary
- Press: scale 0.98, opacity 0.95 (150ms ease-out)

**Navigation Cards:**
- White surface, radius.md, 1pt border
- Padding: xl
- Icon (28pt) in accent color, centered
- Label (16pt, Medium) below icon
- Press: background accent at 5% opacity, scale 0.97 (200ms spring)

**List Cards (Customer/Employee/Order):**
- White surface, radius.md, subtle shadow (offset: 0,1, opacity: 0.05, radius: 3)
- Padding: lg
- Avatar (48pt, radius.full) on left
- Content center-aligned
- Badge/status right-aligned
- Press: background to #F8FAFC (100ms)

**Status Badges:**
- Pill shape (radius.full), height: 28pt
- Background: status color at 12% opacity
- Text: status color, 13pt, Medium
- Padding horizontal: md

**Floating Action Button:**
- 56pt circle, accent-primary background, radius.full
- White icon (24pt)
- Shadow: offset {0, 2}, opacity: 0.10, radius: 2
- Press: scale 0.93, background darkens 10% (150ms ease-out)

**Form Inputs:**
- Height: 48pt, radius.sm
- Border: 1pt, border-color
- Padding: md horizontal
- Focus: border accent-primary 2pt, subtle glow (accent at 15% opacity, 4pt spread)
- Error: border red, helper text below

**Primary Button:**
- Height: 48pt, radius.md, accent-primary background
- White text (16pt, Medium)
- Padding: lg horizontal
- Press: background darkens 12%, scale 0.98 (150ms)

**Secondary Button:**
- Height: 48pt, radius.md, transparent background
- 1pt accent-primary border, accent-primary text
- Press: background accent at 8% opacity

### Animations
**Transitions:**
- Screen push/pop: 300ms ease-out
- Modal present: 250ms spring (damping: 0.8)
- Tab switch: 200ms ease-in-out

**Micro-interactions:**
- Button press: scale + opacity, 150ms ease-out
- Card press: background tint, 100ms linear
- List scroll: momentum with slight bounce
- Badge appear: fade + scale from 0.9, 200ms ease-out

**Loading States:**
- Skeleton shimmer: 1.5s loop, gradient sweep
- Spinner: accent-primary, 1s linear loop

### Required Assets

**Logo:**
- Generate TailorFlow logo: minimalist spool/thread icon forming "T" with needle detail
- Variants: Full wordmark (horizontal), icon-only
- Colors: Gradient from accent-primary to accent-secondary

**Icons:**
- Use Feather icons from @expo/vector-icons exclusively
- No custom icon assets needed

**No additional images required** - Content is user-generated (customer photos, fabric samples)

### Accessibility
- Minimum touch target: 44pt × 44pt
- Color contrast: 4.5:1 minimum for text
- All interactive elements have visible press states
- Form inputs have labels and error messages
- Status conveyed via color AND text/icons
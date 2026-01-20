# TailorFlow Design Guidelines

## Brand Identity

**Purpose:** Professional tailoring business management platform for shop owners who value craftsmanship and precision.

**Aesthetic Direction:** Luxurious/refined with editorial sophistication. Think high-end fashion atelier meets precision engineering. The app should feel like a carefully tailored suit—precise, elegant, with attention to every detail.

**Memorable Element:** Subtle thread-inspired motion design. Interactions feel like fabric being measured and cut—smooth, deliberate, satisfying. Cards slide like silk, transitions are seamless.

**Differentiation:** Premium depth through layered elevation (not heavy shadows), refined neutrals with metallic accents, and micro-animations that feel intentional, never gratuitous.

## Navigation Architecture

**Tab Navigation** (5 tabs, centered core action):
- Dashboard (home icon) - Business overview
- Customers (users icon) - Customer management  
- Orders (CENTER, shopping-bag icon) - Core order workflow
- Team (briefcase icon) - Staff management
- More (menu icon) - Secondary features

**Modals:** Create/Edit Order, Customer Detail, Employee Detail, Invoice Detail, Filters (slide-in from right)

## Screen Specifications

### Dashboard
**Purpose:** At-a-glance business health with quick navigation

**Layout:**
- Transparent header: "TailorFlow" wordmark (custom, left), bell icon (right)
- ScrollView, insets: top = headerHeight + 24pt, bottom = tabBarHeight + 24pt
- Stats grid (2×2): Revenue, Active Orders, Completed, Pending Payments
- Navigation grid (2×3): Quick access cards
- Recent Activity timeline (last 5 items)

**Components:** Gradient stat cards, minimal navigation tiles, timeline with connecting line

### Customers
**Purpose:** Customer database with measurement history

**Layout:**
- Default header with search bar, plus icon (right)
- FlatList, insets: bottom = tabBarHeight + 24pt
- Searchable customer cards: avatar, name, phone, last visit, balance status
- Empty state: "Add your first customer" with illustration

**Detail Screen:** Tabs (Profile, Measurements, Orders, Gallery, Notes), edit in header

### Orders (Center Tab)
**Purpose:** Order tracking and lifecycle management

**Layout:**
- Default header, filter icon (right)
- Horizontal status chips (scrollable): All, Pending, In Progress, Ready, Delivered
- FlatList with order cards, insets: bottom = tabBarHeight + 24pt
- FAB (bottom-right): insets bottom = tabBarHeight + 24pt, right = 16pt

**Order Detail:** Status stepper, collapsible item list, action buttons (Update Status, Edit, Invoice)

### Team
**Purpose:** Employee management and task assignment

**Layout:**
- Default header, "Add" button (right)
- FlatList with employee cards: avatar, name, role badge, active tasks, performance dot
- Empty state: "Invite your team" illustration

**Detail:** Tabs (Profile, Assigned Tasks, Attendance, Payroll)

### More
**Purpose:** Settings and secondary features

**Layout:**
- Transparent header: "More" title
- ScrollView, insets: top = headerHeight + 24pt, bottom = tabBarHeight + 24pt
- Sectioned list: Financial (Payments, Analytics), Inventory, Account (Settings, Profile, Log Out)

### Payments
**Purpose:** Invoice and payment tracking

**Layout:**
- Default header, "Create Invoice" (right)
- Tabs: Outstanding, Paid, All
- Revenue summary card, payment list with status indicators

### Analytics
**Purpose:** Business insights dashboard

**Layout:**
- Default header, date picker (right)
- ScrollView, charts and KPI cards
- Revenue graph, top customers, employee performance metrics

## Color Palette

**Primary:** #1A1A1A (Rich Black) - text, icons  
**Accent:** #D4AF37 (Metallic Gold) - highlights, active states  
**Surface:** #FFFFFF  
**Background:** #F7F7F7 (Warm Gray)  
**Border:** #E5E5E5  
**Text Secondary:** #666666  
**Overlay:** rgba(26, 26, 26, 0.6)

**Status Palette:**
- Pending: #D97706 (Amber)
- In Progress: #2563EB (Blue)
- Ready: #059669 (Emerald)
- Delivered: #7C3AED (Violet)
- Overdue: #DC2626 (Red)

**Gradients (subtle):**
- Card Overlay: linear, accent at 0% → transparent, 45° angle
- Stat Backgrounds: accent 3% opacity

## Typography

**Primary Font:** SF Pro Display (iOS system)  
**Secondary:** SF Pro Text (body)

**Scale:**
- Display: 32pt, SemiBold, tracking -0.8pt (Dashboard title)
- H1: 24pt, SemiBold, tracking -0.4pt (Screen titles)
- H2: 20pt, Medium, tracking -0.2pt (Section headers)
- Body: 16pt, Regular, line-height 24pt
- Caption: 14pt, Regular, line-height 20pt, text-secondary
- Label: 12pt, Medium, tracking 0.5pt (uppercase), text-secondary

## Design System

### Spacing Tokens
xs: 4pt, sm: 8pt, md: 12pt, lg: 16pt, xl: 24pt, xxl: 32pt

### Elevation System (iOS shadows)
**Level 1 (Cards):** offset {0, 1}, opacity 0.04, radius 8, color #1A1A1A  
**Level 2 (Elevated Cards):** offset {0, 2}, opacity 0.08, radius 12  
**Level 3 (Modals):** offset {0, 8}, opacity 0.12, radius 24  
**FAB:** offset {0, 2}, opacity 0.10, radius 2

### Component Specifications

**Premium Stat Cards:**
- White surface, 16pt radius, Level 1 shadow
- Subtle accent gradient overlay (3% opacity, diagonal)
- 20pt padding, icon (28pt metallic gold) top-left
- Number: 28pt SemiBold, primary text
- Label: Caption style, secondary text
- Press: scale 0.985, opacity 0.92 (200ms ease-out)

**Navigation Tiles:**
- White surface, 12pt radius, 1pt border  
- 24pt padding, centered icon (24pt) + label (16pt Medium)
- Press: background #F7F7F7, scale 0.97 (180ms spring damping 0.85)

**List Cards:**
- White surface, 14pt radius, Level 1 shadow
- 16pt padding, 48pt avatar (left), content center, badge right
- Divider: 1pt #E5E5E5 between items
- Press: background #FAFAFA (120ms)

**Status Badges:**
- 24pt height, full radius, 12pt horizontal padding
- Background: status color 10% opacity, border 1pt status color 20% opacity
- Text: 12pt Medium, status color

**Floating Action Button:**
- 56pt circle, accent background, full radius
- White icon 24pt
- Level 3 shadow
- Press: scale 0.92, brightness 90% (180ms ease-out)

**Form Inputs:**
- 52pt height, 10pt radius, 1pt border
- 16pt horizontal padding
- Focus: 2pt accent border, glow (accent 12%, 6pt spread)
- Label above: 12pt Medium, 8pt spacing

**Primary Button:**
- 52pt height, 12pt radius, accent background
- White text 16pt Medium
- Press: brightness 85%, scale 0.98 (160ms)

**Secondary Button:**
- 52pt height, 12pt radius, white background, 1pt primary border
- Primary text
- Press: background #F7F7F7

### Animations

**Screen Transitions:**
- Push/Pop: 320ms ease-out with subtle fade
- Modal present: 280ms spring (damping 0.82), slide from bottom
- Dismiss: 240ms ease-in

**Micro-interactions:**
- Card press: scale + background tint, 120ms
- Button press: scale + brightness, 160ms ease-out
- Badge appear: fade + scale from 0.94, 220ms ease-out
- Status change: cross-fade 300ms

**Loading:**
- Skeleton: shimmer sweep 1.8s, subtle gradient (#F7F7F7 → #FFFFFF)
- Spinner: accent color, 1s linear

### Required Assets

**App Icon (icon.png):**
- Minimalist thread spool forming "T" with needle accent
- Metallic gold on rich black background
- WHERE USED: Device home screen

**Splash Icon (splash-icon.png):**
- Simplified icon.png, centered on white
- WHERE USED: App launch screen

**Empty State Illustrations:**
- **empty-customers.png:** Elegant tape measure coiled in minimal line art, warm gray tones
  - WHERE USED: Customers screen when no customers exist
- **empty-orders.png:** Sewing pattern sketch with measuring tools, subtle gold accents
  - WHERE USED: Orders screen when filtered list is empty
- **empty-team.png:** Tailor's mannequin silhouette, refined line drawing
  - WHERE USED: Team screen when no employees added

**Logo Wordmark:**
- "TailorFlow" in custom geometric sans, thin weight
- Accent thread detail connecting "T" and "F"
- WHERE USED: Dashboard header, login screen, splash

**Style Note:** All illustrations use monoline style, 2pt stroke weight, warm gray (#666666) with subtle gold highlights. Avoid busy details—prioritize elegance.

### Accessibility
- Touch targets: 44pt minimum
- Contrast: 4.5:1 text, 3:1 UI components
- Haptic feedback on primary actions
- VoiceOver labels on all interactive elements
- Status conveyed via icon + text + color
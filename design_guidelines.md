# TailorFlow Design Guidelines

## Brand Identity

**Purpose:** Professional tailoring business management for shop owners who value craftsmanship and precision.

**Aesthetic Direction:** Luxurious/refined with editorial sophistication. High-end fashion atelier meets precision engineering. The app feels like a carefully tailored suit—precise, elegant, with attention to every detail.

**Memorable Element:** Subtle thread-inspired motion design. Interactions feel like fabric being measured and cut—smooth, deliberate, satisfying. Premium typography creates editorial hierarchy reminiscent of Vogue or Harper's Bazaar.

**Differentiation:** Distinctive typography pairing (refined serif + modern sans), layered elevation (not heavy shadows), refined neutrals with metallic accents, intentional micro-animations.

## Navigation Architecture

**Tab Navigation** (5 tabs, centered core action):
- Dashboard (home icon) - Business overview
- Customers (users icon) - Customer management  
- Orders (CENTER, shopping-bag icon) - Core order workflow
- Team (briefcase icon) - Staff management
- More (menu icon) - Settings & secondary features

**Modals:** Create/Edit Order, Customer Detail, Employee Detail, Invoice Detail, Filters (slide-in from right)

## Screen Specifications

### Dashboard
**Purpose:** At-a-glance business health with quick navigation

**Layout:**
- Transparent header: "TailorFlow" wordmark (left), bell icon (right)
- ScrollView, insets: top = headerHeight + 24pt, bottom = tabBarHeight + 24pt
- Stats grid (2×2): Revenue, Active Orders, Completed, Pending Payments
- Quick access grid (2×3): Navigation cards
- Recent Activity timeline (last 5 items)

**Components:** Gradient stat cards, minimal navigation tiles, timeline with connecting line

### Customers
**Purpose:** Customer database with measurement history

**Layout:**
- Default header with search bar, plus icon (right)
- FlatList, insets: bottom = tabBarHeight + 24pt
- Customer cards: avatar, name, phone, last visit, balance status
- Empty state: empty-customers.png illustration

**Detail Modal:** Tabs (Profile, Measurements, Orders, Gallery, Notes), edit button in header

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
- FlatList with employee cards: avatar, name, role badge, active tasks, performance indicator
- Empty state: empty-team.png illustration

**Detail Modal:** Tabs (Profile, Assigned Tasks, Attendance, Payroll)

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
- ScrollView with charts and KPI cards
- Revenue graph, top customers, employee performance metrics

## Color Palette

**Primary:** #1A1A1A (Rich Black) - text, icons  
**Accent:** #D4AF37 (Metallic Gold) - highlights, active states  
**Surface:** #FFFFFF  
**Background:** #F7F7F7 (Warm Gray)  
**Border:** #E5E5E5  
**Text Secondary:** #666666  
**Overlay:** rgba(26, 26, 26, 0.6)

**Status Colors:**
- Pending: #D97706, In Progress: #2563EB, Ready: #059669, Delivered: #7C3AED, Overdue: #DC2626

**Gradients:** Card overlay (accent to transparent, 45°), stat backgrounds (accent 3% opacity)

## Typography

**Primary Font:** Cormorant Garamond (headings, display)  
**Secondary Font:** Inter (body, UI)

**Type Scale:**
- Display: Cormorant 38pt Light, tracking -1.2pt, line-height 44pt (Dashboard hero)
- H1: Cormorant 28pt Regular, tracking -0.6pt, line-height 36pt (Screen titles)
- H2: Cormorant 22pt Medium, tracking -0.4pt, line-height 28pt (Section headers)
- H3: Inter 18pt SemiBold, tracking -0.2pt, line-height 24pt (Card titles)
- Body: Inter 16pt Regular, line-height 24pt
- Caption: Inter 14pt Regular, line-height 20pt, text-secondary
- Label: Inter 12pt Medium, tracking 0.8pt, uppercase, text-secondary

**Hierarchy Note:** Use Cormorant for editorial hierarchy (titles, headers). Use Inter for functional text (buttons, labels, body). This creates luxury magazine aesthetic while maintaining readability.

## Design System

**Spacing:** xs: 4pt, sm: 8pt, md: 12pt, lg: 16pt, xl: 24pt, xxl: 32pt

**Elevation (iOS shadows):**
- Level 1 (Cards): offset {0, 1}, opacity 0.04, radius 8
- Level 2 (Elevated): offset {0, 2}, opacity 0.08, radius 12
- Level 3 (Modals): offset {0, 8}, opacity 0.12, radius 24
- FAB: offset {0, 2}, opacity 0.10, radius 2

**Components:**

**Premium Stat Cards:** White, 16pt radius, Level 1 shadow, subtle accent gradient (3% opacity diagonal), 20pt padding, metallic gold icon (28pt), number (28pt SemiBold Inter), label (Caption). Press: scale 0.985, opacity 0.92 (200ms ease-out)

**Navigation Tiles:** White, 12pt radius, 1pt border, 24pt padding, centered icon (24pt) + label (16pt Inter Medium). Press: background #F7F7F7, scale 0.97 (180ms spring damping 0.85)

**List Cards:** White, 14pt radius, Level 1 shadow, 16pt padding, 48pt avatar, divider 1pt #E5E5E5. Press: background #FAFAFA (120ms)

**Status Badges:** 24pt height, full radius, 12pt horizontal padding, status color 10% opacity background, 1pt border status color 20% opacity, 12pt Inter Medium text

**FAB:** 56pt circle, accent background, white icon 24pt, Level 3 shadow. Press: scale 0.92, brightness 90% (180ms)

**Form Inputs:** 52pt height, 10pt radius, 1pt border, 16pt horizontal padding. Focus: 2pt accent border, glow (accent 12%, 6pt spread). Label: 12pt Inter Medium, 8pt spacing above

**Buttons:** Primary (52pt height, 12pt radius, accent background, white 16pt Inter Medium). Secondary (white background, 1pt primary border, primary text). Press: brightness 85%, scale 0.98 (160ms)

**Animations:**
- Screen transitions: 320ms ease-out with fade
- Modal: 280ms spring (damping 0.82), slide from bottom
- Card press: 120ms scale + background tint
- Status change: 300ms cross-fade
- Loading: shimmer 1.8s (#F7F7F7 → #FFFFFF)

## Assets to Generate

**icon.png:** Minimalist thread spool forming "T" with needle accent, metallic gold on rich black. WHERE USED: Device home screen

**splash-icon.png:** Simplified icon.png centered on white. WHERE USED: App launch screen

**empty-customers.png:** Elegant tape measure coiled in minimal monoline art (2pt stroke), warm gray (#666666) with subtle gold highlights. WHERE USED: Customers screen when empty

**empty-orders.png:** Sewing pattern sketch with measuring tools, monoline style, subtle gold accents. WHERE USED: Orders screen when filtered list empty

**empty-team.png:** Tailor's mannequin silhouette, refined line drawing, warm gray. WHERE USED: Team screen when no employees

**Logo Wordmark:** "TailorFlow" in Cormorant Garamond Light, subtle thread detail connecting letters. WHERE USED: Dashboard header, login, splash

**Style Note:** All illustrations use monoline style, 2pt stroke, warm gray with gold highlights. Elegant, not busy.

## Accessibility

- Touch targets: 44pt minimum
- Contrast: 4.5:1 text, 3:1 UI components
- Haptic feedback on primary actions
- VoiceOver labels on all interactive elements
- Status conveyed via icon + text + color
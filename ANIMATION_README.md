# Shared-Element Transition Animation

This project now includes a seamless shared-element transition animation for project cards, creating a polished "card → overlay" expand effect.

## How It Works

### 1. Shared Layout IDs
The animation uses Framer Motion's `layoutId` prop to create seamless transitions between:
- `card-${title}` - The entire card container
- `title-${title}` - The project title
- `media-${title}` - The project image

### 2. Animation Flow
1. **Click**: User clicks on any project card
2. **Morph**: Card smoothly transforms into the overlay using shared layout IDs
3. **Reveal**: Additional case study content fades/slides in after the morph
4. **Close**: Overlay closes on backdrop click, ESC key, or back button

### 3. Features
- ✅ **No visual style changes** - All fonts, colors, spacing, and shadows remain identical
- ✅ **Background scroll lock** - Prevents scrolling while overlay is open
- ✅ **Keyboard support** - ESC key closes the overlay
- ✅ **Focus management** - Returns focus to the original card
- ✅ **Responsive design** - Works on all screen sizes
- ✅ **Smooth animations** - Uses Framer Motion for 60fps transitions

## Components

### ProjectCard.tsx
- Wrapped with `motion.div` using `layoutId={`card-${title}`}`
- Title wrapped with `motion.div` using `layoutId={`title-${title}`}`
- Image wrapped with `motion.div` using `layoutId={`media-${title}`}`
- Added `onClick` prop for interaction

### ProjectOverlay.tsx
- Full-screen overlay with the same layout IDs
- Additional case study content with staggered fade-in animations
- Close button and backdrop click handling
- ESC key event listener

### ProjectsSection.tsx
- State management for selected project
- Click handlers for each project card
- Renders the overlay when a project is selected

## Usage

Simply click on any project card to see the animation in action. The card will smoothly expand into a full overlay revealing additional case study content.

## Technical Details

- **Framer Motion**: Used for all animations and shared-element transitions
- **Layout Animations**: Automatic layout calculations for smooth morphing
- **Staggered Animations**: Content reveals with sequential delays for polished feel
- **Performance**: Optimized with proper exit animations and cleanup

## Browser Support

Works in all modern browsers that support CSS transforms and animations. Gracefully degrades in older browsers.

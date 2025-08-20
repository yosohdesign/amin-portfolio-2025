# UX Portfolio

A modern, professional UX portfolio built with Next.js and Chakra UI, inspired by clean design principles and optimized for showcasing design work and case studies.

## Features

- **Modern Design**: Clean, professional layout with excellent typography and spacing
- **Responsive**: Fully responsive design that works on all devices
- **Case Studies**: Detailed project pages with challenge, solution, and results
- **Performance**: Built with Next.js for optimal performance and SEO
- **Accessibility**: WCAG compliant with proper semantic HTML and ARIA labels
- **Customizable**: Easy to customize colors, content, and styling

## Pages

### Landing Page (`/`)
- Hero section with value proposition
- Benefits and services showcase
- Featured project preview
- About section with personal information
- Contact call-to-action

### Projects Page (`/projects`)
- Grid layout of all projects
- Filterable by category
- Quick project previews
- Links to detailed case studies

### Case Study Pages (`/projects/[id]`)
- Detailed project information
- Challenge and solution breakdown
- Results and impact metrics
- Project images and mockups
- Call-to-action for collaboration

## Tech Stack

- **Next.js 14**: React framework with App Router
- **Chakra UI**: Component library for consistent design
- **TypeScript**: Type-safe development
- **Framer Motion**: Smooth animations and transitions
- **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ux-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customization

### Colors and Theme

Edit `lib/theme.ts` to customize:
- Color palette
- Typography
- Component styles
- Border radius and spacing

### Content

Update the following files to customize content:
- `components/HeroSection.tsx` - Main headline and description
- `components/BenefitsSection.tsx` - Services and value proposition
- `components/AboutSection.tsx` - Personal information
- `app/projects/page.tsx` - Project listings
- `app/projects/[id]/page.tsx` - Individual case studies

### Adding New Projects

1. Add project data to the `projects` object in `app/projects/[id]/page.tsx`
2. Add project preview to the `projects` array in `app/projects/page.tsx`
3. Create project images and update image paths

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing page
│   ├── projects/
│   │   ├── page.tsx        # Projects listing
│   │   └── [id]/page.tsx   # Individual case studies
│   └── providers.tsx       # Chakra UI provider
├── components/
│   ├── Navigation.tsx      # Header navigation
│   ├── HeroSection.tsx     # Landing hero
│   ├── BenefitsSection.tsx # Services showcase
│   ├── ProjectsSection.tsx # Featured project
│   ├── AboutSection.tsx    # Personal information
│   └── ContactSection.tsx  # Contact CTA
├── lib/
│   └── theme.ts            # Chakra UI theme configuration
└── package.json
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Performance Optimization

- Images are optimized with Next.js Image component
- Code splitting with dynamic imports
- Static generation for better SEO
- Responsive images for different screen sizes

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels and descriptions
- Keyboard navigation support
- High contrast color ratios
- Screen reader compatibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For questions or support, please open an issue on GitHub or contact the maintainer.

# Updated Tue Aug 19 00:24:56 CEST 2025
# Updated for Vercel deployment

/**
 * Image Optimization Utilities
 * 
 * Best practices for image handling in the application:
 * - Use blur placeholders for better perceived performance
 * - Implement responsive sizes for different layouts
 * - Use WebP format when supported
 * - Lazy load images by default
 * 
 * @module lib/imageOptimization
 */

/**
 * Generate a simple blur data URL for placeholder
 * Uses a tiny solid-color SVG that can be embedded
 * 
 * @param color - Color for the placeholder (default: light gray)
 * @returns Data URL for use as blurDataURL
 * 
 * @example
 * const blurData = generateBlurDataUrl('#e5e7eb');
 * <Image blurDataURL={blurData} placeholder="blur" />
 */
export function generateBlurDataUrl(color = '#e5e7eb'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect fill="${color}" width="1" height="1"/></svg>`;
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Blur placeholder constants for different use cases
 */
export const BLUR_PLACEHOLDERS = {
  // Tool screenshots (card context)
  SCREENSHOT_CARD: generateBlurDataUrl('#f3f4f6'),
  
  // Tool thumbnails in lists
  THUMBNAIL: generateBlurDataUrl('#e5e7eb'),
  
  // Profile/avatar images
  AVATAR: generateBlurDataUrl('#f0f0f0'),
  
  // Large hero/banner images
  BANNER: generateBlurDataUrl('#d1d5db'),
  
  // Generic fallback
  DEFAULT: generateBlurDataUrl('#e5e7eb'),
};

/**
 * Image dimensions for different contexts
 * Used to maintain aspect ratio and prevent layout shift
 */
export const IMAGE_DIMENSIONS = {
  // Tool card thumbnail
  CARD_THUMBNAIL: {
    width: 96,
    height: 64,
    aspectRatio: '3/2' as const,
  },
  
  // Screenshot preview in tool detail
  SCREENSHOT_PREVIEW: {
    width: 120,
    height: 80,
    aspectRatio: '3/2' as const,
  },
  
  // Full-width screenshot in tool detail
  SCREENSHOT_FULL: {
    width: 400,
    height: 260,
    aspectRatio: '20/13' as const,
  },
  
  // Avatar in user context
  AVATAR_SMALL: {
    width: 32,
    height: 32,
    aspectRatio: '1/1' as const,
  },
  
  AVATAR_MEDIUM: {
    width: 48,
    height: 48,
    aspectRatio: '1/1' as const,
  },
  
  AVATAR_LARGE: {
    width: 96,
    height: 96,
    aspectRatio: '1/1' as const,
  },
  
  // Banner/hero
  BANNER: {
    width: 1200,
    height: 400,
    aspectRatio: '3/1' as const,
  },
};

/**
 * Responsive sizes string for next/image
 * Helps the browser choose the right image size
 * 
 * @example
 * <Image sizes={RESPONSIVE_SIZES.CARD_THUMBNAIL} />
 */
export const RESPONSIVE_SIZES = {
  // Small thumbnail (mobile 96px, desktop 96px)
  CARD_THUMBNAIL: '(max-width: 768px) 96px, 96px',
  
  // Screenshot in list (mobile full width, desktop 120px)
  SCREENSHOT_PREVIEW: '(max-width: 768px) 100vw, 120px',
  
  // Full width screenshot (mobile 100%, desktop 400px)
  SCREENSHOT_FULL: '(max-width: 1024px) 100vw, 400px',
  
  // Avatar (always fixed size)
  AVATAR: '32px',
  
  // Banner (mobile 100%, desktop 1200px)
  BANNER: '(max-width: 1200px) 100vw, 1200px',
  
  // Generic full width
  FULL_WIDTH: '100vw',
};

/**
 * Image loading strategies
 * Different use cases need different loading approaches
 */
export const IMAGE_LOADING = {
  // Eager: Load immediately (hero, above fold)
  EAGER: 'eager' as const,
  
  // Lazy: Load when near viewport (below fold, cards)
  LAZY: 'lazy' as const,
};

/**
 * Utility to get image optimization props based on context
 * 
 * @param context - Image context (screenshot, avatar, banner, etc)
 * @returns Object with optimization props
 * 
 * @example
 * const props = getImageOptimizationProps('screenshot_card');
 * <Image {...props} src={src} alt={alt} />
 */
export function getImageOptimizationProps(
  context: 'screenshot_card' | 'screenshot_full' | 'avatar_small' | 'avatar_medium' | 'avatar_large' | 'banner' | 'thumbnail'
) {
  const configs = {
    screenshot_card: {
      ...IMAGE_DIMENSIONS.SCREENSHOT_PREVIEW,
      sizes: RESPONSIVE_SIZES.SCREENSHOT_PREVIEW,
      blurDataURL: BLUR_PLACEHOLDERS.SCREENSHOT_CARD,
      placeholder: 'blur' as const,
      loading: IMAGE_LOADING.LAZY,
    },
    screenshot_full: {
      ...IMAGE_DIMENSIONS.SCREENSHOT_FULL,
      sizes: RESPONSIVE_SIZES.SCREENSHOT_FULL,
      blurDataURL: BLUR_PLACEHOLDERS.SCREENSHOT_CARD,
      placeholder: 'blur' as const,
      loading: IMAGE_LOADING.LAZY,
    },
    avatar_small: {
      ...IMAGE_DIMENSIONS.AVATAR_SMALL,
      sizes: RESPONSIVE_SIZES.AVATAR,
      blurDataURL: BLUR_PLACEHOLDERS.AVATAR,
      placeholder: 'blur' as const,
      loading: IMAGE_LOADING.EAGER,
    },
    avatar_medium: {
      ...IMAGE_DIMENSIONS.AVATAR_MEDIUM,
      sizes: RESPONSIVE_SIZES.AVATAR,
      blurDataURL: BLUR_PLACEHOLDERS.AVATAR,
      placeholder: 'blur' as const,
      loading: IMAGE_LOADING.EAGER,
    },
    avatar_large: {
      ...IMAGE_DIMENSIONS.AVATAR_LARGE,
      sizes: RESPONSIVE_SIZES.AVATAR,
      blurDataURL: BLUR_PLACEHOLDERS.AVATAR,
      placeholder: 'blur' as const,
      loading: IMAGE_LOADING.EAGER,
    },
    banner: {
      ...IMAGE_DIMENSIONS.BANNER,
      sizes: RESPONSIVE_SIZES.BANNER,
      blurDataURL: BLUR_PLACEHOLDERS.BANNER,
      placeholder: 'blur' as const,
      loading: IMAGE_LOADING.EAGER,
    },
    thumbnail: {
      ...IMAGE_DIMENSIONS.CARD_THUMBNAIL,
      sizes: RESPONSIVE_SIZES.CARD_THUMBNAIL,
      blurDataURL: BLUR_PLACEHOLDERS.THUMBNAIL,
      placeholder: 'blur' as const,
      loading: IMAGE_LOADING.LAZY,
    },
  };
  
  return configs[context];
}

/**
 * Image optimization checklist for new features
 * 
 * When adding new images:
 * ✅ Use next/image (not <img>)
 * ✅ Set width and height props
 * ✅ Use appropriate blur placeholder
 * ✅ Set sizes prop for responsive images
 * ✅ Use loading="lazy" for below-fold images
 * ✅ Optimize source images (WebP, optimize dimensions)
 * ✅ Test with Lighthouse
 */
export const OPTIMIZATION_CHECKLIST = [
  'Use next/image component',
  'Set width and height props',
  'Set appropriate blur placeholder',
  'Set sizes prop for responsive images',
  'Use loading="lazy" for below-fold images',
  'Optimize source images (WebP format)',
  'Test with Lighthouse for performance',
  'Monitor Core Web Vitals (LCP, CLS)',
];

/**
 * Performance targets for images
 */
export const PERFORMANCE_TARGETS = {
  // LCP (Largest Contentful Paint) < 2.5s
  LCP_TARGET: 2500,
  
  // CLS (Cumulative Layout Shift) < 0.1
  CLS_TARGET: 0.1,
  
  // Average image size (uncompressed)
  AVERAGE_IMAGE_SIZE: 50000, // 50KB
  
  // Maximum total image size per page
  MAX_TOTAL_IMAGE_SIZE: 500000, // 500KB
};

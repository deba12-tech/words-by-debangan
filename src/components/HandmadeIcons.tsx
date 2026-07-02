'use client';

import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

// Common styling for hand-inked line art
const commonProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.5',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: 'transform transition-transform duration-300',
});

// A fountain pen nib
export const NibIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <path d="M12 2L9 8v4c0 1.66 1.34 3 3 3s3-1.34 3-3V8l-3-6z" />
    <path d="M12 2v10" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <path d="M7 21h10M12 15v6" />
  </svg>
);

// Needle and double-stitch thread
export const StitchIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <path d="M20 4L4 20" />
    <circle cx="20" cy="4" r="1.5" />
    {/* Stitches along the seam */}
    <path d="M6 8l3-3M9 11l3-3M12 14l3-3M15 17l3-3" />
  </svg>
);

// A wax seal stamp
export const SealIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <path d="M12 3c-4.42 0-8 3.58-8 8 0 2.21.9 4.21 2.35 5.65L5 21l3.5-1.5L12 21l3.5-1.5L19 21l-1.35-4.35C19.1 15.21 20 13.21 20 11c0-4.42-3.58-8-8-8z" />
    {/* Concentric inner wax ring */}
    <path d="M12 7c-2.2 0-4 1.8-4 4 0 1 .37 1.91 1 2.62L9 15h6l-1-1.38c.63-.71 1-1.62 1-2.62 0-2.2-1.8-4-4-4z" />
    <path d="M12 9v4" />
  </svg>
);

// Bookmarked page ribbon
export const RibbonIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <path d="M19 2H5c-1.1 0-2 .9-2 2v16l9-4 9 4V4c0-1.1-.9-2-2-2z" />
    <path d="M7 6h10M7 10h10" />
  </svg>
);

// A hand-cast bell
export const BellIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    <path d="M12 3v2" />
  </svg>
);

// Open literature book
export const BookIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    <path d="M12 7v14" />
  </svg>
);

// Hand-inked navigation arrows
export const FeatherLeftIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <path d="M20 12H4" />
    <path d="M10 18l-6-6 6-6" />
    {/* Feather lines */}
    <path d="M18 12l2-4M15 12l2-4M12 12l2-4M6 12l2-3" />
  </svg>
);

export const FeatherRightIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <path d="M4 12h16" />
    <path d="M14 6l6 6-6 6" />
    {/* Feather lines */}
    <path d="M6 12l-2 4M9 12l-2 4M12 12l-2 4M18 12l-2 3" />
  </svg>
);

// Ink blot / wax stamp theme switcher
export const ThemeIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    {/* Blot contours */}
    <path d="M12 6a6 6 0 0 0-6 6c0 1.25.38 2.41 1.03 3.38L6.5 17h11l-.53-1.62c.65-.97 1.03-2.13 1.03-3.38a6 6 0 0 0-6-6z" fill="currentColor" fillOpacity="0.15" />
    <path d="M10 10a2 2 0 1 1 4 0" />
  </svg>
);

// Quill stroke Search
export const SearchIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M16 16l5.5 5.5" />
    <path d="M12 8c-.6-.6-1.5-1-2.5-1" />
  </svg>
);

// Crossed Quill strokes close button
export const CloseIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

// Lock icon for CRM login
export const LockIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Plus icon for creation
export const PlusIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

// Trash bin
export const TrashIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

// Pencil/Edit
export const EditIcon = ({ size = 20, ...props }: IconProps) => (
  <svg {...commonProps(size)} {...props}>
    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

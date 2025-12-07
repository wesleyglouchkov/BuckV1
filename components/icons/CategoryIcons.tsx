import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}



export const CreativeIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M3 21L6 18L9 21L12 18L15 21L18 18L21 21"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 14L6 11L9 14L12 11L15 14L18 11L21 14"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 7L6 4L9 7L12 4L15 7L18 4L21 7"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FitnessIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="5.5" y="5.5" width="2" height="13" rx="1" fill="currentColor" opacity="0.9" />
    <rect x="16.5" y="5.5" width="2" height="13" rx="1" fill="currentColor" opacity="0.9" />
    <rect x="2" y="8.5" width="2" height="7" rx="1" fill="currentColor" opacity="0.9" />
    <rect x="20" y="8.5" width="2" height="7" rx="1" fill="currentColor" opacity="0.9" />
    <rect x="7.5" y="11" width="9" height="2" rx="1" fill="currentColor" opacity="0.9" />
  </svg>
);

export const TechnologyIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M7 10L10 13L7 16"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.9"
    />
    <path
      d="M11 15H13"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.9"
    />
  </svg>
);

export const CookingIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M5 12V18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V12H5Z"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M8 12V6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 12H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M8 8H16"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>
);

export const EducationIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 3L2 8L12 13L22 8L12 3Z"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M2 12L12 17L22 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 16L12 21L22 16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const YogaIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle
      cx="12"
      cy="5"
      r="2"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M12 9L10 14M12 9L14 14M12 9V14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 14L8 20M14 14L16 20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 11L10 14M18 11L14 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const HIITIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle
      cx="12"
      cy="6"
      r="2"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M12 8V12M9 10L12 12L15 10M9 14L12 16M15 14L12 16M8 18L12 20L16 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 12L6 10M20 12L18 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CardioIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M20.42 4.58C19.9181 4.07673 19.3223 3.67791 18.6658 3.40871C18.0094 3.13951 17.3053 3.00532 16.595 3.00532C15.8847 3.00532 15.1806 3.13951 14.5242 3.40871C13.8677 3.67791 13.2719 4.07673 12.77 4.58L12 5.36L11.23 4.58C10.2174 3.56737 8.84375 3.00532 7.405 3.00532C5.96625 3.00532 4.59262 3.56737 3.58 4.58C2.56737 5.59262 2.00532 6.96625 2.00532 8.405C2.00532 9.84375 2.56737 11.2174 3.58 12.23L4.36 13L12 20.64L19.64 13L20.42 12.23C20.9233 11.7281 21.3221 11.1323 21.5913 10.4758C21.8605 9.81941 21.9947 9.11529 21.9947 8.405C21.9947 7.69471 21.8605 6.99059 21.5913 6.33419C21.3221 5.67779 20.9233 5.08194 20.42 4.58Z"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M8 10L10 12L12 8L14 12L16 10"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.9"
    />
  </svg>
);

export const GroupTrainingIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="9" cy="7" r="2" fill="currentColor" opacity="0.9" />
    <circle cx="15" cy="7" r="2" fill="currentColor" opacity="0.9" />
    <path
      d="M12 13C10.3431 13 9 14.3431 9 16V18H15V16C15 14.3431 13.6569 13 12 13Z"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M6 13.5C4.89543 13.5 4 14.3954 4 15.5V18H6M18 13.5C19.1046 13.5 20 14.3954 20 15.5V18H18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 18V20M15 18V20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const EsportsIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M6 11L4 14L6 17M18 11L20 14L18 17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="7"
      y="8"
      width="10"
      height="8"
      rx="1"
      fill="currentColor"
      opacity="0.9"
    />
    <circle cx="10" cy="12" r="1.2" fill="white" opacity="0.9" />
    <circle cx="14" cy="12" r="1.2" fill="white" opacity="0.9" />
    <path
      d="M12 5V8M12 16V19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

import React from 'react';
import Image from 'next/image';

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
  <div className="pr-3 pb-2">
    <Image
      src="/svgs/categories/Yoga.svg"
      alt="Yoga"
      width={size}
      height={size}
      className={className}
    />
  </div>
);

export const HIITIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Image
    src="/svgs/categories/HIIT.svg"
    alt="HIIT"
    width={size}
    height={size}
    className={className}
  />
);

export const CardioIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Image
    src="/svgs/categories/Cardio.svg"
    alt="Cardio"
    width={size}
    height={size}
    className={className}
  />
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

// Pilates - Person in reformer-inspired pose
export const PilatesIcon: React.FC<IconProps> = ({ className = "", size = 20 }) => (
  <div className="pr-5 pb-1">
    <Image
      src="/svgs/categories/Pilates.svg"
      alt="Pilates"
      width={size}
      height={size}
      className={className}
    />
  </div>
);

// Strength Training - Dumbbell
export const StrengthTrainingIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <div className="-mr-2 -mb-4">
    <Image
      src="/svgs/categories/Strength Training.svg"
      alt="Strength Training"
      width={size}
      height={size}
      className={className}
    />
  </div>
);

// Dance - Dancing figure
export const DanceIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Image
    src="/svgs/categories/Dance.svg"
    alt="Dance"
    width={size}
    height={size}
    className={className}
  />
);

// Boxing - Boxing glove
export const BoxingIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Image
    src="/svgs/categories/Boxing.svg"
    alt="Boxing"
    width={size}
    height={size}
    className={className}
  />
);

// Stretching - Person stretching
export const StretchingIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Image
    src="/svgs/categories/Stretching.svg"
    alt="Stretching"
    width={size}
    height={size}
    className={className}
  />
);

// Meditation - Person meditating in lotus position
export const MeditationIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Image
    src="/svgs/categories/Meditation.svg"
    alt="Meditation"
    width={size}
    height={size}
    className={className}
  />
);

// Other - Generic category icon (grid/more)
export const OtherIcon: React.FC<IconProps> = ({ className = "", size = 24 }) => (
  <Image
    src="/svgs/categories/Other.svg"
    alt="Other"
    width={size}
    height={size}
    className={className}
  />
);

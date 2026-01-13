import {
    HIITIcon,
    StrengthTrainingIcon,
    YogaIcon,
    PilatesIcon,
    CardioIcon,
    DanceIcon,
    BoxingIcon,
    StretchingIcon,
    MeditationIcon,
    OtherIcon,
} from "@/components/icons/CategoryIcons";
import { FC } from "react";

// Icon props interface for category icons
interface IconProps {
    className?: string;
    size?: number;
}

// Category type definition
export interface WorkoutCategory {
    id: string;
    name: string;
    icon: FC<IconProps>;
    /** Optional display count for explore page */
    count?: number;
    fallbackImage: string;
}

/**
 * WORKOUT_CATEGORIES - Single source of truth for all workout/fitness categories
 */
export const CATEGORIES: WorkoutCategory[] = [
    {
        id: "hiit",
        name: "HIIT",
        icon: HIITIcon,
        fallbackImage: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=1200&auto=format&fit=crop"
    },
    {
        id: "strength-training",
        name: "Strength Training",
        icon: StrengthTrainingIcon,
        fallbackImage: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200&auto=format&fit=crop"
    },
    {
        id: "yoga",
        name: "Yoga",
        icon: YogaIcon,
        fallbackImage: "https://images.unsplash.com/photo-1544367563-12123d895951?q=80&w=1200&auto=format&fit=crop"
    },
    {
        id: "pilates",
        name: "Pilates",
        icon: PilatesIcon,
        fallbackImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop"
    },
    {
        id: "cardio",
        name: "Cardio",
        icon: CardioIcon,
        fallbackImage: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=1200&auto=format&fit=crop"
    },
    {
        id: "dance",
        name: "Dance",
        icon: DanceIcon,
        fallbackImage: "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1200&auto=format&fit=crop"
    },
    {
        id: "boxing",
        name: "Boxing",
        icon: BoxingIcon,
        fallbackImage: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1200&auto=format&fit=crop"
    },
    {
        id: "stretching",
        name: "Stretching",
        icon: StretchingIcon,
        fallbackImage: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=1200&auto=format&fit=crop"
    },
    {
        id: "meditation",
        name: "Meditation",
        icon: MeditationIcon,
        fallbackImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop"
    },
    {
        id: "other",
        name: "Other",
        icon: OtherIcon,
        fallbackImage: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1200&auto=format&fit=crop"
    },
];


/**
 * Helper to get workout type names only (for simple string arrays)
 */
export const WORKOUT_TYPE_NAMES = CATEGORIES.map((cat) => cat.name);

/**
 * Helper to get category by ID
 */
export function getCategoryById(id: string): WorkoutCategory | undefined {
    return [...CATEGORIES].find(
        (cat) => cat.id === id
    );
}

/**
 * Helper to get category by name (case-insensitive)
 */
export function getCategoryByName(name: string): WorkoutCategory | undefined {
    const lowerName = name.toLowerCase();
    return [...CATEGORIES].find(
        (cat) => cat.name.toLowerCase() === lowerName
    );
}
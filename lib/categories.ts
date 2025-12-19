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
}

/**
 * WORKOUT_CATEGORIES - Single source of truth for all workout/fitness categories
 * Used across the application for:
 * - Schedule Stream Dialog (workout type selection)
 * - Explore Page (category filtering)
 * - Any future category-related features
 */
export const CATEGORIES: WorkoutCategory[] = [
    { id: "hiit", name: "HIIT", icon: HIITIcon },
    { id: "strength-training", name: "Strength Training", icon: StrengthTrainingIcon },
    { id: "yoga", name: "Yoga", icon: YogaIcon },
    { id: "pilates", name: "Pilates", icon: PilatesIcon },
    { id: "cardio", name: "Cardio", icon: CardioIcon },
    { id: "dance", name: "Dance", icon: DanceIcon },
    { id: "boxing", name: "Boxing", icon: BoxingIcon },
    { id: "stretching", name: "Stretching", icon: StretchingIcon },
    { id: "meditation", name: "Meditation", icon: MeditationIcon },
    { id: "other", name: "Other", icon: OtherIcon },
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
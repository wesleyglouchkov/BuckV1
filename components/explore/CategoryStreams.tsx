import { VideoCard } from "@/components/VideoCard";
import { useSignedThumbnails } from "@/hooks/use-signed-thumbnails";
import { SkeletonCard } from "@/components/ui/skeleton-variants";
import { getCategoryByName } from "@/lib/constants/categories";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { SidebarCategory } from "@/hooks/explore";

interface CategoryStreamsProps {
    isLoading?: boolean;
    categories: SidebarCategory[];
}

export function CategoryStreams({ isLoading = false, categories }: CategoryStreamsProps) {
    // Flatten all streams for thumbnail signing
    const allStreams = categories.flatMap(cat => cat.previewStreams);
    const signedThumbnails = useSignedThumbnails(allStreams);

    // Filter categories that have streams
    const categoriesWithStreams = categories.filter(cat => cat.previewStreams.length > 0);

    if (isLoading) {
        return (
            <div className="space-y-12">
                {Array.from({ length: 3 }).map((_, catIndex) => (
                    <section key={catIndex}>
                        <div className="h-8 w-48 bg-muted animate-pulse mb-6" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <SkeletonCard key={i} className="h-[220px]" />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        );
    }

    if (categoriesWithStreams.length === 0) {
        return (
            <div className="py-16 text-center">
                <p className="text-muted-foreground">No streams available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {categoriesWithStreams.map((category) => {
                const streams = category.previewStreams;
                const staticCategory = getCategoryByName(category.name);
                const IconComponent = staticCategory?.icon || getCategoryByName("Other")?.icon;

                return (
                    <section key={category.name} id={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        {/* Category Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10">
                                    {IconComponent && <IconComponent className="w-5 h-5 text-primary" />}
                                </div>
                                <h2 className="text-xl font-bold text-foreground">{category.name}</h2>
                                <span className="text-sm text-muted-foreground">
                                    {category.count} {category.count === 1 ? "stream" : "streams"}
                                </span>
                            </div>
                            <Link
                                href={`/explore?tab=streams&category=${encodeURIComponent(category.name)}`}
                                className="flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer"
                            >
                                View all
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Streams Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {streams.slice(0, 4).map((stream) => (
                                <VideoCard
                                    key={stream.id}
                                    stream={stream}
                                    signedThumbnailUrl={signedThumbnails[stream.id]}
                                />
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

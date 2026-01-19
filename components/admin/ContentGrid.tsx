import { ReactNode, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban, Video, Play, X } from "lucide-react";
import { VideoSnapshot } from "@/lib/s3/video-thumbnail";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FlaggedContent } from "@/services/admin";
import ModerationVideoPlayer from "@/components/admin/ModerationVideoPlayer";

export function ContentGrid({
  videos,
  onWarn,
  getWarningColor
}: {
  videos: FlaggedContent[];
  onWarn: (v: FlaggedContent) => void;
  getWarningColor?: (count: number) => string;
}) {
  // Video dialog state
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<FlaggedContent | null>(null);

  const openVideo = (v: FlaggedContent) => {
    setCurrentVideo(v);
    setIsVideoOpen(true);
  };
  const closeVideo = () => {
    setIsVideoOpen(false);
    setTimeout(() => setCurrentVideo(null), 200);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.filter((v) => v.flagged).map((v) => (
        <Card key={v.id} className="border border-border/40 hover:shadow-lg ease-in-out duration-200 hover:scale-[1.01] transition-all h-full flex flex-col rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="w-4 h-4 text-muted-foreground" />
              <p className="pt-1"> {v.title} </p>
            </CardTitle>
            <div className="text-[10px] uppercase font-bold px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/30">Flagged</div>
          </CardHeader>
          <CardContent className="flex flex-col grow pb-4">
            <div className="relative aspect-video w-full mb-4 overflow-hidden border border-border/20 bg-muted">
              {v.thumbnail ? (
                <img className="h-full w-full object-cover" src={v.thumbnail} alt={v.title} />
              ) : v.streamUrl ? (
                <VideoSnapshot
                  src={v.streamUrl}
                />
              ) : (
                <img className="h-full w-full object-cover opacity-50" src={'https://www.epiphan.com/wp-content/uploads/2019/04/How-to-live-stream-an-event-well_FB.jpg'} alt={v.title} />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all group">
                <Button
                  variant="default"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity rounded-none"
                  onClick={() => openVideo(v)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
              </div>
            </div>
            <div className="space-y-1 mb-3">
              <p className="text-sm font-medium text-foreground">{v.creator.name}</p>
              <p className="text-xs text-muted-foreground">{v.creator.email}</p>
            </div>

            {/* Warning Count Badge */}
            {getWarningColor && (
              <div className="mb-3">
                <div className={`px-3 py-1.5 text-xs font-bold inline-flex items-center border border-current/10 ${getWarningColor(v.creator.warningCount)}`}>
                  {v.creator.warningCount} {v.creator.warningCount < 2 ? "warning" : "warnings already"}
                </div>
              </div>
            )}

            <div className="mt-3 p-3 border border-red-500/30 bg-red-500/5">
              <p className="text-xs font-semibold text-red-500 mb-1">Reported Info</p>
              <p className="text-sm text-foreground">{v.reporterComment || "Bad comment"}</p>
            </div>
            <div className="mt-auto pt-4 flex items-center gap-2">
              <Button variant="destructive" size="sm" onClick={() => onWarn(v)} className="rounded-none">
                <Ban className="w-4 h-4 mr-1" />
                Warn
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Video Dialog */}
      <Dialog open={isVideoOpen} onOpenChange={closeVideo}>
        <DialogContent className="max-w-3xl">
          <button
            aria-label="Close"
            onClick={closeVideo}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogHeader>
            <DialogTitle>{currentVideo?.title || "Video"}</DialogTitle>
          </DialogHeader>
          {currentVideo && (
            <div className="w-full space-y-4">
              {/* Vidstack Video Player */}
              {currentVideo.streamUrl ? (
                <ModerationVideoPlayer
                  src={currentVideo.streamUrl}
                  title={currentVideo.title}
                  poster={currentVideo.thumbnail}
                />
              ) : (
                <p className="text-center dark:text-white py-8">Stream not available</p>
              )}
              {/* Creator + Actions */}
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm space-y-1">
                  <p className="font-medium text-foreground">{currentVideo.creator.name}</p>
                  <p className="text-muted-foreground">{currentVideo.creator.email}</p>
                  {/* Warning count in dialog */}
                  {getWarningColor && (
                    <div className={`px-3 py-1 text-xs font-bold inline-flex items-center ${getWarningColor(currentVideo.creator.warningCount)}`}>
                      {currentVideo.creator.warningCount} {currentVideo.creator.warningCount === 1 ? "warning" : "warnings"}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="destructive" size="sm" onClick={() => onWarn(currentVideo)}>
                    <Ban className="w-4 h-4 mr-1" />
                    Warn
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

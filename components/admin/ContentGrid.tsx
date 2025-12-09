import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export type VideoItem = {
  id: string;
  title: string;
  thumbnail: string;
  flagged?: boolean;
  reportedComment?: string;
  creator: { name: string; email: string };
};

export function ContentGrid({ videos, onWarn }: { videos: VideoItem[]; onWarn: (v: VideoItem) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.filter((v) => v.flagged).map((v) => (
        <Card key={v.id} className="border-none hover:shadow-lg ease-in-out duration-200 hover:scale-101 transition-all h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="w-4 h-4 text-muted-foreground" />
              <p className="pt-1"> {v.title} </p>
            </CardTitle>
            <div className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/30">Flagged</div>
          </CardHeader>
          <CardContent className="flex flex-col grow pb-4">
            <div className="aspect-video w-full rounded-md mb-4 overflow-hidden">
              <img className="h-full w-full object-cover" src={'https://www.epiphan.com/wp-content/uploads/2019/04/How-to-live-stream-an-event-well_FB.jpg'} alt={v.title} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{v.creator.name}</p>
              <p className="text-xs text-muted-foreground">{v.creator.email}</p>
            </div>
            <div className="mt-3 p-3 rounded-md border border-red-500/30 bg-red-500/5">
              <p className="text-xs font-semibold text-red-500 mb-1">Reported Info</p>
              <p className="text-sm text-foreground">{v.reportedComment || "Bad comment"}</p>
            </div>
            <div className="mt-auto pt-4 flex items-center gap-2">
              <Button variant="destructive" size="sm" onClick={() => onWarn(v)}>
                <Ban className="w-4 h-4 mr-1" />
                Warn
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

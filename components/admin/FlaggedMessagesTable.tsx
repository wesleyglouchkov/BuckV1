import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Eye, Ban } from "lucide-react";

export type Message = {
  id: string;
  content: string;
  sender: { name: string; email: string; warningCount: number };
  timestamp: string;
};

export function FlaggedMessagesTable({
  isLoading,
  messages,
  filteredMessages,
  formatTimestamp,
  getWarningColor,
  onView,
  onWarn,
}: {
  isLoading: boolean;
  messages: Message[];
  filteredMessages: Message[];
  formatTimestamp: (t: string) => string;
  getWarningColor: (c: number) => string;
  onView: (m: Message) => void;
  onWarn: (m: Message) => void;
}) {
  return (
    <div className="bg-card rounded-lg border border-border/30 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/20">
        <div className="flex items-center justify-between">
          <div className=" text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5  text-orange-500" />
            <p className="pt-1.5"> Flagged Messages</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${filteredMessages.length} message(s) found`}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Message Preview</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Warnings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-primary/10 animate-pulse rounded w-3/4"></div>
                      <div className="h-3 bg-primary/10 animate-pulse rounded w-1/2"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-primary/10 animate-pulse rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-primary/10 animate-pulse rounded w-40"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-16 bg-primary/10 animate-pulse rounded-full"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-primary/10 animate-pulse rounded w-28"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <div className="h-8 w-20 bg-primary/10 animate-pulse rounded"></div>
                      <div className="h-8 w-20 bg-primary/10 animate-pulse rounded"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : filteredMessages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Shield className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">No messages found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {"Try adjusting your search or filters"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredMessages.map((message) => (
                <tr key={message.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                      <p className="mt-2 text-sm text-foreground line-clamp-2">{message.content}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-foreground">{message.sender.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground">{message.sender.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`px-3 border-2 min-w-[90px] py-1 rounded-full text-xs font-bold inline-flex items-center ${getWarningColor(message.sender.warningCount)}`}>
                      {message.sender.warningCount} {message.sender.warningCount === 1 ? "warning" : "warnings"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-muted-foreground">{formatTimestamp(message.timestamp)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center " onClick={() => onView(message)}>
                        <Eye className="w-4 h-4 mr-1" />
                        <p className="mt-1">View</p>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onWarn(message)}>
                        <Ban className="w-4 h-4 mr-1" />
                        <p className="mt-1"> Warn</p>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ModerationTabsProps = {
  activeTab: string;
  onTabChange: (value: string) => void;
  messagesContent: ReactNode;
  contentGrid: ReactNode;
};

export function ModerationTabs({ activeTab, onTabChange, messagesContent, contentGrid }: ModerationTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
        <TabsTrigger value="messages" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          Messages Moderation
        </TabsTrigger>
        <TabsTrigger value="content" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          Content Moderation
        </TabsTrigger>
      </TabsList>

      <TabsContent value="messages" className="mt-0">
        {messagesContent}
      </TabsContent>

      <TabsContent value="content" className="mt-0">
        {contentGrid}
      </TabsContent>
    </Tabs>
  );
}

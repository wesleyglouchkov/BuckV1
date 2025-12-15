
export default function CreatorRevenuePage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Revenue</h1>
                <p className="text-muted-foreground mt-2">
                    Track your earnings from tips, subscriptions, and more.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border/20 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">Tips List</h2>
                    <p className="text-muted-foreground">Recent tips will appear here.</p>
                </div>
                <div className="bg-card border border-border/20 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">Subscriptions</h2>
                    <p className="text-muted-foreground">Subscription revenue details will appear here.</p>
                </div>
            </div>
        </div>
    );
}

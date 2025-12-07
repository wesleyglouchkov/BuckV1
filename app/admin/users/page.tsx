"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { adminService, type User } from "@/services/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Users, Filter } from "lucide-react";
import { SkeletonBox } from "@/components/ui/skeleton-variants";

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<'creator' | 'member'>('creator');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // SWR fetcher
  const fetcher = () => {
    const params: any = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      type: activeTab,
      search: searchQuery,
    };

    if (statusFilter === "active") {
      params.isActive = true;
    } else if (statusFilter === "inactive") {
      params.isActive = false;
    }

    return adminService.getUsers(params);
  };

  const { data, error, isLoading, mutate } = useSWR(
    `/admin/users?type=${activeTab}&page=${currentPage}&search=${searchQuery}&status=${statusFilter}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const users = data?.data || [];
  const hasNextPage = users.length === ITEMS_PER_PAGE;

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'creator' | 'member');
    setCurrentPage(1);
    setSearchQuery("");
    setStatusFilter("all");
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminService.updateOptions(userId, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'unblocked' : 'blocked'} successfully`);
      mutate(); // Refresh the data
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        </div>
        <p className="text-muted-foreground">Manage creators and members</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="creator" className=" cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Creators
          </TabsTrigger>
          <TabsTrigger value="member" className="  cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="creator" className="mt-0">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-accent/30 p-4 border border-border/30">
            <div className="flex-1 w-full sm:w-auto">
              <SearchInput
                placeholder="Search creators by name, username, or email..."
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 bg-background px-3 py-2 border border-border/40 shadow-sm">
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Status:</span>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="dark:text-white w-36 h-9 border-primary/30 bg-background hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                   <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <UserTable 
            users={users} 
            isLoading={isLoading} 
            error={error}
            type="creator"
            onToggleStatus={handleToggleUserStatus}
          />
        </TabsContent>

        <TabsContent value="member" className="mt-0">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-accent/30 p-4 border border-border/30">
            <div className="flex-1 w-full sm:w-auto">
              <SearchInput
                placeholder="Search members by name, username, or email..."
                onSearch={handleSearch}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 bg-background px-3 py-2 border border-border/40 shadow-sm">
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground whitespace-nowrap">Status:</span>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className=" dark:text-white w-36 h-9 border-primary/30 bg-background hover:border-primary/50 transition-colors">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <UserTable 
            users={users} 
            isLoading={isLoading} 
            error={error}
            type="member"
            onToggleStatus={handleToggleUserStatus}
          />
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {!isLoading && users.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-border/30 pt-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} • Showing {users.length} {activeTab}s
            {searchQuery && (
              <span className="ml-2 text-primary">
                (search: "{searchQuery}")
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="ml-2 text-primary">
                (status: {statusFilter})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!hasNextPage}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  error: any;
  type: 'creator' | 'member';
  onToggleStatus: (userId: string, currentStatus: boolean) => Promise<void>;
}

function UserTable({ users, isLoading, error, type, onToggleStatus }: UserTableProps) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleConfirmToggle = async () => {
    if (!selectedUser) return;
    
    setLoadingUserId(selectedUser.id);
    await onToggleStatus(selectedUser.id, selectedUser.isActive);
    setLoadingUserId(null);
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };
  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
        <p className="text-destructive font-medium">Failed to load {type}s</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border/30 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/30">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Username</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow 
                key={i} 
                className="border-b border-border/20 last:border-0"
              >
                <TableCell>
                  <SkeletonBox height="16px" className="w-32" />
                </TableCell>
                <TableCell>
                  <SkeletonBox height="16px" className="w-24" />
                </TableCell>
                <TableCell>
                  <SkeletonBox height="16px" className="w-40" />
                </TableCell>
                <TableCell>
                  <SkeletonBox height="20px" className="w-16" />
                </TableCell>
                <TableCell>
                  <SkeletonBox height="20px" className="w-16" />
                </TableCell>
                <TableCell>
                  <SkeletonBox height="16px" className="w-24" />
                </TableCell>
                <TableCell>
                  <SkeletonBox height="32px" className="w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-card border border-border/30 rounded-lg p-12 text-center">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-foreground font-medium">No {type}s found</p>
        <p className="text-sm text-muted-foreground mt-1">There are no {type}s in the system yet</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/30 rounded-lg overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-border/30">
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Username</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Joined</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.id} 
              className="hover:bg-accent/50 transition-colors border-b border-border/20 last:border-0"
            >
              <TableCell className="font-medium text-foreground">
                {user.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {user.username}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {user.email}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {user.role}
                </span>
              </TableCell>
              <TableCell>
                {user.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                    Inactive
                  </span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </TableCell>
              <TableCell>
                <Button
                  variant={user.isActive ? "destructive" : "default"}
                  size="sm"
                  onClick={() => handleOpenDialog(user)}
                  disabled={loadingUserId === user.id}
                  className="min-w-20"
                >
                  {loadingUserId === user.id ? (
                    "..."
                  ) : user.isActive ? (
                    "Block"
                  ) : (
                    "Unblock"
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              {selectedUser?.isActive ? "Block User" : "Unblock User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.isActive ? (
                <>
                  Are you sure you want to block <span className="font-semibold text-foreground">{selectedUser.name}</span>? 
                  This will prevent them from accessing their account.
                </>
              ) : (
                <>
                  Are you sure you want to unblock <span className="font-semibold text-foreground">{selectedUser?.name}</span>? 
                  This will restore their access to the platform.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmToggle}
              className={selectedUser?.isActive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {selectedUser?.isActive ? "Block User" : "Unblock User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

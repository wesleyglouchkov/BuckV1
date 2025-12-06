"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Settings, ArrowLeftToLine, ArrowRightFromLine } from "lucide-react";
import { useSidebar } from "@/lib/sidebar-context";

const adminMenu = [
	{ icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
	{ icon: Users, label: "Users", href: "/admin/users" },
	{ icon: FileText, label: "Content", href: "/admin/content" },
	{ icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }: { 
	mobileOpen?: boolean; 
	setMobileOpen?: (open: boolean) => void; 
}) {
	const pathname = usePathname();
	const { collapsed, toggle } = useSidebar();
	const [internalMobileOpen, setInternalMobileOpen] = useState(false);

	// Use external state if provided, otherwise use internal state
	const isMobileOpen = mobileOpen ?? internalMobileOpen;
	const toggleMobile = setMobileOpen ? () => setMobileOpen(!isMobileOpen) : () => setInternalMobileOpen((v) => !v);

	return (
		<>

			{/* Desktop sidebar */}
			<aside
				className={`hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border/20 bg-card overflow-hidden shrink-0 transition-[width] duration-300 ease-out z-20 shadow-sm ${
					collapsed ? "w-16" : "w-64"
				}`}
			>
				<div className="flex items-center justify-between px-4 py-4 border-b border-border/20">
					<div className={`overflow-hidden ${collapsed ? "w-0" : "w-40"}`}>
						<p
							className={`text-xl font-bold text-foreground whitespace-nowrap transition-opacity duration-200 ${
								collapsed ? "opacity-0" : "opacity-100"
							}`}
						>
							Admin Panel
						</p>
					</div>
					<button
						aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
						onClick={toggle}
						className="ml-auto flex h-8 w-8 items-center justify-center hover:bg-accent transition-colors"
					>
						<ArrowLeftToLine className="h-5 w-5 text-muted-foreground" />
					</button>
				</div>

				<nav className="px-2 py-3">
					<ul className="space-y-1">
						{adminMenu.map(({ icon: Icon, label, href }) => {
							const isActive = pathname === href;
							return (
								<li key={href}>
									<Link
										href={href}
										className={`flex items-center gap-2 rounded-none px-2.5 py-2 transition-colors ${
											isActive
												? "bg-foreground text-background"
												: "text-muted-foreground hover:bg-accent hover:text-foreground"
										}`}
									>
										<Icon className="h-4 w-4" />
										{!collapsed && <p className="text-sm font-medium">{label}</p>}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>

				{collapsed && (
					<button
						aria-label="Open sidebar"
						onClick={toggle}
						className="absolute bottom-3 left-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-none hover:bg-accent transition-colors"
					>
						<ArrowRightFromLine className="h-5 w-5 text-muted-foreground" />
					</button>
				)}
			</aside>

			{/* Mobile drawer */}
			{isMobileOpen && (
				<div className="md:hidden fixed inset-0 z-50">
					<div className="absolute inset-0 bg-black/40" onClick={toggleMobile} />
					<div className="absolute left-0 top-0 h-full w-64 bg-card border-r border-border/20 shadow-sm">
						<div className="flex items-center justify-between px-4 py-4 border-b border-border/20">
							<p className="text-lg font-bold text-foreground">Admin Panel</p>
							<button onClick={toggleMobile} className="flex h-8 w-8 items-center justify-center hover:bg-accent">
								<ArrowLeftToLine className="h-5 w-5 text-muted-foreground" />
							</button>
						</div>
						<nav className="px-2 py-3">
							<ul className="space-y-1">
								{adminMenu.map(({ icon: Icon, label, href }) => {
									const isActive = pathname === href;
									return (
										<li key={href}>
											<Link
												href={href}
												onClick={toggleMobile}
												className={`flex items-center gap-2 rounded-none px-3 py-2 transition-colors ${
													isActive
														? "bg-foreground text-background"
														: "text-muted-foreground hover:bg-accent hover:text-foreground"
												}`}
											>
												<Icon className="h-4 w-4" />
												<p className="text-sm font-medium">{label}</p>
											</Link>
										</li>
									);
								})}
							</ul>
						</nav>
					</div>
				</div>
			)}
		</>
	);
}

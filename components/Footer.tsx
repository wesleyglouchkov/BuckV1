"use client";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { usePathname } from "next/navigation";


interface FooterProps {
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
    const pathname = usePathname();

    const handleScrollTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (pathname === '/explore') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <footer className={`w-full relative overflow-hidden glass dark:glass-dark border-t border-white/10 backdrop-blur-md ${className}`}>
            <div className="container mx-auto px-6 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link
                            href={'/explore'}
                            onClick={handleScrollTop}
                            className="flex items-center gap-3 group shrink-0 mb-4 cursor-pointer"
                        >
                            <div className="relative w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-110">
                                <Image
                                    src="/buck.svg"
                                    alt="Buck Logo"
                                    fill
                                    className="object-contain dark:hidden"
                                />
                                <Image
                                    src="/buck-dark.svg"
                                    alt="Buck Logo"
                                    fill
                                    className="object-contain hidden dark:block"
                                />
                            </div>
                            <span className="text-xl md:text-2xl font-bold tracking-tighter">Buck</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">Empowering creators worldwide. Go live, build community, and earn.</p>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-bold mb-4 dark:text-white">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link
                                    href={'/explore'}
                                    onClick={handleScrollTop}
                                    className="hover:text-primary transition-colors"
                                >
                                    Explore
                                </Link>
                            </li>
                            <li><a href="#features" className="hover:text-primary transition-colors">For Creators</a></li>
                            <li><a href="#reviews" className="hover:text-primary transition-colors">Reviews</a></li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-bold mb-4 dark:text-white">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href={'/help'} className="hover:text-primary transition-colors">Help</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-1">
                        <h4 className="font-bold mb-4 dark:text-white">Follow Us</h4>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 rounded-full bg-secondary/10 hover:bg-black hover:text-white transition-all">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    height="18"
                                    width="18"
                                    className="w-[18px] h-[18px]"
                                >
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-secondary/10 hover:bg-[#1877F2] hover:text-white transition-all">
                                <Facebook size={18} />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-secondary/10 hover:bg-linear-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white transition-all">
                                <Instagram size={18} />
                            </Link>
                            <Link href="#" className="p-2 rounded-full bg-secondary/10 hover:bg-[#0077b5] hover:text-white transition-all">
                                <Linkedin size={18} />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Buck. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href={'/privacy'} className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href={'/terms'} className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
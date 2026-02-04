import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    return (
        <div className="w-20 md:w-64 bg-[#f6f8fa] border-r border-[#d0d7de] h-screen fixed left-0 top-0 flex flex-col z-50 transition-all duration-300">
            <div className="p-4 flex items-center justify-center md:justify-start gap-3 border-b border-[#d0d7de]">
                <div className="w-8 h-8 bg-[#24292f] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">S</div>
                <span className="font-semibold text-[#24292f] hidden md:block">SkillSync</span>
            </div>

            <nav className="flex-1 p-2 space-y-1 mt-2">
                {[
                    { name: 'Home', href: '/dashboard/home', icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                    { name: 'Job Match', href: '/dashboard/job-match', icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                    { name: 'ATS Check', href: '/dashboard/ats-check', icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                    { name: 'Resume Coach', href: '/dashboard/resume-coach', icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" },
                    { name: 'Interview Prep', href: '/dashboard/interview-prep', icon: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" },
                    { name: 'Progress', href: '/dashboard/progress', icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
                ].map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-center md:justify-start gap-3 px-3 py-2 text-sm transition-colors relative group
                                ${isActive ? 'bg-[#f1f3f5] font-bold text-[#1a7f37]' : 'font-medium text-[#24292f] hover:bg-[#eaeef2]'}
                            `}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2ea44f] rounded-r" />}
                            <svg className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#1a7f37]' : 'text-[#57606a]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                            </svg>
                            <span className="hidden md:block truncate">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-[#d0d7de]">
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }}
                    className="flex items-center justify-center md:justify-start gap-3 px-3 py-2 text-sm font-medium text-[#cf222e] rounded-md hover:bg-[#ffebe9] w-full transition-colors"
                >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span className="hidden md:block truncate">Sign out</span>
                </button>
            </div>
        </div>
    );
}

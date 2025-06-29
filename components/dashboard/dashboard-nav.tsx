'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Users,
  Megaphone,
  BarChart3,
  MessageSquare,
  Settings,
  Store,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: Megaphone },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Chat Support', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r">
      <div className="flex items-center h-16 px-6 border-b">
        <div className="flex items-center space-x-2">
          <Store className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Admin CRM</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
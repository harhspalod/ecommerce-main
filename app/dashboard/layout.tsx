import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <DashboardNav />
        <div className="flex-1">
          <DashboardHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
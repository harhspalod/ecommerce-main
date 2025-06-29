import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const campaigns = [
  {
    name: 'Holiday Sale 2024',
    status: 'Active',
    progress: 85,
    customers: 1245,
    revenue: '$12,450',
    type: 'Discount',
  },
  {
    name: 'New Customer Welcome',
    status: 'Active',
    progress: 65,
    customers: 892,
    revenue: '$8,920',
    type: 'Welcome',
  },
  {
    name: 'VIP Customer Loyalty',
    status: 'Active',
    progress: 40,
    customers: 156,
    revenue: '$15,600',
    type: 'Loyalty',
  },
  {
    name: 'Flash Weekend Sale',
    status: 'Scheduled',
    progress: 0,
    customers: 0,
    revenue: '$0',
    type: 'Flash Sale',
  },
];

export function ActiveCampaigns() {
  return (
    <div className="space-y-6">
      {campaigns.map((campaign, index) => (
        <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">{campaign.name}</h3>
              <Badge variant={campaign.status === 'Active' ? 'default' : 'secondary'}>
                {campaign.status}
              </Badge>
              <Badge variant="outline">{campaign.type}</Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{campaign.customers} customers</span>
              <span>{campaign.revenue} revenue</span>
            </div>
          </div>
          <div className="w-24">
            <Progress value={campaign.progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{campaign.progress}%</p>
          </div>
        </div>
      ))}
    </div>
  );
}
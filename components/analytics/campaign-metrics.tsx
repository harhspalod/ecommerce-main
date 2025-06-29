import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Real campaign data from our system
const campaigns = [
  {
    name: 'iPhone 15 Pro Holiday Sale',
    type: 'Discount',
    productName: 'iPhone 15 Pro',
    roi: 285,
    revenue: '$12,450',
    cost: '$4,368',
    conversion: 85,
    reach: 245,
    discount: '15%',
    status: 'Active',
  },
  {
    name: 'Samsung Galaxy Welcome Offer',
    type: 'Welcome',
    productName: 'Samsung Galaxy S24',
    roi: 156,
    revenue: '$3,560',
    cost: '$2,282',
    conversion: 65,
    reach: 89,
    discount: '10%',
    status: 'Active',
  },
  {
    name: 'MacBook VIP Loyalty',
    type: 'Loyalty',
    productName: 'MacBook Air M3',
    roi: 420,
    revenue: '$8,920',
    cost: '$2,124',
    conversion: 40,
    reach: 56,
    discount: '20%',
    status: 'Active',
  },
  {
    name: 'Nike Flash Weekend Sale',
    type: 'Flash Sale',
    productName: 'Nike Air Max',
    roi: 0,
    revenue: '$0',
    cost: '$500',
    conversion: 0,
    reach: 0,
    discount: '25%',
    status: 'Scheduled',
  },
];

export function CampaignMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {campaigns.map((campaign, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{campaign.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={campaign.status === 'Active' ? 'default' : 'secondary'}>
                  {campaign.status}
                </Badge>
                <Badge variant="outline">{campaign.type}</Badge>
              </div>
            </div>
            <CardDescription>
              {campaign.productName} • {campaign.discount} discount campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className={`text-2xl font-bold ${campaign.roi > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {campaign.roi > 0 ? `${campaign.roi}%` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{campaign.conversion}%</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Revenue: {campaign.revenue}</span>
                <span>Cost: {campaign.cost}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Customers Reached: {campaign.reach}</span>
                <span>Product: {campaign.productName}</span>
              </div>
            </div>
            <Progress value={campaign.conversion} className="h-2" />
            
            {campaign.status === 'Active' && campaign.conversion > 0 && (
              <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-700">
                  ✅ Campaign performing well with {campaign.conversion}% progress
                </p>
              </div>
            )}
            
            {campaign.status === 'Scheduled' && (
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  📅 Campaign scheduled - ready to launch
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
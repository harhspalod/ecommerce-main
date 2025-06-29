'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Edit, Trash2, Search, Play, Pause, BarChart3 } from 'lucide-react';
import { Campaign } from './campaigns-page';
import { toast } from 'sonner';

interface CampaignsTableProps {
  campaigns: Campaign[];
  onUpdateCampaign: (id: number, campaign: Partial<Campaign>) => void;
  onDeleteCampaign: (id: number) => void;
}

export function CampaignsTable({ campaigns, onUpdateCampaign, onDeleteCampaign }: CampaignsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCampaigns = campaigns.filter(campaign => {
    return (
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'all' || campaign.status === statusFilter)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Scheduled':
        return 'secondary';
      case 'Paused':
        return 'outline';
      case 'Completed':
        return 'outline';
      default:
        return 'default';
    }
  };

  const handleDelete = (campaign: Campaign) => {
    if (window.confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
      onDeleteCampaign(campaign.id);
      toast.success(`${campaign.name} has been deleted successfully`);
    }
  };

  const handleToggleStatus = (campaign: Campaign) => {
    const newStatus = campaign.status === 'Paused' ? 'Active' : 'Paused';
    onUpdateCampaign(campaign.id, { status: newStatus });
    toast.success(`${campaign.name} has been ${newStatus.toLowerCase()}`);
  };

  const statuses = Array.from(new Set(campaigns.map(c => c.status)));

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search campaigns..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Triggered</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.map((campaign) => (
              <TableRow key={campaign.id} className="hover:bg-muted/50">
                <TableCell>
                  <div>
                    <div className="font-medium">{campaign.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">{campaign.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{campaign.condition}</TableCell>
                <TableCell>
                  <span className="font-medium text-green-600">{campaign.discount}</span>
                </TableCell>
                <TableCell>{campaign.triggered}</TableCell>
                <TableCell className="font-medium">{campaign.revenue}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="w-16">
                    <Progress value={campaign.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{campaign.progress}%</p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button variant="ghost" size="sm" title="View Analytics">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleStatus(campaign)}
                      title={campaign.status === 'Paused' ? 'Resume Campaign' : 'Pause Campaign'}
                    >
                      {campaign.status === 'Paused' ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <Pause className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" title="Edit Campaign">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(campaign)} title="Delete Campaign">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
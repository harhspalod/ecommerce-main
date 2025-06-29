'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Settings, Clock, Users, DollarSign, AlertTriangle } from 'lucide-react';

interface CallPrioritySettingsProps {
  onSettingsChange: (settings: CallPrioritySettings) => void;
  currentSettings?: CallPrioritySettings;
}

export interface CallPrioritySettings {
  priority: 'high' | 'medium' | 'low';
  callTimePreference: string;
  timezone: string;
  maxCallsPerDay: number;
  enableWeekendCalls: boolean;
  customerValueThreshold: number;
  urgencyLevel: number;
  autoSchedule: boolean;
}

const defaultSettings: CallPrioritySettings = {
  priority: 'medium',
  callTimePreference: '2:00 PM - 4:00 PM',
  timezone: 'EST',
  maxCallsPerDay: 50,
  enableWeekendCalls: false,
  customerValueThreshold: 500,
  urgencyLevel: 5,
  autoSchedule: true,
};

export function CallPrioritySettings({ onSettingsChange, currentSettings = defaultSettings }: CallPrioritySettingsProps) {
  const [settings, setSettings] = useState<CallPrioritySettings>(currentSettings);

  const handleSettingChange = (key: keyof CallPrioritySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const timeSlots = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '1:00 PM - 3:00 PM',
    '2:00 PM - 4:00 PM',
    '3:00 PM - 5:00 PM',
    '4:00 PM - 6:00 PM',
    '6:00 PM - 8:00 PM',
  ];

  const timezones = [
    'EST', 'CST', 'MST', 'PST',
    'GMT', 'CET', 'JST', 'AEST'
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Call Priority & Scheduling Settings</span>
        </CardTitle>
        <CardDescription>
          Configure call priority levels, timing preferences, and automation settings for optimal customer outreach.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Priority Level */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Call Priority Level</span>
          </Label>
          <Select 
            value={settings.priority} 
            onValueChange={(value: 'high' | 'medium' | 'low') => handleSettingChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-red-100 text-red-700 border-red-200">High Priority</Badge>
                  <span className="text-sm text-muted-foreground">• Immediate attention</span>
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Medium Priority</Badge>
                  <span className="text-sm text-muted-foreground">• Standard processing</span>
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-700 border-green-200">Low Priority</Badge>
                  <span className="text-sm text-muted-foreground">• When convenient</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className={`p-3 rounded-lg border ${getPriorityColor(settings.priority)}`}>
            <p className="text-sm font-medium">
              {settings.priority === 'high' && '🔴 High Priority: Calls will be processed immediately with top agent assignment'}
              {settings.priority === 'medium' && '🟡 Medium Priority: Calls will be processed within standard timeframes'}
              {settings.priority === 'low' && '🟢 Low Priority: Calls will be processed when agents are available'}
            </p>
          </div>
        </div>

        {/* Call Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Preferred Call Time</span>
            </Label>
            <Select 
              value={settings.callTimePreference} 
              onValueChange={(value) => handleSettingChange('callTimePreference', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Customer Timezone</Label>
            <Select 
              value={settings.timezone} 
              onValueChange={(value) => handleSettingChange('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Call Volume Controls */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Daily Call Limits</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Maximum calls per day</span>
              <span className="text-sm font-medium">{settings.maxCallsPerDay}</span>
            </div>
            <Slider
              value={[settings.maxCallsPerDay]}
              onValueChange={(value) => handleSettingChange('maxCallsPerDay', value[0])}
              max={200}
              min={10}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10 calls</span>
              <span>200 calls</span>
            </div>
          </div>
        </div>

        {/* Customer Value Threshold */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>High-Value Customer Threshold</span>
          </Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Minimum customer value for priority calls</span>
              <span className="text-sm font-medium">${settings.customerValueThreshold}</span>
            </div>
            <Slider
              value={[settings.customerValueThreshold]}
              onValueChange={(value) => handleSettingChange('customerValueThreshold', value[0])}
              max={2000}
              min={100}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$100</span>
              <span>$2000+</span>
            </div>
          </div>
        </div>

        {/* Urgency Level */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Campaign Urgency Level</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Urgency scale (1-10)</span>
              <Badge variant="outline">{settings.urgencyLevel}/10</Badge>
            </div>
            <Slider
              value={[settings.urgencyLevel]}
              onValueChange={(value) => handleSettingChange('urgencyLevel', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low urgency</span>
              <span>Critical urgency</span>
            </div>
          </div>
        </div>

        {/* Toggle Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Enable Weekend Calls</Label>
              <p className="text-xs text-muted-foreground">Allow calls on Saturday and Sunday</p>
            </div>
            <Switch
              checked={settings.enableWeekendCalls}
              onCheckedChange={(checked) => handleSettingChange('enableWeekendCalls', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Auto-Schedule Calls</Label>
              <p className="text-xs text-muted-foreground">Automatically schedule calls based on priority</p>
            </div>
            <Switch
              checked={settings.autoSchedule}
              onCheckedChange={(checked) => handleSettingChange('autoSchedule', checked)}
            />
          </div>
        </div>

        {/* Settings Summary */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-700 mb-2">Current Settings Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-600">
            <div>• Priority: <strong>{settings.priority.toUpperCase()}</strong></div>
            <div>• Call Time: <strong>{settings.callTimePreference}</strong></div>
            <div>• Timezone: <strong>{settings.timezone}</strong></div>
            <div>• Max Daily Calls: <strong>{settings.maxCallsPerDay}</strong></div>
            <div>• Weekend Calls: <strong>{settings.enableWeekendCalls ? 'Enabled' : 'Disabled'}</strong></div>
            <div>• Auto-Schedule: <strong>{settings.autoSchedule ? 'Enabled' : 'Disabled'}</strong></div>
            <div>• Value Threshold: <strong>${settings.customerValueThreshold}</strong></div>
            <div>• Urgency Level: <strong>{settings.urgencyLevel}/10</strong></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
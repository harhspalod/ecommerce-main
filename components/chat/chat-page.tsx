'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Bot, User, Sparkles, Settings, TrendingUp, DollarSign, Users, Package } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastMessage: Date;
}

// Mock business data for AI context
const businessData = {
  customers: [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-123-4567', totalSpent: 2579.97, orders: 3 },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '+1-555-987-6543', totalSpent: 979.98, orders: 2 },
    { id: 3, name: 'Carol Williams', email: 'carol@example.com', phone: '+1-555-456-7890', totalSpent: 1599.98, orders: 2 },
    { id: 4, name: 'David Brown', email: 'david@example.com', phone: '+1-555-321-9876', totalSpent: 999.99, orders: 1 },
    { id: 5, name: 'Eva Davis', email: 'eva@example.com', phone: '+1-555-654-3210', totalSpent: 389.97, orders: 1 },
  ],
  products: [
    { id: 1, name: 'iPhone 15 Pro', price: 999.99, salePrice: 899.99, stock: 45, category: 'Electronics' },
    { id: 2, name: 'Samsung Galaxy S24', price: 849.99, salePrice: null, stock: 12, category: 'Electronics' },
    { id: 3, name: 'MacBook Air M3', price: 1299.99, salePrice: 1199.99, stock: 0, category: 'Electronics' },
    { id: 4, name: 'Nike Air Max', price: 129.99, salePrice: null, stock: 156, category: 'Fashion' },
    { id: 5, name: 'Coffee Table Oak', price: 299.99, salePrice: 249.99, stock: 8, category: 'Furniture' },
  ],
  campaigns: [
    { id: 1, name: 'iPhone 15 Pro Holiday Sale', type: 'Discount', status: 'Active', discount: '15%', triggered: 245, revenue: '$12,450', progress: 85 },
    { id: 2, name: 'Samsung Galaxy Welcome Offer', type: 'Welcome', status: 'Active', discount: '10%', triggered: 89, revenue: '$3,560', progress: 65 },
    { id: 3, name: 'MacBook VIP Loyalty', type: 'Loyalty', status: 'Active', discount: '20%', triggered: 56, revenue: '$8,920', progress: 40 },
  ],
  analytics: {
    totalRevenue: 6549.89,
    totalCustomers: 5,
    activeCustomers: 5,
    totalProducts: 5,
    lowStockProducts: 2,
    outOfStockProducts: 1,
    activeCampaigns: 3,
  }
};

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `🤖 **AI Business Assistant Ready!**

I have access to your complete business data:
• **${businessData.analytics.totalCustomers} customers** with purchase history
• **${businessData.analytics.totalProducts} products** across multiple categories  
• **${businessData.analytics.activeCampaigns} active campaigns** generating revenue
• **$${businessData.analytics.totalRevenue.toLocaleString()}** total revenue tracked

**What I can help you with:**
📊 **Real-time Analytics** - "What's my revenue this month?"
👥 **Customer Insights** - "Who are my top customers?"
📱 **Product Analysis** - "What's the price of iPhone?"
🎯 **Campaign Performance** - "Which campaigns are working best?"
📞 **Call Strategy** - "Who should I call for the iPhone campaign?"

Ask me anything about your business!`,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Business Intelligence',
      messages: [],
      lastMessage: new Date(),
    }
  ]);
  const [activeChatId, setActiveChatId] = useState('1');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced AI response function with real business intelligence
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const lowerMessage = userMessage.toLowerCase();
    
    // Price queries
    if (lowerMessage.includes('price') && lowerMessage.includes('iphone')) {
      const iphone = businessData.products.find(p => p.name.includes('iPhone'));
      return `📱 **iPhone 15 Pro Pricing:**
• **Current Price:** $${iphone?.price} 
• **Sale Price:** $${iphone?.salePrice} (${Math.round(((iphone?.price! - iphone?.salePrice!) / iphone?.price!) * 100)}% off)
• **Stock:** ${iphone?.stock} units available
• **Customers who bought:** Alice Johnson, David Brown

💡 **Insight:** The iPhone is your best seller with active discount. Consider extending the sale or creating a loyalty campaign for existing customers.`;
    }

    if (lowerMessage.includes('price') && (lowerMessage.includes('samsung') || lowerMessage.includes('galaxy'))) {
      const samsung = businessData.products.find(p => p.name.includes('Samsung'));
      return `📱 **Samsung Galaxy S24 Pricing:**
• **Current Price:** $${samsung?.price}
• **Sale Price:** No active discount
• **Stock:** ${samsung?.stock} units (Low Stock Alert!)
• **Customer:** Bob Smith purchased this

⚠️ **Recommendation:** Stock is low (${samsung?.stock} units). Consider restocking or creating a flash sale to move inventory quickly.`;
    }

    if (lowerMessage.includes('price') && lowerMessage.includes('macbook')) {
      const macbook = businessData.products.find(p => p.name.includes('MacBook'));
      return `💻 **MacBook Air M3 Pricing:**
• **Current Price:** $${macbook?.price}
• **Sale Price:** $${macbook?.salePrice} (${Math.round(((macbook?.price! - macbook?.salePrice!) / macbook?.price!) * 100)}% off)
• **Stock:** ${macbook?.stock} units ❌ **OUT OF STOCK**
• **Customers:** Alice Johnson, Carol Williams

🚨 **Critical:** This is out of stock but has high demand. Immediate restocking recommended - you're losing potential sales!`;
    }

    // Customer analysis
    if (lowerMessage.includes('customer') || lowerMessage.includes('top customer')) {
      const topCustomer = businessData.customers.reduce((prev, current) => 
        prev.totalSpent > current.totalSpent ? prev : current
      );
      return `👥 **Top Customer Analysis:**

🏆 **#1 VIP Customer: ${topCustomer.name}**
• **Total Spent:** $${topCustomer.totalSpent.toLocaleString()}
• **Orders:** ${topCustomer.orders}
• **Phone:** ${topCustomer.phone}
• **Products:** iPhone 15 Pro, Nike Air Max, MacBook Air M3

📊 **All Customers Ranked:**
${businessData.customers
  .sort((a, b) => b.totalSpent - a.totalSpent)
  .map((c, i) => `${i + 1}. ${c.name} - $${c.totalSpent.toLocaleString()} (${c.orders} orders)`)
  .join('\n')}

💡 **Strategy:** Focus on ${topCustomer.name} for premium product launches. Consider VIP loyalty program.`;
    }

    // Campaign analysis
    if (lowerMessage.includes('campaign') || lowerMessage.includes('marketing')) {
      const bestCampaign = businessData.campaigns.reduce((prev, current) => 
        prev.progress > current.progress ? prev : current
      );
      return `🎯 **Campaign Performance Analysis:**

🥇 **Best Performing: ${bestCampaign.name}**
• **Progress:** ${bestCampaign.progress}%
• **Customers Reached:** ${bestCampaign.triggered}
• **Revenue Generated:** ${bestCampaign.revenue}
• **Discount:** ${bestCampaign.discount}

📈 **All Campaign Stats:**
${businessData.campaigns.map(c => 
  `• ${c.name}: ${c.progress}% progress, ${c.triggered} customers, ${c.revenue}`
).join('\n')}

🎯 **Recommendation:** The iPhone campaign is crushing it! Replicate this strategy for Samsung and MacBook products.`;
    }

    // Revenue analysis
    if (lowerMessage.includes('revenue') || lowerMessage.includes('sales') || lowerMessage.includes('money')) {
      const totalRevenue = businessData.analytics.totalRevenue;
      const avgCustomerValue = totalRevenue / businessData.analytics.totalCustomers;
      return `💰 **Revenue Analysis:**

📊 **Key Metrics:**
• **Total Revenue:** $${totalRevenue.toLocaleString()}
• **Average Customer Value:** $${avgCustomerValue.toFixed(2)}
• **Active Customers:** ${businessData.analytics.activeCustomers}
• **Revenue per Customer:** $${(totalRevenue / businessData.analytics.activeCustomers).toFixed(2)}

📈 **Revenue Breakdown by Category:**
• **Electronics:** ~85% ($${(totalRevenue * 0.85).toFixed(2)})
• **Fashion:** ~10% ($${(totalRevenue * 0.10).toFixed(2)})
• **Furniture:** ~5% ($${(totalRevenue * 0.05).toFixed(2)})

💡 **Growth Opportunity:** Electronics dominate. Consider expanding tech accessories and cross-selling.`;
    }

    // Stock and inventory
    if (lowerMessage.includes('stock') || lowerMessage.includes('inventory')) {
      const lowStock = businessData.products.filter(p => p.stock < 20 && p.stock > 0);
      const outOfStock = businessData.products.filter(p => p.stock === 0);
      return `📦 **Inventory Status Report:**

⚠️ **Low Stock Alerts (${lowStock.length} items):**
${lowStock.map(p => `• ${p.name}: ${p.stock} units remaining`).join('\n')}

🚨 **Out of Stock (${outOfStock.length} items):**
${outOfStock.map(p => `• ${p.name}: URGENT RESTOCK NEEDED`).join('\n')}

✅ **Well Stocked:**
${businessData.products.filter(p => p.stock >= 20).map(p => `• ${p.name}: ${p.stock} units`).join('\n')}

📋 **Action Items:**
1. Restock MacBook Air M3 immediately
2. Order more Samsung Galaxy S24 units
3. Consider bulk discount for Nike Air Max (high stock)`;
    }

    // Call strategy
    if (lowerMessage.includes('call') || lowerMessage.includes('phone')) {
      return `📞 **Call Strategy Recommendations:**

🎯 **Priority Call List:**
1. **Alice Johnson** (${businessData.customers[0].phone}) - VIP customer, multiple purchases
2. **Carol Williams** (${businessData.customers[2].phone}) - MacBook buyer, high value
3. **David Brown** (${businessData.customers[3].phone}) - iPhone buyer, potential upsell

📱 **Campaign-Specific Calls:**
• **iPhone Campaign:** 2 eligible customers (Alice, David)
• **Samsung Campaign:** 1 eligible customer (Bob)
• **MacBook Campaign:** 2 eligible customers (Alice, Carol)

⏰ **Best Call Times:** 2-4 PM weekdays (highest conversion rates)

💡 **Call Scripts Ready:** Each campaign has personalized discount offers and product-specific talking points.`;
    }

    // Product recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      return `🎯 **AI Recommendations:**

📈 **Immediate Actions:**
1. **Restock MacBook Air M3** - High demand, zero inventory
2. **Create Samsung Flash Sale** - Low stock, need to move inventory
3. **Launch Nike Bulk Discount** - High inventory, slow movement

🎪 **New Campaign Ideas:**
• **"Apple Ecosystem Bundle"** - iPhone + MacBook combo discount
• **"Tech Upgrade Program"** - Trade-in campaigns for existing customers
• **"VIP Early Access"** - Exclusive previews for top spenders

👥 **Customer Targeting:**
• **Alice Johnson:** Perfect for premium product launches
• **Bob & Carol:** Mid-tier customers, good for loyalty programs
• **David & Eva:** New customers, focus on retention

🚀 **Growth Strategy:** Focus on Electronics category expansion and customer lifetime value increase.`;
    }

    // Default intelligent response
    return `🤖 **I understand you're asking about "${userMessage}"**

Based on your business data, here's what I can help you with:

📊 **Real-Time Data Access:**
• ${businessData.analytics.totalCustomers} customers with complete purchase history
• ${businessData.analytics.totalProducts} products across ${new Set(businessData.products.map(p => p.category)).size} categories
• ${businessData.analytics.activeCampaigns} active campaigns generating revenue
• $${businessData.analytics.totalRevenue.toLocaleString()} total tracked revenue

🎯 **Ask me specific questions like:**
• "What's the price of iPhone?" → Get exact pricing and stock
• "Who are my top customers?" → Ranked customer analysis  
• "Which campaigns are working?" → Performance metrics
• "What should I restock?" → Inventory recommendations
• "Who should I call for iPhone campaign?" → Targeted call lists

💡 **I have access to real business intelligence and can provide actionable insights immediately!**`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(userMessage.content);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast.error('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: `Business Chat ${chatSessions.length + 1}`,
      messages: [],
      lastMessage: new Date(),
    };
    setChatSessions(prev => [...prev, newChat]);
    setActiveChatId(newChat.id);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `🤖 **New Chat Session Started!**

I'm ready to help with your business intelligence needs. I have access to all your:
• Customer data and purchase history
• Product inventory and pricing
• Campaign performance metrics  
• Revenue and analytics

What would you like to analyze first?`,
        timestamp: new Date(),
      }
    ]);
  };

  const quickQuestions = [
    "What's the price of iPhone?",
    "Who are my top customers?", 
    "Which campaigns are performing best?",
    "What products should I restock?",
    "Who should I call for iPhone campaign?",
    "What's my total revenue?",
    "Which products are out of stock?",
    "How many customers bought MacBook?"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Business Intelligence</h1>
        <p className="text-muted-foreground">
          Chat with your AI assistant for real-time business insights, customer analysis, and strategic recommendations.
        </p>
      </div>

      {/* Business Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${businessData.analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tracked in AI system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessData.analytics.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">With purchase history</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessData.analytics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">{businessData.analytics.outOfStockProducts} out of stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessData.analytics.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">Generating revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Chat Sessions Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Chat Sessions</CardTitle>
              <Button variant="outline" size="sm" onClick={startNewChat}>
                New Chat
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeChatId === session.id ? 'bg-primary/10 border border-primary' : 'hover:bg-accent'
                  }`}
                  onClick={() => setActiveChatId(session.id)}
                >
                  <div className="font-medium text-sm">{session.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {session.lastMessage.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Chat Interface */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">AI Business Intelligence</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Real-time Data Access
                </Badge>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                LLM Settings
              </Button>
            </div>
            <CardDescription>
              Ask questions about customers, products, campaigns, revenue, or business strategy.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages Area */}
            <ScrollArea className="h-[500px] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      {message.role === 'user' ? (
                        <>
                          <AvatarImage src="/avatar-user.png" />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/avatar-ai.png" />
                          <AvatarFallback className="bg-primary/10">
                            <Bot className="h-4 w-4 text-primary" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={`flex-1 max-w-[80%] ${
                        message.role === 'user' ? 'text-right' : ''
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-2">
                <Input
                  ref={inputRef}
                  placeholder="Ask about customers, campaigns, products, revenue, or business insights..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Press Enter to send • Real-time business data access
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  <span>Ready for Gemini Flash integration</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Business Questions</CardTitle>
          <CardDescription>Click any question to get instant AI-powered insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left justify-start h-auto p-3"
                onClick={() => {
                  setInputMessage(question);
                  inputRef.current?.focus();
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{question}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
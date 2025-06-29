import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Real product data from our system
const products = [
  { 
    name: 'iPhone 15 Pro', 
    sales: 2, 
    revenue: 1899.98, 
    growth: 12, 
    stock: 45, 
    price: 999.99, 
    salePrice: 899.99,
    category: 'Electronics',
    customers: ['Alice Johnson', 'David Brown']
  },
  { 
    name: 'Samsung Galaxy S24', 
    sales: 1, 
    revenue: 849.99, 
    growth: 8, 
    stock: 12, 
    price: 849.99, 
    salePrice: null,
    category: 'Electronics',
    customers: ['Bob Smith']
  },
  { 
    name: 'MacBook Air M3', 
    sales: 2, 
    revenue: 2599.98, 
    growth: 15, 
    stock: 0, 
    price: 1299.99, 
    salePrice: 1199.99,
    category: 'Electronics',
    customers: ['Alice Johnson', 'Carol Williams']
  },
  { 
    name: 'Nike Air Max', 
    sales: 4, 
    revenue: 519.96, 
    growth: -2, 
    stock: 156, 
    price: 129.99, 
    salePrice: null,
    category: 'Fashion',
    customers: ['Alice Johnson', 'Bob Smith', 'Eva Davis']
  },
  { 
    name: 'Coffee Table Oak', 
    sales: 1, 
    revenue: 299.99, 
    growth: 25, 
    stock: 8, 
    price: 299.99, 
    salePrice: 249.99,
    category: 'Furniture',
    customers: ['Carol Williams']
  },
];

interface ProductPerformanceProps {
  detailed?: boolean;
}

export function ProductPerformance({ detailed = false }: ProductPerformanceProps) {
  const maxSales = Math.max(...products.map(p => p.sales));
  
  return (
    <div className="space-y-6">
      {products.map((product, index) => (
        <div key={index} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{product.name}</span>
              <Badge variant="outline" className="text-xs">{product.category}</Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {product.sales} sold
            </span>
          </div>
          
          {detailed && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Revenue:</span>
                <span className="ml-2 font-medium">${product.revenue.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Stock:</span>
                <span className={`ml-2 font-medium ${
                  product.stock === 0 ? 'text-red-600' : 
                  product.stock < 20 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {product.stock} units
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>
                <span className="ml-2 font-medium">
                  ${product.price}
                  {product.salePrice && (
                    <span className="text-green-600 ml-1">
                      (Sale: ${product.salePrice})
                    </span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Growth:</span>
                <span className={`ml-2 font-medium ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.growth >= 0 ? '+' : ''}{product.growth}%
                </span>
              </div>
            </div>
          )}
          
          {detailed && (
            <div className="text-sm">
              <span className="text-muted-foreground">Customers:</span>
              <span className="ml-2">{product.customers.join(', ')}</span>
            </div>
          )}
          
          <div className="space-y-1">
            <Progress value={(product.sales / maxSales) * 100} className="h-2" />
            {detailed && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Sales Performance</span>
                <span>{Math.round((product.sales / maxSales) * 100)}% of top seller</span>
              </div>
            )}
          </div>
          
          {detailed && product.stock === 0 && (
            <div className="p-2 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-700">
                ⚠️ Out of stock - High demand product needs immediate restocking
              </p>
            </div>
          )}
          
          {detailed && product.stock < 20 && product.stock > 0 && (
            <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-xs text-orange-700">
                📦 Low stock alert - Consider restocking soon
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, 
  Users, Calendar, RefreshCw, Download, FileText
} from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import './SalesAnalytics.css';

const COLORS = ['#A67C52', '#2C2C2C', '#5F6368', '#EBEBEB', '#D4AF37'];

export default function SalesAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const result = await adminApi.getSalesAnalytics();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return <div className="admin-loading">Crunching sales data...</div>;
  }

  return (
    <div className="admin-page-container sales-analytics">
      {/* Header Actions */}
      <div className="admin-actions-bar">
        <div className="admin-actions-left">
          <div className="analytics-period">
            <Calendar size={18} />
            <span>Last 30 Days</span>
          </div>
        </div>
        <div className="admin-actions-right">
          <button className="btn btn-secondary btn-icon" onClick={handleRefresh} title="Refresh Data">
            <RefreshCw size={18} className={isRefreshing ? 'spinning' : ''} />
          </button>
          <button className="admin-btn admin-btn-secondary">
            <Download size={18} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Revenue Trend Chart */}
        <div className="analytics-card full-width">
          <div className="card-header">
            <h3><TrendingUp size={20} /> Revenue Trend</h3>
            <p>Daily revenue for the last 30 days</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.revenue_trend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A67C52" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#A67C52" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#888' }}
                  tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#888' }}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#A67C52" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="analytics-card">
          <div className="card-header">
            <h3><ShoppingBag size={20} /> Category Performance</h3>
            <p>Sales volume by category</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.category_sales}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="category"
                >
                  {data.category_sales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                   formatter={(val) => [`$${val.toLocaleString()}`, 'Total Sales']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="analytics-card">
          <div className="card-header">
            <h3><FileText size={20} /> Top Performing Products</h3>
            <p>Highest grossing items</p>
          </div>
          <div className="top-products-list">
            {data.top_products.map((product, index) => (
              <div key={index} className="top-product-item">
                <div className="product-rank">{index + 1}</div>
                <div className="product-info">
                  <span className="name">{product.name}</span>
                  <div className="progress-bar-wrap">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${(product.value / data.top_products[0].value) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    ></div>
                  </div>
                </div>
                <div className="product-value">
                  ${product.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

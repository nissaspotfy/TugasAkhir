import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { TrendingUp, ShoppingBag, Users, Clock, AlertTriangle, Award, RefreshCw } from 'lucide-react';

export function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/transactions/analytics');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      const msg = err.response?.data?.message || err.message || 'Gagal memuat data analitik.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="font-semibold text-sm">Memproses data analitik...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-border/50 p-8 shadow-sm">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">Terjadi Kesalahan</h3>
        <p className="text-muted-foreground text-sm mb-6">{error || 'Data tidak dapat dimuat'}</p>
        <button 
          onClick={fetchAnalytics}
          className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const { summary, topProducts, lowStockProducts, salesTrend } = data;

  // Render SVG Chart
  const renderSalesChart = () => {
    if (!salesTrend || salesTrend.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
          Belum ada data tren penjualan.
        </div>
      );
    }

    const maxVal = Math.max(...salesTrend.map(d => d.revenue), 10000);
    const height = 240;
    const width = 600;
    const paddingLeft = 70;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const points = salesTrend.map((d, index) => {
      const x = paddingLeft + (index / (salesTrend.length - 1 || 1)) * chartWidth;
      const y = paddingTop + chartHeight - (d.revenue / maxVal) * chartHeight;
      return { x, y, ...d };
    });

    let pathD = "";
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    }

    let areaD = "";
    if (points.length > 0) {
      areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
    }

    const gridLines = [0, 0.25, 0.5, 0.75, 1];

    return (
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="min-w-[500px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
            <defs>
              <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#bf3843" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#bf3843" stopOpacity="0.0"/>
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {gridLines.map((ratio, idx) => {
              const y = paddingTop + chartHeight * (1 - ratio);
              const val = Math.round(maxVal * ratio);
              return (
                <g key={idx}>
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    stroke="#f1f5f9" 
                    strokeWidth="1.5"
                    strokeDasharray={idx === 0 ? "0" : "4 4"}
                  />
                  <text 
                    x={paddingLeft - 10} 
                    y={y + 3} 
                    textAnchor="end" 
                    className="text-[9px] fill-muted-foreground font-mono font-bold"
                  >
                    Rp{val >= 1000000 ? `${(val / 1000000).toFixed(1)}jt` : (val >= 1000 ? `${(val / 1000).toFixed(0)}rb` : val)}
                  </text>
                </g>
              );
            })}

            {/* Fill Area */}
            {areaD && (
              <path d={areaD} fill="url(#chartAreaGradient)" />
            )}

            {/* Trend Line */}
            {pathD && (
              <path 
                d={pathD} 
                fill="none" 
                stroke="#bf3843" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            )}

            {/* Dots */}
            {points.length <= 15 && points.map((p, idx) => (
              <g key={idx} className="group/dot cursor-pointer">
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="4.5" 
                  fill="#bf3843" 
                  stroke="white" 
                  strokeWidth="2"
                  className="transition-all duration-200 group-hover/dot:r-6 group-hover/dot:fill-[#941c26]"
                />
                <title>{`${new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}: Rp ${p.revenue.toLocaleString('id-ID')}`}</title>
              </g>
            ))}

            {/* X Labels */}
            {salesTrend.map((d, index) => {
              const showLabel = index === 0 || index === Math.floor(salesTrend.length / 2) || index === salesTrend.length - 1;
              if (!showLabel) return null;

              const x = paddingLeft + (index / (salesTrend.length - 1 || 1)) * chartWidth;
              const dateFormatted = new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

              return (
                <text 
                  key={index}
                  x={x} 
                  y={height - 12} 
                  textAnchor="middle" 
                  className="text-[9.5px] fill-muted-foreground font-bold"
                >
                  {dateFormatted}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Pendapatan</p>
            <h3 className="text-xl font-bold text-slate-800 truncate">Rp {summary.totalRevenue.toLocaleString('id-ID')}</h3>
          </div>
        </div>

        {/* New Customers */}
        <div className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Pelanggan Baru</p>
            <h3 className="text-2xl font-bold text-slate-800 flex items-baseline gap-1.5">
              {summary.newCustomers}
              <span className="text-[10px] text-purple-600 font-semibold lowercase bg-purple-50 px-1.5 py-0.5 rounded-md">Bulan ini</span>
            </h3>
          </div>
        </div>
      </div>

      {/* 2. Sales Trend Section */}
      <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-heading font-black text-slate-800">Tren Penjualan</h3>
            <p className="text-xs text-muted-foreground">Grafik total nominal penjualan harian dalam 30 hari terakhir</p>
          </div>
        </div>
        {renderSalesChart()}
      </div>

      {/* 3. Product & Inventory Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Best Sellers */}
        <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-yellow-500 w-5 h-5" />
            <h3 className="text-lg font-heading font-black text-slate-800">Top 5 Menu Terlaris</h3>
          </div>
          
          {topProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-12 text-muted-foreground text-sm">
              Belum ada riwayat penjualan produk.
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {topProducts.map((p, index) => (
                <div key={p.id} className="flex items-center gap-4 pb-4 border-b border-border/40 last:pb-0 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-800">{p.name}</p>
                    <p className="text-xs text-muted-foreground">@ Rp {p.price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold bg-primary/5 text-primary border border-primary/10 px-2.5 py-1 rounded-full">
                      Terjual {p.total_sold} porsi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="text-red-500 w-5 h-5" />
            <h3 className="text-lg font-heading font-black text-slate-800">Peringatan Stok Menipis</h3>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-3">
                ✓
              </div>
              <p className="font-bold text-green-700 text-sm mb-1">Semua Stok Aman</p>
              <p className="text-xs text-muted-foreground">Seluruh porsi menu memiliki stok di atas batas minimum</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between pb-4 border-b border-border/40 last:pb-0 last:border-0">
                  <div>
                    <p className="font-bold text-sm text-slate-800">{p.name}</p>
                    <p className="text-xs text-muted-foreground">Harga: Rp {p.price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      p.stock === 0 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {p.stock === 0 ? 'Habis (0)' : `Sisa ${p.stock} porsi`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

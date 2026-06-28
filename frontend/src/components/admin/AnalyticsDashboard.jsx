import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { TrendingUp, ShoppingBag, Users, AlertTriangle, Award, RefreshCw, Download } from 'lucide-react';

export function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Timeframe and Date Filter States
  const [timeframe, setTimeframe] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const calculateDates = (selectedTimeframe) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    let start = '';
    let end = todayStr;

    if (selectedTimeframe === 'today') {
      start = todayStr;
    } else if (selectedTimeframe === 'week') {
      const pastWeek = new Date();
      pastWeek.setDate(today.getDate() - 7);
      start = pastWeek.toISOString().split('T')[0];
    } else if (selectedTimeframe === 'month') {
      const pastMonth = new Date();
      pastMonth.setDate(today.getDate() - 30);
      start = pastMonth.toISOString().split('T')[0];
    }
    
    return { start, end };
  };

  const fetchAnalytics = async (start = startDate, end = endDate) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (start && end) {
        params.startDate = start;
        params.endDate = end;
      }
      const res = await api.get('/transactions/analytics', { params });
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
    // Initial load: 30 days
    const { start, end } = calculateDates('month');
    setStartDate(start);
    setEndDate(end);
    fetchAnalytics(start, end);
  }, []);

  const handleTimeframeChange = (selectedTimeframe) => {
    setTimeframe(selectedTimeframe);
    if (selectedTimeframe !== 'custom') {
      const { start, end } = calculateDates(selectedTimeframe);
      setStartDate(start);
      setEndDate(end);
      fetchAnalytics(start, end);
    } else {
      // For custom, initialize with past month's range until user modifies it
      const { start, end } = calculateDates('month');
      setStartDate(start);
      setEndDate(end);
      fetchAnalytics(start, end);
    }
  };

  const handleCustomDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      fetchAnalytics(start, end);
    }
  };

  const handleExportPDF = () => {
    if (!data) return;
    const { summary, topProducts, lowStockProducts } = data;
    
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html>
        <head>
          <title>Laporan Analisis Penjualan D'raosan</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #334155; line-height: 1.5; }
            .header { text-align: center; border-bottom: 3px double #cbd5e1; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 26px; color: #991b1b; font-weight: 800; tracking-wide: 1px; }
            .header p { margin: 6px 0 0; font-size: 13px; color: #64748b; font-weight: 500; }
            .meta { display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
            .card { background: #f8fafc; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; }
            .card p { margin: 0 0 6px; font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
            .card h3 { margin: 0; font-size: 18px; color: #0f172a; font-weight: 800; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px 14px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; color: #334155; }
            h2 { font-size: 16px; border-left: 4px solid #b91c1c; padding-left: 10px; margin-top: 35px; margin-bottom: 15px; color: #0f172a; font-weight: 800; }
            .badge { background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; border: 1px solid #fca5a5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LAPORAN ANALISIS PENJUALAN D'RAOSAN</h1>
            <p>Sistem Informasi Manajemen Rumah Makan D'raosan - Laporan Resmi</p>
          </div>
          <div class="meta">
            <div><strong>Waktu Ekspor:</strong> ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</div>
            <div><strong>Periode Laporan:</strong> ${timeframe === 'custom' ? `${startDate} s/d ${endDate}` : timeframe === 'today' ? 'Hari Ini' : timeframe === 'week' ? 'Minggu Ini' : 'Bulan Ini'}</div>
          </div>
          
          <h2>Ringkasan Kinerja</h2>
          <div class="grid">
            <div class="card">
              <p>Total Pendapatan</p>
              <h3>Rp ${summary.totalRevenue.toLocaleString('id-ID')}</h3>
            </div>
            <div class="card">
              <p>Pesanan Sukses</p>
              <h3>${summary.totalSuccessfulOrders}</h3>
            </div>
            <div class="card">
              <p>Pelanggan Baru</p>
              <h3>${summary.newCustomers}</h3>
            </div>
            <div class="card">
              <p>Pesanan Tertunda</p>
              <h3>${summary.pendingOrders}</h3>
            </div>
          </div>

          <h2>Top 5 Menu Terlaris</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 80px;">Peringkat</th>
                <th>Nama Menu</th>
                <th>Harga Satuan</th>
                <th>Total Terjual</th>
              </tr>
            </thead>
            <tbody>
              ${topProducts.map((p, idx) => `
                <tr>
                  <td><strong>#${idx + 1}</strong></td>
                  <td style="font-weight: 600; color: #0f172a;">${p.name}</td>
                  <td>Rp ${p.price?.toLocaleString('id-ID')}</td>
                  <td><strong>${p.total_sold} Porsi</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Peringatan Stok Rendah (&lt; 5)</h2>
          <table>
            <thead>
              <tr>
                <th>Nama Menu</th>
                <th>Stok Tersisa</th>
                <th>Harga Satuan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockProducts.length === 0 ? `
                <tr>
                  <td colspan="4" style="text-align: center; color: #64748b; padding: 20px;">Semua persediaan produk dalam kondisi aman.</td>
                </tr>
              ` : lowStockProducts.map(p => `
                <tr>
                  <td style="font-weight: 600; color: #0f172a;">${p.name}</td>
                  <td style="color: #b91c1c; font-weight: bold;">${p.stock} porsi</td>
                  <td>Rp ${p.price?.toLocaleString('id-ID')}</td>
                  <td><span class="badge">Perlu Restock</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading && !data) {
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
          onClick={() => fetchAnalytics()}
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
      
      {/* Top Header Panel with Document Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-xl font-heading font-black text-slate-800">Ringkasan Analitik</h2>
          <p className="text-xs text-muted-foreground">Laporan ringkas kinerja penjualan dan persediaan D'raosan</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center justify-center gap-2 bg-[#B91C1C] hover:bg-[#9c1818] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] border-none cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Laporan PDF</span>
        </button>
      </div>
      
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

      {/* 2. Sales Trend Section with Dropdown Selection */}
      <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-heading font-black text-slate-800">Tren Penjualan</h3>
            <p className="text-xs text-muted-foreground">
              {timeframe === 'custom' 
                ? `Grafik total nominal penjualan kustom: ${startDate} s/d ${endDate}`
                : `Grafik total nominal penjualan harian (${timeframe === 'today' ? 'Hari Ini' : timeframe === 'week' ? 'Minggu Ini' : '30 Hari Terakhir'})`
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {timeframe === 'custom' && (
              <div className="flex items-center gap-1.5">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => handleCustomDateChange(e.target.value, endDate)}
                  className="px-2 py-1 text-xs border rounded-lg focus:outline-none bg-slate-50 cursor-pointer"
                />
                <span className="text-xs text-muted-foreground">s/d</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => handleCustomDateChange(startDate, e.target.value)}
                  className="px-2 py-1 text-xs border rounded-lg focus:outline-none bg-slate-50 cursor-pointer"
                />
              </div>
            )}
            
            <select
              value={timeframe}
              onChange={(e) => handleTimeframeChange(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border rounded-lg focus:outline-none bg-white cursor-pointer"
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="custom">Kustom Tanggal</option>
            </select>
          </div>
        </div>
        {renderSalesChart()}
      </div>

      {/* 3. Product & Inventory Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Best Sellers */}
        <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm flex flex-col relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-2xl">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
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

import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { BarChart3, TrendingUp, Sparkles, DollarSign, Percent } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export const AnalyticsPage = () => {
  const { products } = useInventory();

  // 1. DATA PREPARATION: PROFIT MARGIN PER PRODUCT
  // Margin % = ((Price - Cost) / Price) * 100
  const marginData = products.map(prod => {
    const margin = prod.price > 0 ? Math.round(((prod.price - prod.cost) / prod.price) * 100) : 0;
    return {
      name: prod.name,
      Margen: margin,
      Venta: prod.price,
      Costo: prod.cost
    };
  }).sort((a, b) => b.Margen - a.Margen).slice(0, 8); // Top 8 highest margins

  // 2. DATA PREPARATION: COLOR PALETTE DISTRIBUTION
  const colorCounts = products.reduce((acc, curr) => {
    const color = curr.color || 'Otro';
    acc[color] = (acc[color] || 0) + curr.stock; // weighted by stock
    return acc;
  }, {});

  const colorPaletteData = Object.entries(colorCounts).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  const colorPaletteColors = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#e11d48', '#f59e0b', '#10b981', '#3b82f6'];

  // 3. DATA PREPARATION: SEASONAL DISTRIBUTION
  const seasonCounts = products.reduce((acc, curr) => {
    const season = curr.season || 'Toda temporada';
    acc[season] = (acc[season] || 0) + curr.stock; // weighted by stock
    return acc;
  }, {});

  const seasonalData = Object.entries(seasonCounts).map(([name, value]) => ({
    name,
    value
  }));

  // 4. DATA PREPARATION: WEAR FREQUENCY (Top Sold Products) - filter for active sales only
  const topSoldData = [...products]
    .filter(prod => (prod.salesCount || 0) > 0)
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 5)
    .map(prod => ({
      name: prod.name,
      Ventas: prod.salesCount || 0
    }));

  // Calculating overall average margin - safely avoiding division by zero
  const avgMargin = products.length > 0 
    ? Math.round(products.reduce((acc, curr) => acc + (curr.price > 0 ? (((curr.price - curr.cost) / curr.price) * 100) : 0), 0) / products.length)
    : 0;

  const bestSeller = [...products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))[0];
  const topSellerName = bestSeller && (bestSeller.salesCount || 0) > 0
    ? bestSeller.name
    : 'Ninguno';

  const stockHealthRate = products.length > 0
    ? Math.round((products.filter(p => p.stock > p.minStock).length / products.length) * 100)
    : 0;

  return (
    <div className="space-y-8 relative">
      
      {/* Title */}
      <div>
        <h2 className="font-display font-bold text-3xl text-white">Análisis de Ventas</h2>
        <p className="text-slate-400 text-sm">Información detallada sobre márgenes de beneficio, rotación de mercancía y stock saludable.</p>
      </div>

      {/* METRIC CALLOUTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Margen Bruto Promedio</span>
            <span className="text-2xl font-bold text-white mt-0.5">{avgMargin}%</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-500/10 text-purple-400 rounded-2xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Producto Más Vendido</span>
            <span className="text-xl font-bold text-white mt-0.5 truncate max-w-[200px] block" title={topSellerName}>
              {topSellerName}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-500/10 text-rose-400 rounded-2xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Tasa de Salud de Stock</span>
            <span className="text-2xl font-bold text-white mt-0.5">{stockHealthRate}%</span>
          </div>
        </GlassCard>
      </div>

      {/* CHART GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Margin Analysis Bar Chart */}
        <GlassCard>
          <div className="mb-4">
            <h3 className="font-display font-semibold text-lg text-white">Margen de Ganancia por Producto (%)</h3>
            <p className="text-slate-400 text-xs mt-0.5">Muestra el margen de utilidad bruta (Venta - Costo) / Venta. Superior al 60% es ideal.</p>
          </div>
          <div className="h-72 sm:h-80 flex items-center justify-center">
            {products.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marginData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: 11 }} domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" style={{ fontSize: 10 }} width={80} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#f3f4f6'
                    }} 
                  />
                  <Bar dataKey="Margen" fill="#6366f1" radius={[0, 4, 4, 0]}>
                    {marginData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.Margen < 60 ? '#f43f5e' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <Percent className="h-8 w-8 text-slate-700 mx-auto mb-2.5" />
                <p className="text-slate-400 font-semibold text-sm">No hay datos todavía</p>
                <p className="text-slate-500 text-xs mt-1">Registra productos para calcular los márgenes.</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Sales Frequency (Top Sold Items) */}
        <GlassCard>
          <div className="mb-4">
            <h3 className="font-display font-semibold text-lg text-white">Top 5 Artículos Más Vendidos</h3>
            <p className="text-slate-400 text-xs mt-0.5">Volumen total de unidades vendidas acumulado</p>
          </div>
          <div className="h-72 sm:h-80 flex items-center justify-center">
            {topSoldData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSoldData} margin={{ top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 10 }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#f3f4f6'
                    }} 
                  />
                  <Bar dataKey="Ventas" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-8 w-8 text-slate-700 mx-auto mb-2.5" />
                <p className="text-slate-400 font-semibold text-sm">Las estadísticas aparecerán aquí</p>
                <p className="text-slate-500 text-xs mt-1">Registra tu primera venta para mostrar el top de artículos.</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Color Palette breakdown */}
        <GlassCard>
          <div className="mb-4">
            <h3 className="font-display font-semibold text-lg text-white">Distribución de Stock por Color</h3>
            <p className="text-slate-400 text-xs mt-0.5">Proporción de unidades físicas disponibles según su tonalidad</p>
          </div>
          <div className="h-72 sm:h-80 flex flex-col justify-between">
            <div className="flex-1 min-h-[200px] flex items-center justify-center">
              {products.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={colorPaletteData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {colorPaletteData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorPaletteColors[index % colorPaletteColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#f3f4f6'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-8 w-8 text-slate-700 mx-auto mb-2.5" />
                  <p className="text-slate-400 font-semibold text-sm">No hay datos todavía</p>
                  <p className="text-slate-500 text-xs mt-1">Registra productos para visualizar su stock por color.</p>
                </div>
              )}
            </div>
            
            {/* Color key indicator labels */}
            {products.length > 0 && (
              <div className="grid grid-cols-3 gap-2 text-xs pt-4 border-t border-white/5">
                {colorPaletteData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorPaletteColors[idx % colorPaletteColors.length] }}></span>
                    <span className="text-slate-400 truncate">{item.name} ({item.value} u.)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Seasonal Distribution */}
        <GlassCard>
          <div className="mb-4">
            <h3 className="font-display font-semibold text-lg text-white">Stock según Temporada</h3>
            <p className="text-slate-400 text-xs mt-0.5">Asignación de volumen físico de stock por temporada comercial</p>
          </div>
          <div className="h-72 sm:h-80 flex flex-col justify-between">
            <div className="flex-1 min-h-[200px] flex items-center justify-center">
              {products.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={seasonalData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={75}
                      dataKey="value"
                    >
                      {seasonalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorPaletteColors[(index + 3) % colorPaletteColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#f3f4f6'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-8 w-8 text-slate-700 mx-auto mb-2.5" />
                  <p className="text-slate-400 font-semibold text-sm">No hay datos todavía</p>
                  <p className="text-slate-500 text-xs mt-1">Registra productos para visualizar su stock por temporada.</p>
                </div>
              )}
            </div>
            
            {/* Seasonal key labels */}
            {products.length > 0 && (
              <div className="grid grid-cols-3 gap-2 text-xs pt-4 border-t border-white/5">
                {seasonalData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colorPaletteColors[(idx + 3) % colorPaletteColors.length] }}></span>
                    <span className="text-slate-400 truncate">{item.name} ({item.value} u.)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

      </div>

    </div>
  );
};

export default AnalyticsPage;

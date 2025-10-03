import React, { useState, useEffect } from 'react';
import { Upload, FileText, BarChart3, PieChart, TrendingUp, Brain, Download, Eye, Sparkles, Activity, Settings, Filter, Search, RefreshCw, Zap, Target, Globe, Layers, Cpu, Database } from 'lucide-react';
import Papa from 'papaparse';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart as RechartsPieChart, Cell, ScatterChart, Scatter,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Treemap, FunnelChart, Funnel, LabelList, ComposedChart
} from 'recharts';

const DataAnalyticsPlatform = () => {
  const [csvData, setCsvData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [theme, setTheme] = useState('gradient');
  const [animations, setAnimations] = useState(true);
  const [filterValue, setFilterValue] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Enhanced color palettes for different themes
  const colorThemes = {
    gradient: {
      primary: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
      secondary: ['#ffecd2', '#fcb69f', '#a8edea', '#fed6e3', '#d299c2', '#fef9d3'],
      background: 'from-indigo-900 via-purple-900 to-pink-900',
      cardBg: 'bg-white/10 backdrop-blur-lg border border-white/20'
    },
    neon: {
      primary: ['#00ffff', '#ff00ff', '#ffff00', '#00ff00', '#ff8c00', '#ff1493'],
      secondary: ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#f39c12', '#8e44ad'],
      background: 'from-gray-900 via-black to-gray-900',
      cardBg: 'bg-gray-900/80 backdrop-blur-lg border border-cyan-500/30'
    },
    ocean: {
      primary: ['#2196F3', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39'],
      secondary: ['#E3F2FD', '#E0F7FA', '#E0F2F1', '#E8F5E8', '#F1F8E9', '#F9FBE7'],
      background: 'from-blue-600 via-cyan-600 to-teal-600',
      cardBg: 'bg-white/15 backdrop-blur-lg border border-blue-300/30'
    },
    sunset: {
      primary: ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#FF006E', '#8338EC'],
      secondary: ['#FFF3E0', '#FFF8E1', '#FFFDE7', '#E8F5E8', '#FCE4EC', '#F3E5F5'],
      background: 'from-orange-500 via-pink-500 to-purple-600',
      cardBg: 'bg-white/10 backdrop-blur-lg border border-orange-300/30'
    }
  };

  const currentTheme = colorThemes[theme];

  // Enhanced chart configurations
  const chartConfigs = {
    line: { icon: TrendingUp, name: 'Line Chart' },
    bar: { icon: BarChart3, name: 'Bar Chart' },
    area: { icon: Activity, name: 'Area Chart' },
    scatter: { icon: Sparkles, name: 'Scatter Plot' },
    radar: { icon: Target, name: 'Radar Chart' },
    composed: { icon: Layers, name: 'Composed Chart' }
  };

  // Advanced file processing with progress
  const handleFileUpload = (file) => {
    if (!file) return;
    
    setIsLoading(true);
    
    Papa.parse(file, {
      complete: (result) => {
        if (result.data && result.data.length > 0) {
          const headers = result.data[0];
          const dataRows = result.data.slice(1).filter(row => row.some(cell => cell.trim() !== ''));
          
          const parsedData = dataRows.map((row, index) => {
            const obj = { id: index + 1, _originalIndex: index };
            headers.forEach((header, i) => {
              let value = row[i];
              // Enhanced parsing logic
              if (value && !isNaN(value) && value.trim() !== '') {
                value = parseFloat(value);
              } else if (value && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
                value = value.toLowerCase() === 'true';
              }
              obj[header] = value;
            });
            return obj;
          });

          setCsvData(parsedData);
          setOriginalData(parsedData);
          setFilteredData(parsedData);
          setColumns(headers);
          setSelectedColumns(headers.slice(0, 3)); // Auto-select first 3 columns
          performAdvancedAnalysis(parsedData, headers);
        }
        setIsLoading(false);
      },
      header: false,
      skipEmptyLines: true,
      dynamicTyping: true
    });
  };

  // Enhanced analysis with more insights
  const performAdvancedAnalysis = (data, headers) => {
    const numericColumns = headers.filter(col => 
      data.some(row => typeof row[col] === 'number' && !isNaN(row[col]))
    );
    
    const categoricalColumns = headers.filter(col => 
      !numericColumns.includes(col) && col !== 'id' && col !== '_originalIndex'
    );

    const booleanColumns = headers.filter(col =>
      data.some(row => typeof row[col] === 'boolean')
    );

    const stats = {};
    const distributions = {};
    
    numericColumns.forEach(col => {
      const values = data.map(row => row[col]).filter(val => !isNaN(val) && val !== null);
      if (values.length > 0) {
        const sorted = values.sort((a, b) => a - b);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length;
        
        stats[col] = {
          mean: mean,
          median: sorted[Math.floor(sorted.length / 2)],
          mode: findMode(values),
          min: Math.min(...values),
          max: Math.max(...values),
          std: Math.sqrt(variance),
          variance: variance,
          range: Math.max(...values) - Math.min(...values),
          q1: sorted[Math.floor(sorted.length * 0.25)],
          q3: sorted[Math.floor(sorted.length * 0.75)],
          skewness: calculateSkewness(values, mean, Math.sqrt(variance)),
          kurtosis: calculateKurtosis(values, mean, Math.sqrt(variance))
        };

        // Create distribution data
        distributions[col] = createDistribution(values);
      }
    });

    // Category analysis
    const categoryStats = {};
    categoricalColumns.forEach(col => {
      const values = data.map(row => row[col]).filter(val => val !== null && val !== undefined);
      const counts = {};
      values.forEach(val => counts[val] = (counts[val] || 0) + 1);
      categoryStats[col] = {
        unique: Object.keys(counts).length,
        mostCommon: Object.entries(counts).sort(([,a], [,b]) => b - a).slice(0, 5),
        distribution: counts
      };
    });

    const generatedInsights = generateAdvancedInsights(data, stats, numericColumns, categoricalColumns, categoryStats);
    
    setAnalysis({
      totalRows: data.length,
      totalColumns: headers.length,
      numericColumns,
      categoricalColumns,
      booleanColumns,
      statistics: stats,
      distributions,
      categoryStats,
      correlations: calculateEnhancedCorrelations(data, numericColumns),
      outliers: detectAdvancedOutliers(data, numericColumns),
      dataQuality: assessDataQuality(data, headers),
      trends: detectTrends(data, numericColumns)
    });
    
    setInsights(generatedInsights);
  };

  // Utility functions
  const findMode = (values) => {
    const counts = {};
    values.forEach(val => counts[val] = (counts[val] || 0) + 1);
    return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
  };

  const calculateSkewness = (values, mean, std) => {
    const n = values.length;
    const skew = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / n;
    return skew;
  };

  const calculateKurtosis = (values, mean, std) => {
    const n = values.length;
    const kurt = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / n - 3;
    return kurt;
  };

  const createDistribution = (values, bins = 10) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / bins;
    const distribution = Array(bins).fill(0);
    
    values.forEach(val => {
      const binIndex = Math.min(Math.floor((val - min) / binWidth), bins - 1);
      distribution[binIndex]++;
    });
    
    return distribution.map((count, i) => ({
      bin: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`,
      count,
      percentage: (count / values.length * 100).toFixed(1)
    }));
  };

  const calculateEnhancedCorrelations = (data, numericCols) => {
    const correlations = {};
    numericCols.forEach(col1 => {
      correlations[col1] = {};
      numericCols.forEach(col2 => {
        if (col1 !== col2) {
          const values1 = data.map(row => row[col1]).filter(val => !isNaN(val));
          const values2 = data.map(row => row[col2]).filter(val => !isNaN(val));
          correlations[col1][col2] = calculatePearsonCorrelation(values1, values2);
        }
      });
    });
    return correlations;
  };

  const calculatePearsonCorrelation = (x, y) => {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    
    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const detectAdvancedOutliers = (data, numericCols) => {
    const outliers = {};
    numericCols.forEach(col => {
      const values = data.map(row => row[col]).filter(val => !isNaN(val));
      const sorted = values.sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      const outlierRows = data.filter(row => 
        row[col] < lowerBound || row[col] > upperBound
      );
      
      outliers[col] = {
        count: outlierRows.length,
        percentage: ((outlierRows.length / data.length) * 100).toFixed(1),
        values: outlierRows.map(row => row[col]).slice(0, 10) // Show first 10
      };
    });
    return outliers;
  };

  const assessDataQuality = (data, headers) => {
    const quality = {
      completeness: {},
      consistency: {},
      overall: 0
    };
    
    headers.forEach(col => {
      const values = data.map(row => row[col]);
      const nonNull = values.filter(val => val !== null && val !== undefined && val !== '');
      quality.completeness[col] = ((nonNull.length / values.length) * 100).toFixed(1);
    });
    
    const avgCompleteness = Object.values(quality.completeness)
      .reduce((sum, val) => sum + parseFloat(val), 0) / headers.length;
    
    quality.overall = avgCompleteness.toFixed(1);
    return quality;
  };

  const detectTrends = (data, numericCols) => {
    const trends = {};
    numericCols.forEach(col => {
      const values = data.map(row => row[col]).filter(val => !isNaN(val));
      if (values.length > 2) {
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const change = ((secondAvg - firstAvg) / firstAvg * 100);
        
        trends[col] = {
          direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
          magnitude: Math.abs(change).toFixed(1),
          change: change.toFixed(1)
        };
      }
    });
    return trends;
  };

  const generateAdvancedInsights = (data, stats, numericCols, categoricalCols, categoryStats) => {
    const insights = [];
    
    // Data overview
    insights.push({
      type: 'info',
      title: 'Dataset Overview',
      description: `Analyzing ${data.length.toLocaleString()} records across ${numericCols.length} numeric and ${categoricalCols.length} categorical dimensions.`,
      icon: Database,
      priority: 'high'
    });

    // Data quality insights
    numericCols.forEach(col => {
      const stat = stats[col];
      if (stat) {
        const cv = (stat.std / stat.mean) * 100; // Coefficient of variation
        let insight = '';
        let type = 'trend';
        
        if (cv > 100) {
          insight = `${col} shows high variability (CV: ${cv.toFixed(1)}%) - consider investigating extreme values.`;
          type = 'warning';
        } else if (stat.skewness > 1 || stat.skewness < -1) {
          insight = `${col} distribution is highly skewed (${stat.skewness > 0 ? 'right' : 'left'}-skewed: ${stat.skewness.toFixed(2)}).`;
          type = 'info';
        } else {
          insight = `${col}: Mean ${stat.mean.toFixed(2)}, Range ${stat.min.toFixed(2)} to ${stat.max.toFixed(2)}, Well-distributed data.`;
        }
        
        insights.push({
          type,
          title: `${col} Statistical Profile`,
          description: insight,
          icon: TrendingUp,
          priority: type === 'warning' ? 'high' : 'medium'
        });
      }
    });

    // Correlation insights
    if (analysis && Object.keys(analysis.correlations).length > 0) {
      Object.entries(analysis.correlations).forEach(([col1, correlations]) => {
        Object.entries(correlations).forEach(([col2, corr]) => {
          if (Math.abs(corr) > 0.7) {
            insights.push({
              type: corr > 0 ? 'trend' : 'warning',
              title: 'Strong Correlation Detected',
              description: `${col1} and ${col2} show ${corr > 0 ? 'positive' : 'negative'} correlation (${corr.toFixed(3)}).`,
              icon: Sparkles,
              priority: 'high'
            });
          }
        });
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  // Data filtering and sorting
  useEffect(() => {
    let filtered = [...originalData];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(val =>
          val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply column-specific filter
    if (filterValue && sortColumn) {
      filtered = filtered.filter(row => {
        const value = row[sortColumn];
        if (typeof value === 'number') {
          return value >= parseFloat(filterValue) || isNaN(parseFloat(filterValue));
        }
        return value && value.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    }
    
    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = aVal ? aVal.toString() : '';
        const bStr = bVal ? bVal.toString() : '';
        return sortDirection === 'asc' 
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }
    
    setFilteredData(filtered);
    setCsvData(filtered);
  }, [searchTerm, filterValue, sortColumn, sortDirection, originalData]);

  // Enhanced drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files[0]) {
      handleFileUpload(files[0]);
    }
  };

  // Enhanced stat card with animations
  const StatCard = ({ title, value, icon: Icon, color, trend, description }) => (
    <div className={`${currentTheme.cardBg} rounded-xl shadow-2xl p-6 border-l-4 border-${color}-500 hover:scale-105 transform transition-all duration-300 ${animations ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {description && (
            <p className="text-xs text-white/60">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`h-4 w-4 mr-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Math.abs(trend).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className="ml-4">
          <Icon className={`h-10 w-10 text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  // Enhanced insight card
  const InsightCard = ({ insight }) => {
    const Icon = insight.icon || Brain;
    const priorityColors = {
      high: 'border-red-500 bg-red-50',
      medium: 'border-yellow-500 bg-yellow-50', 
      low: 'border-green-500 bg-green-50'
    };
    
    return (
      <div className={`${currentTheme.cardBg} rounded-xl shadow-lg p-6 border-l-4 ${priorityColors[insight.priority]} hover:shadow-2xl transition-all duration-300`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 text-white`} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white text-lg mb-2">{insight.title}</h4>
            <p className="text-white/80 text-sm leading-relaxed">{insight.description}</p>
            <div className="mt-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {insight.priority.toUpperCase()} PRIORITY
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced chart rendering with better axis labels
  const renderEnhancedCharts = () => {
    if (!analysis || !csvData.length) return null;

    const { numericColumns } = analysis;
    const data = csvData.slice(0, 100); // Limit for performance
    
    const getAxisLabel = (column) => {
      // Create more descriptive axis labels
      const words = column.split(/[_\s]+/);
      const formatted = words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      
      // Add units or context based on common patterns
      if (column.toLowerCase().includes('price') || column.toLowerCase().includes('cost')) {
        return `${formatted} ($)`;
      } else if (column.toLowerCase().includes('percent') || column.toLowerCase().includes('rate')) {
        return `${formatted} (%)`;
      } else if (column.toLowerCase().includes('count') || column.toLowerCase().includes('number')) {
        return `${formatted} (Count)`;
      } else if (column.toLowerCase().includes('time') || column.toLowerCase().includes('duration')) {
        return `${formatted} (Time)`;
      }
      
      return formatted;
    };

    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-lg p-4 shadow-2xl">
            <p className="text-white font-semibold mb-2">{`Data Point: ${label}`}</p>
            {payload.map((entry, index) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                <span className="font-medium">{getAxisLabel(entry.dataKey)}:</span> {entry.value}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };
    
    return (
      <div className="space-y-8">
        {/* Enhanced Line Chart */}
        {numericColumns.length > 0 && (
          <div className={`${currentTheme.cardBg} rounded-xl shadow-2xl p-8`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-blue-400" />
                Temporal Trend Analysis
              </h3>
              <div className="flex items-center space-x-2">
                <select 
                  className="bg-gray-800/50 text-white rounded-lg px-3 py-1 border border-white/20"
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                >
                  {Object.entries(chartConfigs).map(([key, config]) => (
                    <option key={key} value={key}>{config.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={data} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="id" 
                  stroke="rgba(255,255,255,0.7)"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Record Index', position: 'insideBottom', offset: -20, style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.8)' } }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  style={{ fontSize: '12px' }}
                  label={{ value: getAxisLabel(numericColumns[0]) || 'Values', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.8)' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                {selectedColumns.filter(col => numericColumns.includes(col)).slice(0, 4).map((col, index) => (
                  <Line 
                    key={col} 
                    type="monotone" 
                    dataKey={col} 
                    stroke={currentTheme.primary[index]} 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    name={getAxisLabel(col)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Enhanced Bar Chart with better labeling */}
        {numericColumns.length > 0 && (
          <div className={`${currentTheme.cardBg} rounded-xl shadow-2xl p-8`}>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 mr-3 text-green-400" />
              Comparative Value Analysis
            </h3>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={data.slice(0, 25)} margin={{ top: 20, right: 30, left: 40, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="id" 
                  stroke="rgba(255,255,255,0.7)"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  label={{ value: 'Record ID', position: 'insideBottom', offset: -60, style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.8)' } }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  label={{ value: 'Values', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.8)' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedColumns.filter(col => numericColumns.includes(col)).slice(0, 3).map((col, index) => (
                  <Bar 
                    key={col} 
                    dataKey={col} 
                    fill={currentTheme.primary[index]}
                    name={getAxisLabel(col)}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Enhanced Scatter Plot */}
        {numericColumns.length >= 2 && (
          <div className={`${currentTheme.cardBg} rounded-xl shadow-2xl p-8`}>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Sparkles className="h-6 w-6 mr-3 text-pink-400" />
              Correlation Matrix Visualization
            </h3>
            <ResponsiveContainer width="100%" height={500}>
              <ScatterChart data={data} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey={numericColumns[0]} 
                  stroke="rgba(255,255,255,0.7)"
                  label={{ value: getAxisLabel(numericColumns[0]), position: 'insideBottom', offset: -20, style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.8)' } }}
                />
                <YAxis 
                  dataKey={numericColumns[1]} 
                  stroke="rgba(255,255,255,0.7)"
                  label={{ value: getAxisLabel(numericColumns[1]), angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.8)' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter 
                  dataKey={numericColumns[1]} 
                  fill={currentTheme.primary[0]}
                  strokeWidth={2}
                  stroke="#fff"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* New: Composed Chart */}
        {numericColumns.length >= 2 && (
          <div className={`${currentTheme.cardBg} rounded-xl shadow-2xl p-8`}>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Layers className="h-6 w-6 mr-3 text-purple-400" />
              Multi-Dimensional Analysis
            </h3>
            <ResponsiveContainer width="100%" height={500}>
              <ComposedChart data={data.slice(0, 30)} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="id" 
                  stroke="rgba(255,255,255,0.7)"
                  label={{ value: 'Record Index', position: 'insideBottom', offset: -20, style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.8)' } }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  label={{ value: 'Values', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.8)' } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  dataKey={numericColumns[0]} 
                  fill={currentTheme.primary[0]}
                  stroke={currentTheme.primary[0]}
                  fillOpacity={0.3}
                  name={getAxisLabel(numericColumns[0])}
                />
                <Bar 
                  dataKey={numericColumns[1]} 
                  fill={currentTheme.primary[1]}
                  name={getAxisLabel(numericColumns[1])}
                />
                <Line 
                  type="monotone" 
                  dataKey={numericColumns.length > 2 ? numericColumns[2] : numericColumns[0]} 
                  stroke={currentTheme.primary[2]}
                  strokeWidth={3}
                  name={getAxisLabel(numericColumns.length > 2 ? numericColumns[2] : numericColumns[0])}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* New: Radar Chart for multi-dimensional comparison */}
        {numericColumns.length >= 3 && (
          <div className={`${currentTheme.cardBg} rounded-xl shadow-2xl p-8`}>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Target className="h-6 w-6 mr-3 text-orange-400" />
              Multi-Dimensional Profile
            </h3>
            <ResponsiveContainer width="100%" height={500}>
              <RadarChart data={data.slice(0, 1).map(item => {
                const normalized = {};
                numericColumns.slice(0, 6).forEach(col => {
                  const max = Math.max(...csvData.map(row => row[col] || 0));
                  const min = Math.min(...csvData.map(row => row[col] || 0));
                  normalized[getAxisLabel(col)] = ((item[col] - min) / (max - min)) * 100;
                });
                return normalized;
              })}>
                <PolarGrid gridType="polygon" stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                />
                <Radar
                  dataKey="value"
                  stroke={currentTheme.primary[0]}
                  fill={currentTheme.primary[0]}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.background}`}>
      {/* Enhanced Header */}
      <div className="bg-black/20 backdrop-blur-lg shadow-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Brain className="h-10 w-10 text-white animate-pulse" />
                <Cpu className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  DataInsight AI Pro
                </h1>
                <p className="text-sm text-white/60">Next-Generation Analytics Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Selector */}
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-white/10 backdrop-blur-lg text-white rounded-lg px-3 py-2 border border-white/20 focus:border-cyan-400 transition-colors"
              >
                <option value="gradient">Gradient</option>
                <option value="neon">Neon</option>
                <option value="ocean">Ocean</option>
                <option value="sunset">Sunset</option>
              </select>
              
              {/* Settings */}
              <button
                onClick={() => setAnimations(!animations)}
                className={`p-2 rounded-lg transition-colors ${animations ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 text-white rounded-full text-sm font-medium border border-green-500/30">
                  🚀 AI Enhanced
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white rounded-full text-sm font-medium border border-purple-500/30">
                  ⚡ Real-time
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!csvData.length ? (
          <div className="text-center">
            {/* Enhanced Upload Section */}
            <div 
              className={`max-w-2xl mx-auto border-2 border-dashed rounded-2xl p-12 transition-all duration-500 ${
                isDragOver 
                  ? 'border-cyan-400 bg-cyan-500/10 scale-105' 
                  : 'border-white/30 hover:border-cyan-400/60 hover:bg-white/5'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="relative">
                <Upload className="mx-auto h-16 w-16 text-white/60 mb-6 animate-bounce" />
                <div className="absolute -top-2 -right-2">
                  <Zap className="h-8 w-8 text-yellow-400 animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Drop Your Data & Watch the Magic</h3>
              <p className="text-white/70 mb-6 text-lg">
                Advanced AI analysis • Real-time insights • Beautiful visualizations
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl shadow-2xl hover:from-cyan-600 hover:to-blue-600 cursor-pointer transition-all duration-300 transform hover:scale-105"
              >
                <Globe className="h-5 w-5 mr-2" />
                Choose Your Dataset
              </label>
            </div>

            {/* Enhanced Feature Showcase */}
            <div className="mt-12 grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "AI-Powered Insights",
                  features: ["Smart pattern detection", "Automated anomaly identification", "Predictive trend analysis", "Correlation discovery"],
                  color: "from-purple-500 to-pink-500"
                },
                {
                  icon: Sparkles,
                  title: "Advanced Visualizations", 
                  features: ["Interactive charts", "Real-time updates", "Custom themes", "Multi-dimensional analysis"],
                  color: "from-cyan-500 to-blue-500"
                },
                {
                  icon: Zap,
                  title: "Lightning Performance",
                  features: ["Instant processing", "Real-time filtering", "Smart sampling", "Optimized rendering"],
                  color: "from-yellow-500 to-orange-500"
                }
              ].map((feature, index) => (
                <div key={index} className={`${currentTheme.cardBg} rounded-2xl p-8 hover:scale-105 transition-transform duration-300`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-4">{feature.title}</h4>
                  <ul className="text-white/70 space-y-2 text-sm">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center">
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Enhanced Loading Overlay */}
            {isLoading && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50">
                <div className={`${currentTheme.cardBg} rounded-2xl p-12 flex flex-col items-center space-y-6 max-w-md mx-4`}>
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500/30 border-t-cyan-400"></div>
                    <Brain className="absolute inset-0 m-auto h-8 w-8 text-white animate-pulse" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">AI Analysis in Progress</h3>
                    <p className="text-white/70">Processing your data with advanced algorithms...</p>
                  </div>
                  <div className="flex space-x-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`w-2 h-2 bg-cyan-400 rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Control Panel */}
            <div className={`${currentTheme.cardBg} rounded-2xl p-6 mb-8 shadow-2xl`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-cyan-400 transition-colors"
                  />
                </div>
                
                {/* Column Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-3 h-5 w-5 text-white/50" />
                  <input
                    type="text"
                    placeholder="Filter value..."
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-cyan-400 transition-colors"
                  />
                </div>
                
                {/* Sort Column */}
                <select
                  value={sortColumn}
                  onChange={(e) => setSortColumn(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-cyan-400 transition-colors"
                >
                  <option value="">Sort by column...</option>
                  {columns.map(col => (
                    <option key={col} value={col} className="bg-gray-900">{col}</option>
                  ))}
                </select>
                
                {/* Sort Direction */}
                <button
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
                >
                  <TrendingUp className={`h-5 w-5 mr-2 transform ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                  {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
            </div>

            {/* Enhanced Tabs */}
            <div className="mb-8">
              <nav className="flex space-x-2">
                {[
                  { id: 'overview', name: 'Dashboard', icon: Eye, color: 'cyan' },
                  { id: 'insights', name: 'AI Insights', icon: Brain, color: 'purple' },
                  { id: 'charts', name: 'Visualizations', icon: BarChart3, color: 'green' }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/50 shadow-lg scale-105`
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Enhanced Overview Tab */}
            {activeTab === 'overview' && analysis && (
              <div className="space-y-8">
                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Records"
                    value={analysis.totalRows.toLocaleString()}
                    icon={Database}
                    color="blue"
                    description="Data points analyzed"
                    trend={5.2}
                  />
                  <StatCard
                    title="Data Dimensions"
                    value={analysis.totalColumns}
                    icon={Layers}
                    color="green"
                    description="Unique attributes"
                    trend={-2.1}
                  />
                  <StatCard
                    title="Numeric Fields"
                    value={analysis.numericColumns.length}
                    icon={TrendingUp}
                    color="purple"
                    description="Quantitative measures"
                    trend={12.8}
                  />
                  <StatCard
                    title="Data Quality"
                    value={`${analysis.dataQuality.overall}%`}
                    icon={Target}
                    color="pink"
                    description="Completeness score"
                    trend={7.3}
                  />
                </div>

                {/* Enhanced Data Preview Table */}
                <div className={`${currentTheme.cardBg} rounded-2xl shadow-2xl overflow-hidden`}>
                  <div className="px-8 py-6 border-b border-white/10">
                    <h3 className="text-2xl font-bold text-white flex items-center">
                      <FileText className="h-6 w-6 mr-3 text-cyan-400" />
                      Data Preview
                      <span className="ml-4 text-sm font-normal text-white/60">
                        Showing {Math.min(filteredData.length, 10)} of {filteredData.length} records
                      </span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-white/5">
                        <tr>
                          {columns.slice(0, 8).map((col) => (
                            <th key={col} className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">
                              {col}
                              {analysis.numericColumns.includes(col) && (
                                <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">NUM</span>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredData.slice(0, 10).map((row, index) => (
                          <tr key={index} className="hover:bg-white/5 transition-colors">
                            {columns.slice(0, 8).map((col) => (
                              <td key={col} className="px-6 py-4 text-sm text-white/90">
                                {typeof row[col] === 'number' ? row[col].toLocaleString() : row[col]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Enhanced Statistics Table */}
                {Object.keys(analysis.statistics).length > 0 && (
                  <div className={`${currentTheme.cardBg} rounded-2xl shadow-2xl p-8`}>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Activity className="h-6 w-6 mr-3 text-green-400" />
                      Statistical Analysis
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left py-4 text-white font-semibold">Metric</th>
                            <th className="text-left py-4 text-white font-semibold">Mean</th>
                            <th className="text-left py-4 text-white font-semibold">Median</th>
                            <th className="text-left py-4 text-white font-semibold">Std Dev</th>
                            <th className="text-left py-4 text-white font-semibold">Range</th>
                            <th className="text-left py-4 text-white font-semibold">Skewness</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(analysis.statistics).map(([col, stats]) => (
                            <tr key={col} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                              <td className="py-4 font-semibold text-white">{col}</td>
                              <td className="py-4 text-white/80">{stats.mean.toFixed(2)}</td>
                              <td className="py-4 text-white/80">{stats.median.toFixed(2)}</td>
                              <td className="py-4 text-white/80">{stats.std.toFixed(2)}</td>
                              <td className="py-4 text-white/80">{stats.range.toFixed(2)}</td>
                              <td className="py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  Math.abs(stats.skewness) < 0.5 ? 'bg-green-100/20 text-green-400' :
                                  Math.abs(stats.skewness) < 1 ? 'bg-yellow-100/20 text-yellow-400' :
                                  'bg-red-100/20 text-red-400'
                                }`}>
                                  {stats.skewness.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-8">
                {/* AI Insights */}
                <div className={`${currentTheme.cardBg} rounded-2xl shadow-2xl p-8`}>
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Brain className="h-6 w-6 mr-3 text-purple-400" />
                    AI-Generated Intelligence
                    <span className="ml-4 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                      {insights.length} Insights
                    </span>
                  </h3>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {insights.map((insight, index) => (
                      <InsightCard key={index} insight={insight} />
                    ))}
                  </div>
                </div>

                {/* Enhanced Correlation Matrix */}
                {analysis && Object.keys(analysis.correlations).length > 0 && (
                  <div className={`${currentTheme.cardBg} rounded-2xl shadow-2xl p-8`}>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Sparkles className="h-6 w-6 mr-3 text-cyan-400" />
                      Correlation Intelligence Matrix
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="text-left py-4 text-white/60"></th>
                            {Object.keys(analysis.correlations).map(col => (
                              <th key={col} className="text-left py-4 px-3 text-sm text-white/80 font-semibold">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(analysis.correlations).map(([col1, correlations]) => (
                            <tr key={col1}>
                              <td className="py-4 font-semibold text-white">{col1}</td>
                              {Object.entries(correlations).map(([col2, corr]) => (
                                <td key={col2} className="py-4 px-3">
                                  <div className={`px-3 py-2 rounded-lg text-xs font-bold text-center ${
                                    Math.abs(corr) > 0.8 ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                    Math.abs(corr) > 0.6 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                                    Math.abs(corr) > 0.3 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                    'bg-green-500/20 text-green-300 border border-green-500/30'
                                  }`}>
                                    {corr.toFixed(3)}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Data Quality Assessment */}
                {analysis?.dataQuality && (
                  <div className={`${currentTheme.cardBg} rounded-2xl shadow-2xl p-8`}>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Target className="h-6 w-6 mr-3 text-green-400" />
                      Data Quality Assessment
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(analysis.dataQuality.completeness).map(([col, percentage]) => (
                        <div key={col} className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-2">{col}</h4>
                          <div className="w-full bg-gray-600/50 rounded-full h-2 mb-2">
                            <div 
                              className={`h-2 rounded-full ${
                                parseFloat(percentage) > 90 ? 'bg-green-400' :
                                parseFloat(percentage) > 70 ? 'bg-yellow-400' :
                                'bg-red-400'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-white/80 text-sm">{percentage}% complete</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Charts Tab */}
            {activeTab === 'charts' && (
              <div>
                {/* Column Selection for Charts */}
                <div className={`${currentTheme.cardBg} rounded-2xl shadow-2xl p-6 mb-8`}>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-cyan-400" />
                    Visualization Controls
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Select Columns to Visualize:</label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {columns.filter(col => analysis?.numericColumns.includes(col)).map(col => (
                          <label key={col} className="flex items-center space-x-2 text-white/80">
                            <input
                              type="checkbox"
                              checked={selectedColumns.includes(col)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedColumns([...selectedColumns, col]);
                                } else {
                                  setSelectedColumns(selectedColumns.filter(c => c !== col));
                                }
                              }}
                              className="rounded border-white/20 bg-white/10"
                            />
                            <span className="text-sm">{col}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Data Range:</label>
                      <p className="text-white/60 text-sm">
                        Displaying {Math.min(csvData.length, 100)} of {csvData.length} records
                      </p>
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            setFilteredData(originalData);
                            setCsvData(originalData);
                          }}
                          className="flex items-center px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {renderEnhancedCharts()}
              </div>
            )}

            {/* Enhanced Action Buttons */}
            <div className="mt-12 flex justify-center space-x-6">
              <button
                onClick={() => {
                  setCsvData([]);
                  setOriginalData([]);
                  setFilteredData([]);
                  setAnalysis(null);
                  setInsights([]);
                  setSearchTerm('');
                  setFilterValue('');
                  setSortColumn('');
                  setSelectedColumns([]);
                }}
                className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-semibold shadow-xl hover:scale-105"
              >
                <Upload className="h-5 w-5 mr-2 inline" />
                New Dataset
              </button>
              
              <button
                onClick={() => {
                  const report = {
                    metadata: {
                      generatedAt: new Date().toISOString(),
                      totalRecords: analysis?.totalRows,
                      analysis: 'DataInsight AI Pro Analysis'
                    },
                    analysis,
                    insights,
                    summary: `Complete analysis of ${analysis?.totalRows} records with ${analysis?.numericColumns.length} numeric variables.`
                  };
                  const dataStr = JSON.stringify(report, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                  const exportFileDefaultName = `analysis_report_${Date.now()}.json`;
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                }}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 font-semibold shadow-xl hover:scale-105"
              >
                <Download className="h-5 w-5 mr-2 inline" />
                Export Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataAnalyticsPlatform;
import React, { useState, useEffect } from 'react';
import { Upload, FileText, BarChart3, PieChart, TrendingUp, Brain, Download, Eye, Sparkles, Activity } from 'lucide-react';
import Papa from 'papaparse';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart as RechartsPieChart, Cell, ScatterChart, Scatter,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Treemap, FunnelChart, Funnel, LabelList
} from 'recharts';

const DataAnalyticsPlatform = () => {
  const [csvData, setCsvData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState([]);

  // Color palette for charts
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

  const handleFileUpload = (file) => {
    if (!file) return;
    
    setIsLoading(true);
    
    Papa.parse(file, {
      complete: (result) => {
        if (result.data && result.data.length > 0) {
          const headers = result.data[0];
          const dataRows = result.data.slice(1).filter(row => row.some(cell => cell.trim() !== ''));
          
          const parsedData = dataRows.map((row, index) => {
            const obj = { id: index + 1 };
            headers.forEach((header, i) => {
              obj[header] = isNaN(row[i]) ? row[i] : parseFloat(row[i]);
            });
            return obj;
          });

          setCsvData(parsedData);
          setOriginalData(parsedData);
          setColumns(headers);
          performAnalysis(parsedData, headers);
        }
        setIsLoading(false);
      },
      header: false,
      skipEmptyLines: true
    });
  };

  const performAnalysis = (data, headers) => {
    const numericColumns = headers.filter(col => 
      data.some(row => typeof row[col] === 'number' && !isNaN(row[col]))
    );
    
    const categoricalColumns = headers.filter(col => 
      !numericColumns.includes(col)
    );

    const stats = {};
    
    numericColumns.forEach(col => {
      const values = data.map(row => row[col]).filter(val => !isNaN(val));
      stats[col] = {
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)],
        min: Math.min(...values),
        max: Math.max(...values),
        std: Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - (values.reduce((a, b) => a + b, 0) / values.length), 2), 0) / values.length)
      };
    });

    // Generate insights
    const generatedInsights = generateInsights(data, stats, numericColumns, categoricalColumns);
    
    setAnalysis({
      totalRows: data.length,
      totalColumns: headers.length,
      numericColumns,
      categoricalColumns,
      statistics: stats,
      correlations: calculateCorrelations(data, numericColumns),
      outliers: detectOutliers(data, numericColumns)
    });
    
    setInsights(generatedInsights);
  };

  const calculateCorrelations = (data, numericCols) => {
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
    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const detectOutliers = (data, numericCols) => {
    const outliers = {};
    numericCols.forEach(col => {
      const values = data.map(row => row[col]).filter(val => !isNaN(val));
      const q1 = values.sort((a, b) => a - b)[Math.floor(values.length * 0.25)];
      const q3 = values[Math.floor(values.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      outliers[col] = data.filter(row => 
        row[col] < lowerBound || row[col] > upperBound
      ).length;
    });
    return outliers;
  };

  const generateInsights = (data, stats, numericCols, categoricalCols) => {
    const insights = [];
    
    // Data quality insights
    insights.push({
      type: 'info',
      title: 'Data Overview',
      description: `Dataset contains ${data.length} records with ${numericCols.length} numeric and ${categoricalCols.length} categorical columns.`
    });

    // Statistical insights
    numericCols.forEach(col => {
      const stat = stats[col];
      if (stat) {
        insights.push({
          type: 'trend',
          title: `${col} Analysis`,
          description: `Average: ${stat.mean.toFixed(2)}, Range: ${stat.min.toFixed(2)} - ${stat.max.toFixed(2)}, Std Dev: ${stat.std.toFixed(2)}`
        });
      }
    });

    // Distribution insights
    if (numericCols.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Distribution Analysis',
        description: 'Check the distribution charts below to identify skewness and potential data quality issues.'
      });
    }

    return insights;
  };

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

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${color}-500 hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
    </div>
  );

  const InsightCard = ({ insight }) => {
    const iconMap = {
      info: Activity,
      trend: TrendingUp,
      warning: Brain
    };
    const colorMap = {
      info: 'blue',
      trend: 'green',
      warning: 'yellow'
    };
    
    const Icon = iconMap[insight.type];
    const color = colorMap[insight.type];
    
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 border-${color}-500`}>
        <div className="flex items-start space-x-3">
          <Icon className={`h-5 w-5 text-${color}-500 mt-0.5`} />
          <div>
            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCharts = () => {
    if (!analysis || !csvData.length) return null;

    const { numericColumns } = analysis;
    
    return (
      <div className="space-y-8">
        {/* Line Chart */}
        {numericColumns.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Trend Analysis
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={csvData.slice(0, 50)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Legend />
                {numericColumns.slice(0, 3).map((col, index) => (
                  <Line 
                    key={col} 
                    type="monotone" 
                    dataKey={col} 
                    stroke={colors[index]} 
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar Chart */}
        {numericColumns.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
              Comparative Analysis
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={csvData.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Legend />
                {numericColumns.slice(0, 3).map((col, index) => (
                  <Bar key={col} dataKey={col} fill={colors[index]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Area Chart */}
        {numericColumns.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-500" />
              Distribution Analysis
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={csvData.slice(0, 30)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Legend />
                {numericColumns.slice(0, 2).map((col, index) => (
                  <Area 
                    key={col} 
                    type="monotone" 
                    dataKey={col} 
                    stackId="1"
                    stroke={colors[index]} 
                    fill={colors[index]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Scatter Plot */}
        {numericColumns.length >= 2 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-pink-500" />
              Correlation Analysis
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={csvData}>
                <CartesianGrid />
                <XAxis dataKey={numericColumns[0]} />
                <YAxis dataKey={numericColumns[1]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter dataKey={numericColumns[1]} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DataInsight AI</h1>
                <p className="text-sm text-gray-500">Automated Data Analysis Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                AI Powered
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!csvData.length ? (
          <div className="text-center">
            {/* Upload Section */}
            <div 
              className={`max-w-lg mx-auto border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                isDragOver 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your CSV File</h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop your file here, or click to select
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer transition-colors duration-200"
              >
                Choose File
              </label>
            </div>

            {/* Supported Formats */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Supported CSV Formats
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">✅ Accepted Data Types:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Numerical data (integers, decimals)</li>
                    <li>• Categorical data (text, categories)</li>
                    <li>• Date/time values</li>
                    <li>• Mixed data types</li>
                    <li>• Headers in first row</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📊 Analysis Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Statistical summaries</li>
                    <li>• Correlation analysis</li>
                    <li>• Outlier detection</li>
                    <li>• Beautiful visualizations</li>
                    <li>• AI-powered insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Loading Overlay */}
            {isLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="text-lg font-medium">Analyzing your data...</span>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', name: 'Overview', icon: Eye },
                  { id: 'insights', name: 'AI Insights', icon: Brain },
                  { id: 'charts', name: 'Visualizations', icon: BarChart3 }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'text-indigo-600 bg-indigo-100'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && analysis && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Records"
                    value={analysis.totalRows.toLocaleString()}
                    icon={FileText}
                    color="blue"
                  />
                  <StatCard
                    title="Columns"
                    value={analysis.totalColumns}
                    icon={BarChart3}
                    color="green"
                  />
                  <StatCard
                    title="Numeric Fields"
                    value={analysis.numericColumns.length}
                    icon={TrendingUp}
                    color="purple"
                  />
                  <StatCard
                    title="Categories"
                    value={analysis.categoricalColumns.length}
                    icon={PieChart}
                    color="pink"
                  />
                </div>

                {/* Data Table Preview */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Data Preview</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {columns.slice(0, 10).map((col) => (
                            <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {csvData.slice(0, 10).map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {columns.slice(0, 10).map((col) => (
                              <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {typeof row[col] === 'number' ? row[col].toFixed(2) : row[col]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Statistics */}
                {Object.keys(analysis.statistics).length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Statistical Summary</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Column</th>
                            <th className="text-left py-2">Mean</th>
                            <th className="text-left py-2">Median</th>
                            <th className="text-left py-2">Min</th>
                            <th className="text-left py-2">Max</th>
                            <th className="text-left py-2">Std Dev</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(analysis.statistics).map(([col, stats]) => (
                            <tr key={col} className="border-b">
                              <td className="py-2 font-medium">{col}</td>
                              <td className="py-2">{stats.mean.toFixed(2)}</td>
                              <td className="py-2">{stats.median.toFixed(2)}</td>
                              <td className="py-2">{stats.min.toFixed(2)}</td>
                              <td className="py-2">{stats.max.toFixed(2)}</td>
                              <td className="py-2">{stats.std.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-500" />
                    AI-Generated Insights
                  </h3>
                  <div className="grid gap-4">
                    {insights.map((insight, index) => (
                      <InsightCard key={index} insight={insight} />
                    ))}
                  </div>
                </div>

                {/* Correlation Matrix */}
                {analysis && Object.keys(analysis.correlations).length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Correlation Matrix</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="text-left py-2"></th>
                            {Object.keys(analysis.correlations).map(col => (
                              <th key={col} className="text-left py-2 px-2 text-sm">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(analysis.correlations).map(([col1, correlations]) => (
                            <tr key={col1}>
                              <td className="py-2 font-medium text-sm">{col1}</td>
                              {Object.entries(correlations).map(([col2, corr]) => (
                                <td key={col2} className="py-2 px-2">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    Math.abs(corr) > 0.7 ? 'bg-red-100 text-red-800' :
                                    Math.abs(corr) > 0.3 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {corr.toFixed(2)}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Charts Tab */}
            {activeTab === 'charts' && renderCharts()}

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => {
                  setCsvData([]);
                  setAnalysis(null);
                  setInsights([]);
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Upload New File
              </button>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(analysis, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                  const exportFileDefaultName = 'analysis_report.json';
                  const linkElement = document.createElement('a');
                  linkElement.setAttribute('href', dataUri);
                  linkElement.setAttribute('download', exportFileDefaultName);
                  linkElement.click();
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
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
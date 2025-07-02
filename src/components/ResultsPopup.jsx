import './ResultsPopup.css';
import React, { useState, useEffect } from 'react';
import { Line, Scatter, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ScatterController 
} from 'chart.js';
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  BarChart3, 
  Zap, 
  Wifi, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Radio,
  Grid3x3
} from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ScatterController
);

// Fonction générique pour générer la grille hexagonale
const generateHexGrid = (size) => {
  const cells = [];
  const colors = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#fb7185', '#10b981'];
  
  const hexSize = 30;
  const centerX = 150;
  const centerY = 150;

  
  if (size === 1) {
    return [{ x: centerX, y: centerY, freq: 'A', color: colors[0] }];
  }else if (size === 3) {
    cells.push({ x: centerX, y: centerY - hexSize * 1.5, freq: 'A', color: colors[0] });
    cells.push({ x: centerX - hexSize * Math.sqrt(3)/2, y: centerY + hexSize * 0.75, freq: 'B', color: colors[1] });
    cells.push({ x: centerX + hexSize * Math.sqrt(3)/2, y: centerY + hexSize * 0.75, freq: 'C', color: colors[2] });
  } else if (size === 4) {
    cells.push({ x: centerX - hexSize, y: centerY - hexSize, freq: 'A', color: colors[0] });
    cells.push({ x: centerX + hexSize, y: centerY - hexSize, freq: 'B', color: colors[1] });
    cells.push({ x: centerX - hexSize, y: centerY + hexSize, freq: 'C', color: colors[2] });
    cells.push({ x: centerX + hexSize, y: centerY + hexSize, freq: 'D', color: colors[3] });
  } else if (size === 7) {
    cells.push({ x: centerX, y: centerY, freq: 'A', color: colors[0] });
    const radius = hexSize * Math.sqrt(3);
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      cells.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        freq: String.fromCharCode(66 + i),
        color: colors[i + 1]
      });
    }
  } else if (size === 9) {
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        cells.push({
          x: centerX + col * hexSize * Math.sqrt(3),
          y: centerY + row * hexSize * 1.5,
          freq: String.fromCharCode(65 + (row + 1) * 3 + (col + 1)),
          color: colors[(row + 1) * 3 + (col + 1)]
        });
      }
    }
  } else if (size === 12) {
    const positions = [
      { x: 0, y: -2 }, { x: 1, y: -2 }, { x: 2, y: -1 },
      { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 2 },
      { x: 0, y: 2 }, { x: -1, y: 2 }, { x: -2, y: 1 },
      { x: -2, y: 0 }, { x: -2, y: -1 }, { x: -1, y: -2 }
    ];
    
    positions.forEach((pos, index) => {
      cells.push({
        x: centerX + pos.x * hexSize * Math.sqrt(3) / 2,
        y: centerY + pos.y * hexSize * 0.75,
        freq: String.fromCharCode(65 + index),
        color: colors[index % colors.length]
      });
    });
  }
  
  return cells;
};

// Composant pour dessiner une cellule hexagonale
const HexagonCell = ({ x, y, size, frequency, isSelected, onClick, color }) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    points.push(`${px},${py}`);
  }

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <polygon
        points={points.join(' ')}
        fill={color}
        stroke={isSelected ? "#1f2937" : "#374151"}
        strokeWidth={isSelected ? 2 : 1}
        opacity={0.8}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#1f2937"
      >
        {frequency}
      </text>
    </g>
  );
};

// Composant pour visualiser un cluster cellulaire
const CellularCluster = ({ clusterSize, frequenciesPerCell, totalFrequencies, linkType }) => {
  const [selectedCell, setSelectedCell] = useState(null);
  
  const cells = generateHexGrid(clusterSize);

  return (
    <div className="bg-white p-6 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Grid3x3 className="h-5 w-5 text-blue-600" />
          <span>Cluster Cellulaire {linkType} (N = {clusterSize})</span>
        </h3>
        <div className="text-sm text-gray-600">
          {frequenciesPerCell?.toFixed(1)} kHz/cellule
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <svg width="300" height="300" viewBox="0 0 300 300">
            {cells.map((cell, index) => (
              <HexagonCell
                key={index}
                x={cell.x}
                y={cell.y}
                size={25}
                frequency={cell.freq}
                color={cell.color}
                isSelected={selectedCell === index}
                onClick={() => setSelectedCell(selectedCell === index ? null : index)}
              />
            ))}
          </svg>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Paramètres du Cluster</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Taille du cluster (N):</span>
                <span className="font-medium">{clusterSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Total fréquences:</span>
                <span className="font-medium">{totalFrequencies || 'N/A'} kHz</span>
              </div>
              <div className="flex justify-between">
                <span>Fréquences/cellule:</span>
                <span className="font-medium">{frequenciesPerCell?.toFixed(1) || 'N/A'} kHz</span>
              </div>
            </div>
          </div>
          
          {selectedCell !== null && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Cellule {cells[selectedCell]?.freq}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Fréquence assignée:</span>
                  <span className="font-medium">{cells[selectedCell]?.freq}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bande passante:</span>
                  <span className="font-medium">{frequenciesPerCell?.toFixed(1)} kHz</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Réutilisation des Fréquences</h4>
            <p className="text-sm text-gray-700">
              Chaque couleur représente un groupe de fréquences différent. 
              Les cellules de même couleur utilisent les mêmes fréquences et 
              sont suffisamment éloignées pour éviter les interférences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour visualiser une cellule individuelle
const SingleCellView = ({ result }) => {
  const cellRadius = result.coverage || 1;
  const reuseDistance = result.reuseDistance || 3;
  
  return (
    <div className="bg-white p-6 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Radio className="h-5 w-5 text-green-600" />
          <span>Cellule - {result.edgeId} ({result.linkType})</span>
        </h3>
        <div className="text-sm text-gray-600">
          Type: {result.linkType}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <svg width="300" height="300" viewBox="0 0 300 300">
            <circle
              cx="150"
              cy="150"
              r={Math.min(cellRadius * 20, 80)}
              fill="rgba(34, 197, 94, 0.3)"
              stroke="rgba(34, 197, 94, 0.8)"
              strokeWidth="2"
            />
            <circle
              cx="150"
              cy="150"
              r={Math.min(reuseDistance * 10, 120)}
              fill="none"
              stroke="rgba(239, 68, 68, 0.5)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <circle
              cx="150"
              cy="150"
              r="8"
              fill="#1f2937"
            />
            <line
              x1="150"
              y1="150"
              x2="150"
              y2="130"
              stroke="#1f2937"
              strokeWidth="3"
            />
            <text x="20" y="30" fontSize="12" fill="#16a34a">
              ● Zone de couverture
            </text>
            <text x="20" y="50" fontSize="12" fill="#dc2626">
              ● Distance de réutilisation
            </text>
          </svg>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Caractéristiques</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Rayon de couverture:</span>
                <span className="font-medium">{cellRadius.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span>Distance de réutilisation:</span>
                <span className="font-medium">{reuseDistance.toFixed(2)} km</span>
              </div>
              <div className="flex justify-between">
                <span>Capacité:</span>
                <span className="font-medium">{result.capacity.toFixed(1)} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span>SNR:</span>
                <span className="font-medium">{result.snr_dB.toFixed(1)} dB</span>
              </div>
            </div>
          </div>
          
          {result.cellularCapacity && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Capacité Cellulaire</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Capacité totale:</span>
                  <span className="font-medium">{result.cellularCapacity.toFixed(1)} Mbps</span>
                </div>
                
                {result.frequenciesPerCell+1 && (
                  <div className="flex justify-between">
                    <span>Fréquences/cellule:</span>
                    <span className="font-medium">{result.frequenciesPerCell.toFixed(1)} kHz</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function ResultsPopup({ nodes, edges, closePopup }) {
  const [results, setResults] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('results');
  const [expandedSections, setExpandedSections] = useState({
    charts: true,
    details: false,
  });
  const [selectedResults, setSelectedResults] = useState(new Set());
  const [filters, setFilters] = useState({
    linkType: 'all',
    minCapacity: '',
    maxLatency: ''
  });


  useEffect(() => {
    calculateDimensioning();
  }, []);

  const calculateDimensioning = async () => {
    setLoading(true);
    setError(null);
    
    if (!nodes || !edges || edges.length === 0) {
      setError('Aucun nœud ou liaison configuré.');
      setLoading(false);
      return;
    }
    console.log(nodes);
    console.log(edges);
    try {
      const response = await fetch('https://rts-back-0adn.onrender.com/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(data);
      
      const parsedResults = (data.results || []).map((result) => ({
        edgeId: result.edgeId || 'N/A',
        receivedPower: parseFloat(result.receivedPower) || 0,
        loss: parseFloat(result.loss) || 0,
        capacity: parseFloat(result.capacity) || 0,
        coverage: parseFloat(result.coverage) || 0,
        latency: parseFloat(result.latency) || 0,
        snr_dB: parseFloat(result.snr_dB) || 0,
        bitrate: parseFloat(result.bitrate) || 0,
        margin: parseFloat(result.margin) || 0,
        frequenciesPerCell: parseFloat(result.frequenciesPerCell) || 0,
        reuseDistance: parseFloat(result.reuseDistance) || 0,
        cellularCapacity: parseFloat(result.cellularCapacity) || 0,
        linkType: edges.find(e => e.id === result.edgeId)?.data?.params?.['Type liaison'] || 'Hertzien'
      }));
      
      setResults(parsedResults);
      setTotalCost(parseFloat(data.totalCost) || 0);
      setSuggestions(generateMockSuggestions(parsedResults));
      
    } catch (error) {
      console.error('API Error:', error);
      setError(`Échec du calcul: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateMockSuggestions = (results) => {
    const suggestions = [];
    results.forEach(result => {
      if (result.capacity < 10) {
        suggestions.push({
          type: 'warning',
          suggestion: `Liaison ${result.edgeId}: Capacité faible (${result.capacity.toFixed(1)} Mbps). Considérez augmenter la bande passante.`
        });
      }
      if (result.snr_dB < 10) {
        suggestions.push({
          type: 'error',
          suggestion: `Liaison ${result.edgeId}: SNR critique (${result.snr_dB.toFixed(1)} dB). Vérifiez la puissance d'émission.`
        });
      }
    });
    return suggestions;
  };

  

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredResults = results.filter(result => {
    if (filters.linkType !== 'all' && result.linkType !== filters.linkType) return false;
    if (filters.minCapacity && result.capacity < parseFloat(filters.minCapacity)) return false;
    if (filters.maxLatency && result.latency > parseFloat(filters.maxLatency)) return false;
    return true;
  });

  const getStatusColor = (value, thresholds) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportToCSV = () => {
    const headers = [
      'Liaison ID', 'Type', 'Puissance reçue (dBm)', 'Perte (dB)', 
      'SNR (dB)', 'Capacité (Mbps)', 'Couverture (km)', 'Latence (ms)'
    ];
    
    const rows = filteredResults.map(result => [
      result.edgeId,
      result.linkType,
      result.receivedPower.toFixed(2),
      result.loss.toFixed(2),
      result.snr_dB.toFixed(2),
      result.capacity.toFixed(2),
      result.coverage.toFixed(2),
      result.latency.toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      `Coût total,${totalCost.toFixed(2)} CFA`
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'resultats_dimensionnement.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartDataPowerLoss = {
    labels: filteredResults.map(r => `${r.edgeId} (${r.linkType})`),
    datasets: [
      {
        label: 'Puissance reçue (dBm)',
        data: filteredResults.map(r => r.receivedPower),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.1
      },
      {
        label: 'Perte (dB)',
        data: filteredResults.map(r => -r.loss),
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0.1
      }
    ]
  };

  const chartDataCapacity = {
    labels: filteredResults.map(r => `${r.edgeId}`),
    datasets: [{
      label: 'Capacité (Mbps)',
      data: filteredResults.map(r => r.capacity),
      backgroundColor: filteredResults.map(r => 
        r.capacity >= 50 ? 'rgba(34, 197, 94, 0.8)' :
        r.capacity >= 20 ? 'rgba(251, 191, 36, 0.8)' :
        'rgba(239, 68, 68, 0.8)'
      ),
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  };

  const cellularResults = filteredResults.filter(result => 
    ['GSM', 'UMTS', '4G', '5G'].includes(result.linkType)
  );

  const clusterSizes = {
    'GSM': 7,
    'UMTS': 1,
    '4G': 1,
    '5G': 1
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Résultats du Dimensionnement</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={calculateDimensioning}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>{loading ? 'Calcul...' : 'Recalculer'}</span>
            </button>
            <button
              onClick={closePopup}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  Coût total: <span className="text-green-600">{totalCost.toFixed(2)} CFA</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Wifi className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  Liaisons: <span className="text-blue-600">{results.length}</span>
                </span>
              </div>
              {cellularResults.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Radio className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">
                    Cellulaires: <span className="text-purple-600">{cellularResults.length}</span>
                  </span>
                </div>
              )}
              {suggestions.length > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">
                    Alertes: <span className="text-yellow-600">{suggestions.length}</span>
                  </span>
                </div>
              )}
            </div>
            
            {results.length > 0 && (
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Exporter CSV</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Calcul en cours...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-2">Erreur de calcul</p>
                <p className="text-gray-600 text-sm">{error}</p>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <Wifi className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun résultat disponible</p>
                <p className="text-gray-500 text-sm">Vérifiez la configuration des nœuds et liaisons</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto">
              <div className="border-b bg-white sticky top-0 z-10">
                <div className="flex space-x-1 px-6">
                  {[
                    { id: 'results', label: 'Résultats', icon: BarChart3 },
                    { id: 'cellular', label: 'Cellulaire', icon: Radio },
                    { id: 'charts', label: 'Graphiques', icon: BarChart3 }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'results' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type de liaison
                          </label>
                          <select
                            value={filters.linkType}
                            onChange={(e) => setFilters(prev => ({ ...prev, linkType: e.target.value }))}
                            className="px-3 py-2 border rounded-md text-sm"
                          >
                            <option value="all">Tous</option>
                            <option value="Hertzien">Hertzien</option>
                            <option value="Optique">Optique</option>
                            <option value="RJ45">RJ45</option>
                            <option value="GSM">GSM</option>
                            <option value="UMTS">UMTS</option>
                            <option value="4G">4G</option>
                            <option value="5G">5G</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Capacité min (Mbps)
                          </label>
                          <input
                            type="number"
                            value={filters.minCapacity}
                            onChange={(e) => setFilters(prev => ({ ...prev, minCapacity: e.target.value }))}
                            placeholder="Ex: 10"
                            className="px-3 py-2 border rounded-md text-sm w-24"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latence max (ms)
                          </label>
                          <input
                            type="number"
                            value={filters.maxLatency}
                            onChange={(e) => setFilters(prev => ({ ...prev, maxLatency: e.target.value }))}
                            placeholder="Ex: 100"
                            className="px-3 py-2 border rounded-md text-sm w-24"
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            onClick={() => setFilters({ linkType: 'all', minCapacity: '', maxLatency: '' })}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
                          >
                            Réinitialiser
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Liaison
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Puissance (dBm)
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Perte (dB)
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                SNR (dB)
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Capacité (Mbps)
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Latence (ms)
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                État
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredResults.map((result, index) => (
                              <tr key={result.edgeId} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {result.edgeId}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    result.linkType === 'Optique' ? 'bg-blue-100 text-blue-800' :
                                    result.linkType === 'Hertzien' ? 'bg-green-100 text-green-800' :
                                    result.linkType === 'RJ45' ? 'bg-yellow-100 text-yellow-800' :
                                    ['GSM', 'UMTS', '4G', '5G'].includes(result.linkType) ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {result.linkType}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className={getStatusColor(result.receivedPower, { good: -30, warning: -50 })}>
                                    {result.receivedPower.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className={getStatusColor(-result.loss, { good: -20, warning: -40 })}>
                                    {result.loss.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className={getStatusColor(result.snr_dB, { good: 20, warning: 10 })}>
                                    {result.snr_dB.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className={getStatusColor(result.capacity, { good: 50, warning: 20 })}>
                                    {result.capacity.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <span className={getStatusColor(-result.latency, { good: -50, warning: -100 })}>
                                    {result.latency.toFixed(2)}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  {result.snr_dB >= 20 && result.capacity >= 50 ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Excellent
                                    </span>
                                  ) : result.snr_dB >= 10 && result.capacity >= 20 ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Acceptable
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Critique
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {suggestions.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Suggestions d'amélioration
                        </h3>
                        <div className="space-y-2">
                          {suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                suggestion.type === 'error' ? 'bg-red-500' :
                                suggestion.type === 'warning' ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }`}></div>
                              <p className="text-sm text-gray-700">{suggestion.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'cellular' && (
                  <div className="space-y-6">
                    {cellularResults.length === 0 ? (
                      <div className="text-center py-12">
                        <Radio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Aucune liaison cellulaire détectée</p>
                        <p className="text-gray-500 text-sm">
                          Les liaisons GSM, UMTS, 4G et 5G apparaîtront ici
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white p-6 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Liaisons Cellulaires</p>
                                <p className="text-2xl font-bold text-gray-900">{cellularResults.length}</p>
                              </div>
                              <Radio className="h-8 w-8 text-purple-600" />
                            </div>
                          </div>
                          
                          <div className="bg-white p-6 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Capacité Totale</p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {cellularResults.reduce((sum, r) => sum + r.cellularCapacity, 0).toFixed(1)} Mbps
                                </p>
                              </div>
                              <BarChart3 className="h-8 w-8 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="bg-white p-6 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Distance Réutilisation Moy.</p>
                                <p className="text-2xl font-bold text-gray-900">
                                  {cellularResults.length > 0 ? 
                                    (cellularResults.reduce((sum, r) => sum + (r.reuseDistance || 0), 0) / cellularResults.length).toFixed(1) : 
                                    '0'
                                  } km
                                </p>
                              </div>
                              <Grid3x3 className="h-8 w-8 text-green-600" />
                            </div>
                          </div>
                        </div>

                        {['GSM', 'UMTS', '4G', '5G'].map(tech => {
                          const techResults = cellularResults.filter(r => r.linkType === tech);
                          if (techResults.length === 0) return null;
                          
                          const avgFrequenciesPerCell = techResults.reduce((sum, r) => sum + (r.frequenciesPerCell || 0), 0) / techResults.length;
                          const totalFrequencies = avgFrequenciesPerCell * clusterSizes[tech];
                          
                          return (
                            <div key={tech} className="space-y-6">
                              <CellularCluster 
                                clusterSize={clusterSizes[tech]}
                                frequenciesPerCell={avgFrequenciesPerCell}
                                totalFrequencies={totalFrequencies}
                                linkType={tech}
                              />
                            </div>
                          );
                        })}

                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold text-gray-800">Cellules Individuelles</h3>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {cellularResults.map((result, index) => (
                              <SingleCellView key={result.edgeId} result={result} />
                            ))}
                          </div>
                        </div>

                        <div className="bg-white p-6 border rounded-lg">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                            Comparaison des Technologies Cellulaires
                          </h3>
                          
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Technologie
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Capacité (Mbps)
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Couverture (km)
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Latence (ms)
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    SNR (dB)
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {['GSM', 'UMTS', '4G', '5G'].map(tech => {
                                  const techResults = cellularResults.filter(r => r.linkType === tech);
                                  if (techResults.length === 0) return null;
                                  
                                  const avgCapacity = techResults.reduce((sum, r) => sum + r.capacity, 0) / techResults.length;
                                  const avgCoverage = techResults.reduce((sum, r) => sum + r.coverage, 0) / techResults.length;
                                  const avgLatency = techResults.reduce((sum, r) => sum + r.latency, 0) / techResults.length;
                                  const avgSNR = techResults.reduce((sum, r) => sum + r.snr_dB, 0) / techResults.length;
                                  
                                  return (
                                    <tr key={tech}>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                          {tech}
                                        </span>
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {avgCapacity.toFixed(1)}
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {avgCoverage.toFixed(1)}
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {avgLatency.toFixed(1)}
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {avgSNR.toFixed(1)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'charts' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white p-6 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Zap className="h-5 w-5 text-yellow-600 mr-2" />
                          Puissance et Pertes
                        </h3>
                        <div className="h-64">
                          <Line
                            data={chartDataPowerLoss}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { position: 'top' },
                                title: { display: false }
                              },
                              scales: {
                                y: {
                                  beginAtZero: false,
                                  title: { display: true, text: 'Puissance (dBm)' }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-white p-6 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                          Capacité par Liaison
                        </h3>
                        <div className="h-64">
                          <Bar
                            data={chartDataCapacity}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                title: { display: false }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  title: { display: true, text: 'Capacité (Mbps)' }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-white p-6 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Wifi className="h-5 w-5 text-green-600 mr-2" />
                          SNR vs Capacité
                        </h3>
                        <div className="h-64">
                          <Scatter
                            data={{
                              datasets: [{
                                label: 'Liaisons',
                                data: filteredResults.map(r => ({ x: r.snr_dB, y: r.capacity })),
                                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                                borderColor: 'rgba(59, 130, 246, 1)',
                                borderWidth: 1
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                title: { display: false }
                              },
                              scales: {
                                x: { title: { display: true, text: 'SNR (dB)' }},
                                y: { title: { display: true, text: 'Capacité (Mbps)' }}
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="bg-white p-6 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Clock className="h-5 w-5 text-orange-600 mr-2" />
                          Latence par Type
                        </h3>
                        <div className="h-64">
                          <Bar
                            data={{
                              labels: [...new Set(filteredResults.map(r => r.linkType))],
                              datasets: [{
                                label: 'Latence moyenne (ms)',
                                data: [...new Set(filteredResults.map(r => r.linkType))].map(type => {
                                  const typeResults = filteredResults.filter(r => r.linkType === type);
                                  return typeResults.reduce((sum, r) => sum + r.latency, 0) / typeResults.length;
                                }),
                                backgroundColor: 'rgba(251, 146, 60, 0.6)',
                                borderColor: 'rgba(251, 146, 60, 1)',
                                borderWidth: 1
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                title: { display: false }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  title: { display: true, text: 'Latence (ms)' }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultsPopup;
import React, { useState, useCallback, useRef, useMemo } from 'react';
import ReactFlow, { addEdge, removeElements, ReactFlowProvider, useNodesState, useEdgesState, Controls, Background, MiniMap } from 'react-flow-renderer';
import { Search, Save, Download, Undo, Redo, Grid, Moon, Sun, Play, Settings, Copy, Trash2, ZoomIn, ZoomOut, HelpCircle, Menu, X } from 'lucide-react';
import HelpPopup from './components/HelpPopup';
import Sidebar from './components/Sidebar';
import { equipmentConfig, linkParams } from './config/equipmentsConfig';
import NodeConfigPopup from './components/NodeConfigPopup';
import LinkConfigPopup from './components/LinkConfigPopup';
import ResultsPopup from './components/ResultsPopup';

import './App.css';

const nodeTypes = {};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copiedElements, setCopiedElements] = useState({ nodes: [], edges: [] });
  const [projectName, setProjectName] = useState('Nouveau Projet');
  const [lastSaved, setLastSaved] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const reactFlowWrapper = useRef(null);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);


  // Détection de la taille d'écran
  const [screenSize, setScreenSize] = useState('desktop');
  
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
        setSidebarCollapsed(true);
      } else if (width < 1024) {
        setScreenSize('tablet');
        setSidebarCollapsed(true);
      } else {
        setScreenSize('desktop');
        setSidebarCollapsed(false);
      }
    };const Header = () => (
  <div className={`fixed top-0 left-0 right-0 h-14 sm:h-16 ${darkMode ? 'dark border-gray-700' : 'bg-white border-gray-200'} border-b z-30`}>
    <div className="flex items-center justify-between px-2 sm:px-4 h-full">
      {/* Section gauche */}
      <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
        {/* Menu burger pour mobile */}
        {screenSize === 'mobile' && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}

        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className={`text-base sm:text-lg font-semibold bg-transparent border-none outline-none min-w-0 flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}
          placeholder="Nom du projet"
        />

        {lastSaved && screenSize !== 'mobile' && (
          <span className={`text-sm hidden sm:block ml-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Sauvé {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Section droite */}
      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
        {/* Légende - Desktop uniquement ou popup mobile */}
        {screenSize === 'desktop' && (
          <div className={`py-1 px-3 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-lg flex space-x-4`}>
            <div className="text-sm font-medium">Types de liaisons</div>
            {Object.entries(linkParams).map(([type, config]) => (
              <div key={type} className="flex items-center space-x-2">
                <svg width="20" height="2">
                  <line x1="0" y1="1" x2="20" y2="1" style={config.style} />
                </svg>
                <span className="text-xs">{type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bouton légende pour mobile/tablet */}
        {screenSize !== 'desktop' && (
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
            title="Types de liaisons"
          >
            <Grid size={16} />
          </button>
        )}

        {/* Stats de progression */}
        <div className={`flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {screenSize === 'mobile'
              ? `${nodeStats.configured}/${nodeStats.total}`
              : `${nodeStats.configured}/${nodeStats.total} (${nodeStats.percentage}%)`}
          </div>
          <div className={`w-8 sm:w-16 h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${nodeStats.percentage}%` }}
            />
          </div>
        </div>

        {/* Contrôles principaux */}
        <div className="flex items-center space-x-1">
          {screenSize !== 'mobile' && (
            <>
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'} disabled:opacity-50`}
              >
                <Undo size={16} />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'} disabled:opacity-50`}
              >
                <Redo size={16} />
              </button>
              <button
                onClick={handleLoadProject}
                className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
                title="Charger projet"
              >
                <Download size={16} />
              </button>
              <button
                onClick={saveProject}
                className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
                title="Sauvegarder projet"
              >
                <Save size={16} />
              </button>
            </>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setShowHelp(true)}
            className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>
    </div>

    {/* Menu mobile déroulant */}
    {screenSize === 'mobile' && mobileMenuOpen && (
      <div className={`absolute top-full left-0 right-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t shadow-lg`}>
        <div className="p-4 space-y-3">
          <div className="flex space-x-2">
            <button
              onClick={handleLoadProject}
              className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
            >
              <Download size={18} />
              <span>Charger</span>
            </button>
            <button
              onClick={saveProject}
              className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
            >
              <Save size={18} />
              <span>Sauver</span>
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} disabled:opacity-50`}
            >
              <Undo size={18} />
              <span>Annuler</span>
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} disabled:opacity-50`}
            >
              <Redo size={18} />
              <span>Refaire</span>
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Référence pour l'input file
  const fileInputRef = useRef(null);
  
  const [showHelp, setShowHelp] = useState(false);

  // Ajouter ce useEffect après les autres useEffect
  React.useEffect(() => {
    const hasSeenHelp = localStorage.getItem('networkDesign_hasSeenHelp');
    if (!hasSeenHelp && screenSize === 'desktop') {
      // Délai de 1 seconde avant d'afficher l'aide (seulement sur desktop)
      const timer = setTimeout(() => {
        setShowHelp(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [screenSize]);

  // Sauvegarde automatique
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (nodes.length > 0 || edges.length > 0) {
        const projectData = { nodes, edges, projectName, timestamp: Date.now() };
        localStorage.setItem('networkDesign_autosave', JSON.stringify(projectData));
        setLastSaved(new Date());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [nodes, edges, projectName]);

  // Gestion de l'historique
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Raccourcis clavier (désactivés sur mobile)
  React.useEffect(() => {
    if (screenSize === 'mobile') return;
    
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
            break;
          case 'c':
            if (selectedNodes.length > 0) {
              e.preventDefault();
              copySelected();
            }
            break;
          case 'v':
            e.preventDefault();
            pasteElements();
            break;
          case 's':
            e.preventDefault();
            saveProject();
            break;
          case 'o':
            e.preventDefault();
            handleLoadProject();
            break;
          default:
            break;
        }
      }
      if (e.key === 'Delete' && selectedNodes.length > 0) {
        deleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedNodes, undo, redo, screenSize]);

  const onAddNode = useCallback((equipment, network) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: equipment,
      data: {
        label: equipment,
        network,
        params: {},
        configured: false,
        status: 'unconfigured',
      },
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      draggable: true,
    };
    setNodes((nds) => [...nds, newNode]);
    saveToHistory();
    
    // Fermer le menu mobile après ajout
    if (screenSize === 'mobile') {
      setMobileMenuOpen(false);
    }
  }, [setNodes, saveToHistory, screenSize]);

  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      id: `edge_${Date.now()}`,
      data: { params: { 'Type liaison': '' } },
      style: { stroke: '#6b7280', strokeWidth: 2 } 
    };
    setEdges((eds) => addEdge(newEdge, eds));
    setPendingConnection(params);
    saveToHistory();
  }, [setEdges, saveToHistory]);

  const onNodeClick = useCallback((event, node) => {
    if (event.ctrlKey && screenSize !== 'mobile') {
      setSelectedNodes(prev => 
        prev.includes(node.id) 
          ? prev.filter(id => id !== node.id)
          : [...prev, node.id]
      );
    } else {
      setSelectedNode(node);
      setSelectedNodes([node.id]);
    }
  }, [screenSize]);

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
  }, []);

  const copySelected = useCallback(() => {
    const selectedNodeObjs = nodes.filter(n => selectedNodes.includes(n.id));
    const selectedEdgeObjs = edges.filter(e => 
      selectedNodes.includes(e.source) && selectedNodes.includes(e.target)
    );
    setCopiedElements({ nodes: selectedNodeObjs, edges: selectedEdgeObjs });
  }, [nodes, edges, selectedNodes]);

  const pasteElements = useCallback(() => {
    if (copiedElements.nodes.length === 0) return;
    
    const newNodes = copiedElements.nodes.map(node => ({
      ...node,
      id: `node_${Date.now()}_${Math.random()}`,
      position: { x: node.position.x + 50, y: node.position.y + 50 }
    }));
    
    const newEdges = copiedElements.edges.map(edge => ({
      ...edge,
      id: `edge_${Date.now()}_${Math.random()}`,
      source: newNodes.find(n => n.data.label === nodes.find(on => on.id === edge.source)?.data.label)?.id,
      target: newNodes.find(n => n.data.label === nodes.find(on => on.id === edge.target)?.data.label)?.id,
      style: edge.style,
    }));

    setNodes(nds => [...nds, ...newNodes]);
    setEdges(eds => [...eds, ...newEdges]);
    saveToHistory();
  }, [copiedElements, nodes, setNodes, setEdges, saveToHistory]);

  const deleteSelected = useCallback(() => {
    setNodes(nds => nds.filter(n => !selectedNodes.includes(n.id)));
    setEdges(eds => eds.filter(e => 
      !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)
    ));
    setSelectedNodes([]);
    saveToHistory();
  }, [selectedNodes, setNodes, setEdges, saveToHistory]);

  const saveProject = useCallback(() => {
    const projectData = { nodes, edges, projectName, timestamp: Date.now() };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLastSaved(new Date());
  }, [nodes, edges, projectName]);

  const handleLoadProject = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const loadProject = useCallback((event) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Veuillez sélectionner un fichier JSON valide');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        
        if (typeof result !== 'string') {
          throw new Error('Format de fichier invalide');
        }

        const projectData = JSON.parse(result);
        
        if (!projectData || typeof projectData !== 'object') {
          throw new Error('Structure de fichier invalide');
        }

        setNodes(Array.isArray(projectData.nodes) ? projectData.nodes : []);
        setEdges(Array.isArray(projectData.edges) ? projectData.edges : []);
        setProjectName(projectData.projectName || 'Projet Chargé');
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        saveToHistory();
        alert('Projet chargé avec succès !');
        
      } catch (error) {
        alert(`Erreur lors du chargement du fichier: ${error.message}`);
      }
    };

    reader.onerror = () => {
      alert('Erreur lors de la lecture du fichier');
    };

    reader.readAsText(file);
  }, [setNodes, setEdges, saveToHistory]);

  const nodeStats = useMemo(() => {
    const configured = nodes.filter(n => n.data.configured).length;
    const total = nodes.length;
    return { configured, total, percentage: total > 0 ? (configured / total * 100).toFixed(1) : 0 };
  }, [nodes]);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const equipment = event.dataTransfer.getData('text/plain');
    const network = Object.keys(equipmentConfig).find(net =>
      equipmentConfig[net].equipments.some(eq => eq.type === equipment)
    );
    if (reactFlowWrapper.current && equipment && network) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
      const newNode = {
        id: `node_${Date.now()}`,
        type: equipment,
        data: { label: equipment, network, params: {}, configured: false, status: 'unconfigured' },
        position,
        draggable: true,
      };
      setNodes((nds) => [...nds, newNode]);
      saveToHistory();
    }
  }, [setNodes, saveToHistory]);

  const saveEdgeConfig = useCallback((edgeId, config) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          const linkType = config.params['Type liaison'] || 'GSM';
          return {
            ...edge,
            data: { ...edge.data, params: config.params },
            style: linkParams[linkType]?.style || { stroke: '#6b7280', strokeWidth: 2 }
          };
        }
        return edge;
      })
    );
    saveToHistory();
  }, [setEdges, saveToHistory]);

 // Composant Header responsive
const Header = () => (
  <div className={`fixed top-0 left-0 right-0 h-14 sm:h-16 ${darkMode ? 'dark border-gray-700' : 'bg-white border-gray-200'} border-b z-50`}>
    <div className="flex items-center justify-between px-2 sm:px-4 h-full">
      
      {/* Section gauche */}
      <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
        {screenSize === 'mobile' && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className={`text-base sm:text-lg font-semibold bg-transparent border-none outline-none min-w-0 flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}
          placeholder="Nom du projet"
        />
        {lastSaved && screenSize !== 'mobile' && (
          <span className={`text-xs hidden sm:block  ml-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Sauvé {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Section droite */}
      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 relative">
        
        {/* ✅ Version desktop visible directement */}
        {screenSize !== 'mobile' && (
          <>
            {/* Légende */}
            {screenSize === 'desktop' && (
              <div className={`py-1 px-3 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-lg flex space-x-4`}>
                <div className="text-sm font-medium">Types de liaisons</div>
                {Object.entries(linkParams).map(([type, config]) => (
                  <div key={type} className="flex items-center space-x-2">
                    <svg width="20" height="2">
                      <line x1="0" y1="1" x2="20" y2="1" style={config.style} />
                    </svg>
                    <span className="text-xs">{type}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Progression */}
            <div className={`flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {`${nodeStats.configured}/${nodeStats.total} (${nodeStats.percentage}%)`}
              </div>
              <div className={`w-8 sm:w-16 h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${nodeStats.percentage}%` }}
                />
              </div>
            </div>

            {/* Boutons de contrôle */}
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'} disabled:opacity-50`}
            >
              <Undo size={16} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'} disabled:opacity-50`}
            >
              <Redo size={16} />
            </button>
            <button
              onClick={handleLoadProject}
              className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
              title="Charger projet"
            >
              <Download size={16} />
            </button>
            <button
              onClick={saveProject}
              className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
              title="Sauvegarder projet"
            >
              <Save size={16} />
            </button>
          </>
        )}

        {/* ✅ Version mobile = menu Settings */}
        {screenSize === 'mobile' && (
          <div className="relative">
            <button
              onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
              className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
              title="Outils"
            >
              <Settings size={16} />
            </button>

            {toolsMenuOpen && (
              <div className={`absolute right-0 top-full mt-2 w-64 z-50 border rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col py-2 px-2 space-y-2">
                  {/* Charger / Sauver */}
                  <div className="flex gap-2">
                    <button onClick={handleLoadProject} className="flex-1 p-2 rounded bg-gray-100 text-sm">
                      <Download size={14} className="inline mr-1" /> Charger
                    </button>
                    <button onClick={saveProject} className="flex-1 p-2 rounded bg-gray-100 text-sm">
                      <Save size={14} className="inline mr-1" /> Sauver
                    </button>
                  </div>

                  {/* Undo / Redo */}
                  <div className="flex gap-2">
                    <button onClick={undo} disabled={historyIndex <= 0} className="flex-1 p-2 rounded bg-gray-100 text-sm disabled:opacity-50">
                      <Undo size={14} className="inline mr-1" /> Annuler
                    </button>
                    <button onClick={redo} disabled={historyIndex >= history.length - 1} className="flex-1 p-2 rounded bg-gray-100 text-sm disabled:opacity-50">
                      <Redo size={14} className="inline mr-1" /> Refaire
                    </button>
                  </div>

                  {/* Types de liaisons */}
                  <div className="py-1 px-2 text-xs font-medium">
                    <div className="mb-1 text-gray-500">Types de liaisons :</div>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(linkParams).map(([type, config]) => (
                        <div key={type} className="flex items-center space-x-1">
                          <svg width="20" height="2">
                            <line x1="0" y1="1" x2="20" y2="1" style={config.style} />
                          </svg>
                          <span className="text-[11px]">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progression */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span>{nodeStats.configured}/{nodeStats.total}</span>
                    <div className="w-full h-2 bg-gray-300 rounded-full">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${nodeStats.percentage}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dark mode + aide */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={() => setShowHelp(true)}
          className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
        >
          <HelpCircle size={16} />
        </button>
      </div>
    </div>
  </div>
);



  return (
    <ReactFlowProvider>
      <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <Header />

        {/* Sidebar */}
        <div className={`mt-14 sm:mt-16 transition-all duration-300 ${
          screenSize === 'mobile' 
            ? `${mobileMenuOpen ? 'block' : 'hidden'} absolute z-20 inset-y-0 left-0` 
            : 'block'
        }`}>
          <Sidebar 
            onAddNode={onAddNode} 
            collapsed={sidebarCollapsed && screenSize !== 'mobile'}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            darkMode={darkMode}
            screenSize={screenSize}
          />
        </div>


        {/* Overlay pour fermer le menu mobile */}
        {mobileMenuOpen && screenSize === 'mobile' && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10 mt-14"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Canvas principal */}
        <div className="flex-1 mt-14 sm:mt-16 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid={gridEnabled}
            snapGrid={[20, 20]}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            onDrop={onDrop}
            className={darkMode ? 'dark' : ''}
          >
            <Controls 
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              showZoom={screenSize !== 'mobile'}
              showFitView={true}
              showInteractive={screenSize !== 'mobile'}
            />
            <Background 
              variant={gridEnabled ? "dots" : "lines"}
              gap={20}
              color={darkMode ? "#374151" : "#d1d5db"}
            />
            
            {/* MiniMap - Caché sur mobile */}
            {screenSize !== 'mobile' && (
              <MiniMap 
                className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-lg fixed top-16 right-4 opacity-80`}
                nodeColor={darkMode ? '#6b7280' : '#9ca3af'}
              />
            )}
          </ReactFlow>

          {/* Légende flottante pour mobile/tablet */}
          {showLegend && screenSize !== 'desktop' && (
            <div className={`fixed top-20 right-4 left-4 sm:left-auto sm:w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 shadow-lg z-20`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Types de liaisons</h3>
                <button
                  onClick={() => setShowLegend(false)}
                  className={`p-1 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(linkParams).map(([type, config]) => (
                  <div key={type} className="flex items-center space-x-3">
                    <svg width="30" height="2">
                      <line x1="0" y1="1" x2="30" y2="1" style={config.style} />
                    </svg>
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Barre d'outils flottante */}
          <div className={`fixed shadow-xl shadow-red-500/50  rounded ${screenSize === 'mobile' ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-20`}>
            <div className={`flex  ${screenSize === 'mobile' ? 'flex-row justify-center space-x-2' : 'flex-col space-y-2'} ${darkMode ? 'dark border-gray-700' : ' border-gray-200'} border rounded-lg p-2 shadow-lg`}>
              <button
                onClick={() => setShowResults(true)}
                className={`flex items-center justify-center space-x-2 px-4 py-2 bg-red-500  text-white rounded-full hover:bg-white hover:text-red-500 transition-colors ${screenSize === 'mobile' ? 'flex-1' : ''}`}
              >
                <Play size={18} />
                {screenSize !== 'mobile' && <span >Calculer</span>}
              </button>
              
              {selectedNodes.length > 0 && (
                <div className={`flex ${screenSize === 'mobile' ? 'space-x-2' : 'flex-col space-y-2'}`}>
                  <button
                    onClick={copySelected}
                    className={`flex items-center justify-center space-x-2 p-2 rounded-full hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'} ${screenSize === 'mobile' ? 'flex-1' : ''}`}
                  >
                    <Copy size={18} />
                    {screenSize !== 'mobile' && <span>Copier</span>}
                  </button>
                  <button
                    onClick={deleteSelected}
                    className={`flex items-center justify-center space-x-2 p-2 rounded hover:bg-red-100 text-red-600 hover:text-red-700 ${screenSize === 'mobile' ? 'flex-1' : ''}`}
                  >
                    <Trash2 size={18} />
                    {screenSize !== 'mobile' && <span>Supprimer</span>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Indicateur de sélection multiple */}
          {selectedNodes.length > 1 && (
            <div className={`fixed ${screenSize === 'mobile' ? 'top-16 left-4 right-4' : 'top-20 right-6'} px-3 py-2 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border rounded-lg shadow-lg z-20`}>
              {selectedNodes.length} éléments sélectionnés
            </div>
          )}
        </div>

        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={loadProject}
          className="hidden"
          id="load-project-input"
        />

        {/* Popups */}
        {selectedNode && (
          <NodeConfigPopup
            node={selectedNode}
            saveConfig={(nodeId, config) => {
              setNodes(nds =>
                nds.map(node =>
                  node.id === nodeId 
                    ? { ...node, data: { ...node.data, ...config, configured: true, status: 'configured' } }
                    : node
                )
              );
              setSelectedNode(null);
              saveToHistory();
            }}
            closePopup={() => setSelectedNode(null)}
            deleteNode={(nodeId) => {
              setNodes(nds => nds.filter(n => n.id !== nodeId));
              setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
              setSelectedNode(null);
              saveToHistory();
            }}
            darkMode={darkMode}
            screenSize={screenSize}
          />
        )}

        {(pendingConnection || selectedEdge) && (
          <LinkConfigPopup
            sourceNode={pendingConnection ? nodes.find(n => n.id === pendingConnection.source) : nodes.find(n => n.id === selectedEdge.source)}
            targetNode={pendingConnection ? nodes.find(n => n.id === pendingConnection.target) : nodes.find(n => n.id === selectedEdge.target)}
            edge={selectedEdge || pendingConnection}
            saveConfig={(edgeId, config) => {
                const actualConfig = config || edgeId;
                const actualEdgeId = config ? edgeId : selectedEdge?.id;
                          
                if (pendingConnection) {
                  const linkType = actualConfig.params['Type liaison'] || 'GSM';
                  const newEdge = {
                    ...pendingConnection,
                    id: `edge_${Date.now()}`,
                    data: { params: actualConfig.params },
                    style: linkParams[linkType]?.style || { stroke: '#000', strokeWidth: 1 },
                  };
                  setEdges(eds => addEdge(newEdge, eds));
                  setPendingConnection(null);
                } else if (selectedEdge) {
                  const linkType = actualConfig.params['Type liaison'] || 'GSM';
                  setEdges(eds =>
                    eds.map(e =>
                      e.id === actualEdgeId
                        ? {
                            ...e,
                            data: { params: actualConfig.params },
                            style: linkParams[linkType]?.style || { stroke: '#000', strokeWidth: 1 },
                          }
                        : e
                    )
                  );
                  setSelectedEdge(null);
                }
                saveToHistory();
              }}
            closePopup={() => {
              setSelectedEdge(null);
              setPendingConnection(null);
            }}
            deleteEdge={(edgeId) => {
              setEdges(eds => eds.filter(e => e.id !== edgeId));
              setSelectedEdge(null);
              setPendingConnection(null);
              saveToHistory();
            }}
            updateEdgeConnection={(edgeId, newSource, newTarget) => {
              setEdges(eds =>
                eds.map(e =>
                  e.id === edgeId
                    ? { ...e, source: newSource, target: newTarget, id: `edge_${Date.now()}` }
                    : e
                )
              );
              setSelectedEdge(null);
              saveToHistory();
            }}
            edges={edges}
            pendingConnection={pendingConnection}
            selectedEdge={selectedEdge}
            darkMode={darkMode}
            screenSize={screenSize}
          />
        )}

        {showResults && (
          <ResultsPopup
            nodes={nodes}
            edges={edges}
            closePopup={() => setShowResults(false)}
            darkMode={darkMode}
            screenSize={screenSize}
          />
        )}

        {showHelp && (
          <HelpPopup
            isOpen={showHelp}
            onClose={() => {
              setShowHelp(false);
              localStorage.setItem('networkDesign_hasSeenHelp', 'true');
            }}
            darkMode={darkMode}
            screenSize={screenSize}
          />
        )}
      </div>
    </ReactFlowProvider>
  );
}

export default App;
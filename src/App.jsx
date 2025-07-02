import React, { useState, useCallback, useRef, useMemo } from 'react';
import ReactFlow, { addEdge, removeElements, ReactFlowProvider, useNodesState, useEdgesState, Controls, Background, MiniMap } from 'react-flow-renderer';
import { Search, Save, Download, Undo, Redo, Grid, Moon, Sun, Play, Settings, Copy, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
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
  const reactFlowWrapper = useRef(null);

  // Sauvegarde automatique
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (nodes.length > 0 || edges.length > 0) {
        const projectData = { nodes, edges, projectName, timestamp: Date.now() };
        localStorage.setItem('networkDesign_autosave', JSON.stringify(projectData));
        setLastSaved(new Date());
      }
    }, 30000); // Auto-save toutes les 30 secondes
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

  // Raccourcis clavier
  React.useEffect(() => {
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
  }, [selectedNodes, undo, redo]);

  const onAddNode = useCallback((equipment, network) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: equipment,
      data: {
        label: equipment,
        network, // Ex. : 'GSM (2G)'
        params: {},
        configured: false,
        status: 'unconfigured',
      },
      position: { x: Math.random() * 300, y: Math.random() * 300 },
      draggable: true,
    };
    setNodes((nds) => [...nds, newNode]);
    saveToHistory();
  }, [setNodes, saveToHistory]);

  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      id: `edge_${Date.now()}`,
      data: { params: { 'Type liaison': '' } },
      style: linkParams['GSM']?.style || { stroke: '#000', strokeWidth: 1 }, // Style par défaut
    };
    setEdges((eds) => addEdge(newEdge, eds));
    setPendingConnection(params);
    saveToHistory();
  }, [setEdges, saveToHistory]);

  const onNodeClick = useCallback((event, node) => {
    if (event.ctrlKey) {
      setSelectedNodes(prev => 
        prev.includes(node.id) 
          ? prev.filter(id => id !== node.id)
          : [...prev, node.id]
      );
    } else {
      setSelectedNode(node);
      setSelectedNodes([node.id]);
    }
  }, []);

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
      style: edge.style, // Conserver le style de l'arête copiée
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

  const loadProject = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target.result);
          setNodes(projectData.nodes || []);
          setEdges(projectData.edges || []);
          setProjectName(projectData.projectName || 'Projet Chargé');
          saveToHistory();
        } catch (error) {
          alert('Erreur lors du chargement du fichier');
        }
      };
      reader.readAsText(file);
    }
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
            style: linkParams[linkType]?.style || { stroke: '#000', strokeWidth: 1 },
          };
        }
        return edge;
      })
    );
    saveToHistory();
  }, [setEdges, saveToHistory]);

  return (
    <ReactFlowProvider>
      <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`fixed top-0 left-0 right-0 h-16 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b z-30 flex items-center justify-between px-4`}>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={`text-lg font-semibold bg-transparent border-none outline-none ${darkMode ? 'text-white' : 'text-gray-900'}`}
            />
            {lastSaved && (
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Sauvé à {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {nodeStats.configured}/{nodeStats.total} configurés ({nodeStats.percentage}%)
              </div>
              <div className={`w-16 h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${nodeStats.percentage}%` }}
                />
              </div>
            </div>
            
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'} disabled:opacity-50`}
            >
              <Undo size={18} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'} disabled:opacity-50`}
            >
              <Redo size={18} />
            </button>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <button
              onClick={() => setGridEnabled(!gridEnabled)}
              className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'} ${gridEnabled ? 'bg-blue-100 text-blue-600' : ''}`}
            >
              <Grid size={18} />
            </button>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <div className="h-6 w-px bg-gray-300" />
            
            <label className={`p-2 rounded hover:bg-gray-200 cursor-pointer ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}>
              <Download size={18} />
              <input type="file" accept=".json" onChange={loadProject} className="hidden" />
            </label>
            
            <button
              onClick={saveProject}
              className={`p-2 rounded hover:bg-gray-200 ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
            >
              <Save size={18} />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className={`mt-14 transition-all duration-300 `}>
          <Sidebar 
            onAddNode={onAddNode} 
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            darkMode={darkMode}
          />
        </div>

        {/* Canvas principal */}
        <div className="flex-1 mt-16 relative" ref={reactFlowWrapper}>
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
            />
            <Background 
              variant={gridEnabled ? "dots" : "lines"}
              gap={20}
              color={darkMode ? "#374151" : "#d1d5db"}
            />
            <MiniMap 
              className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-lg fixed top-16 right-4 opacity-100`}
              nodeColor={darkMode ? '#6b7280' : '#9ca3af'}
            />
          </ReactFlow>

          {/* Barre d'outils flottante */}
          <div className={`fixed bottom-6 right-6 flex flex-col space-y-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-2 shadow-lg z-20`}>
            <button
              onClick={() => setShowResults(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Play size={18} />
              <span>Calculer</span>
            </button>
            
            {selectedNodes.length > 0 && (
              <>
                <button
                  onClick={copySelected}
                  className={`p-2 rounded hover:bg-gray-100 flex space-x-2 justify-start items-center ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'text-gray-600'}`}
                >
                  <Copy size={18} />
                  <span>Copier</span>
                </button>
                <button
                  onClick={deleteSelected}
                  className="p-2 rounded hover:bg-red-100 text-red-600 flex hover:text-red-700 space-x-2 justify-start items-center"
                >
                  <Trash2 size={18} />
                  <span>Supprimer</span>
                </button>
              </>
            )}
          </div>

          {/* Indicateur de sélection multiple */}
          {selectedNodes.length > 1 && (
            <div className={`fixed top-20 right-6 px-3 py-2 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border rounded-lg shadow-lg`}>
              {selectedNodes.length} éléments sélectionnés
            </div>
          )}
        </div>

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
          />
        )}

        {(pendingConnection || selectedEdge) && (
          <LinkConfigPopup
            sourceNode={pendingConnection ? nodes.find(n => n.id === pendingConnection.source) : nodes.find(n => n.id === selectedEdge.source)}
            targetNode={pendingConnection ? nodes.find(n => n.id === pendingConnection.target) : nodes.find(n => n.id === selectedEdge.target)}
            edge={selectedEdge || pendingConnection}
            saveConfig={(edgeId, config) => {
                // Si config est undefined, c'est que edgeId contient en fait l'objet config
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
          />
        )}

        {showResults && (
          <ResultsPopup
            nodes={nodes}
            edges={edges}
            closePopup={() => setShowResults(false)}
            darkMode={darkMode}
          />
        )}
      </div>
    </ReactFlowProvider>
  );
}

export default App;
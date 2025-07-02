import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, Wifi, Router, Antenna, Server, Cpu, Shield, Database, Network, Radio, Zap, Eye, Settings, Menu, X } from 'lucide-react';
import { equipmentConfig } from '../config/equipmentsConfig';

// Icônes pour équipements spécifiques
const getEquipmentIcon = (equipment) => {
  const iconMap = {
  'Routeur': <Router className="w-4 h-4 text-blue-600 dark:text-white" />,
  'Switch': <Network className="w-4 h-4 text-green-600 dark:text-white" />,
  'Firewall': <Shield className="w-4 h-4 text-red-600 dark:text-white" />,
  'Serveur DHCP': <Server className="w-4 h-4 text-purple-600 dark:text-white" />,
  'Serveur DNS': <Database className="w-4 h-4 text-indigo-600 dark:text-white" />,
  'Load Balancer': <Cpu className="w-4 h-4 text-orange-600 dark:text-white" />,
  'BTS': <Antenna className="w-4 h-4 text-blue-500 dark:text-white" />,
  'NodeB': <Antenna className="w-4 h-4 text-green-500 dark:text-white" />,
  'eNodeB': <Antenna className="w-4 h-4 text-purple-500 dark:text-white" />,
  'gNodeB': <Radio className="w-4 h-4 text-pink-500 dark:text-white" />,
  'Wi-Fi AP': <Wifi className="w-4 h-4 text-cyan-600 dark:text-white" />,
  'Fibre Optique': <Zap className="w-4 h-4 text-yellow-600 dark:text-white" />,
  'Antenne GSM': <Antenna className="w-4 h-4 text-blue-400 dark:text-white" />,
  'Antenne UMTS': <Antenna className="w-4 h-4 text-green-400 dark:text-white" />,
  'Antenne LTE': <Antenna className="w-4 h-4 text-purple-400 dark:text-white" />,
  'Antenne Massive MIMO': <Radio className="w-4 h-4 text-pink-400 dark:text-white" />,
  'Small Cell': <Radio className="w-4 h-4 text-teal-500 dark:text-white" />,
  'Modem': <Router className="w-4 h-4 text-blue-500 dark:text-white" />,
  'Onduleur (UPS)': <Zap className="w-4 h-4 text-yellow-500 dark:text-white" />,
  'Générateur': <Zap className="w-4 h-4 text-red-500 dark:text-white" />,
};

  return iconMap[equipment] || <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
};

// Icônes pour les catégories de réseau
const getNetworkIcon = (network) => {
  const iconMap = {
    'GSM (2G)': <Antenna className="w-4 h-4  dark:text-blue-600" />,
    'UMTS (3G)': <Network className="w-4 h-4  dark:text-blue-600" />,
    '4G (LTE)': <Wifi className="w-4 h-4  dark:text-blue-600" />,
    '5G (NR)': <Radio className="w-4 h-4  dark:text-blue-600" />,
    'Réseaux IP': <Router className="w-4 h-4  dark:text-blue-600" />,
    'Liaisons Hertziennes': <Antenna className="w-4 h-4  dark:text-blue-600" />,
    'Liaisons Optiques': <Zap className="w-4 h-4  dark:text-blue-600" />,
    'Équipements CPE': <Wifi className="w-4 h-4  dark:text-blue-600" />,
    'Répéteurs/Amplificateurs': <Settings className="w-4 h-4  dark:text-blue-600" />,
  };
  return iconMap[network] || <Settings className="w-4 h-4" />;
};

function Sidebar({ onAddNode, darkMode }) {
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredEquipment, setHoveredEquipment] = useState(null);
  const [hoveredNetwork, setHoveredNetwork] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Fermer la sidebar mobile quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isMobileOpen && !event.target.closest('.sidebar-container')) {
        setIsMobileOpen(false);
      }
    };

    if (isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, isMobileOpen]);

  // Filtrage des équipements par terme de recherche
  const filteredNetworks = useMemo(() => {
    if (!searchTerm) return equipmentConfig;

    const filtered = {};
    Object.entries(equipmentConfig).forEach(([network, data]) => {
      const matchingEquipments = data.equipments.filter(equipment =>
        equipment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        network.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (matchingEquipments.length > 0) {
        filtered[network] = {
          ...data,
          equipments: matchingEquipments,
        };
      }
    });

    return filtered;
  }, [searchTerm]);

  const handleDragStart = (event, equipment, network) => {
    event.dataTransfer.setData('text/plain', equipment);
    event.dataTransfer.effectAllowed = 'move';
  };

  const getNetworkCount = (network) => {
    return filteredNetworks[network]?.equipments?.length || 0;
  };

  const handleEquipmentClick = (equipmentType, network) => {
    onAddNode(equipmentType, network);
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  // Toggle button pour mobile
  const MobileToggleButton = () => (
    <button
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 text-white hover:bg-gray-700' 
          : 'bg-white text-gray-800 hover:bg-gray-100'
      } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
    >
      {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  );

  // Toggle button pour desktop
  const DesktopToggleButton = () => (
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={`hidden md:flex absolute -right-3 top-6 z-10 p-1.5 rounded-full shadow-md transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 text-white hover:bg-gray-700 border-gray-600' 
          : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
      } border`}
    >
      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
    </button>
  );

  // Contenu de la sidebar
  const SidebarContent = () => (
    <div className={`flex flex-col h-full ${
      darkMode 
        ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
        : 'bg-gradient-to-b from-gray-50 to-gray-100'
    } ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-r`}>
      {/* Header */}
      <div className={`p-4 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b shadow-sm`}>
        {!isCollapsed && (
          <>
            <h2 className={`text-xl font-bold mb-3 flex items-center gap-2 ${
              darkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              <Network className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {(!isMobile || isMobileOpen) && "Équipements Réseau"}
            </h2>

            {/* Barre de recherche */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Rechercher un équipement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </>
        )}
      </div>

      {/* Liste des équipements */}
      <div className="flex-1 overflow-y-auto p-2">
        {!isCollapsed ? (
          // Mode étendu
          <>
            {Object.entries(filteredNetworks).map(([network, data]) => (
              <div key={network} className="mb-2">
                <button
                  onClick={() => setSelectedNetwork(selectedNetwork === network ? null : network)}
                  onMouseEnter={() => setHoveredNetwork(network)}
                  onMouseLeave={() => setHoveredNetwork(null)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 flex items-center justify-between group ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-blue-500 hover:bg-gray-700' 
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  } hover:shadow-md`}
                >
                  <div className="flex items-center gap-3">
                    {getNetworkIcon(network)}
                    <span className={`font-medium transition-colors ${
                      darkMode 
                        ? 'text-gray-200 group-hover:text-blue-300' 
                        : 'text-gray-700 group-hover:text-blue-700'
                    }`}>
                      {network}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      darkMode 
                        ? 'bg-blue-900 text-blue-200' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getNetworkCount(network)}
                    </span>
                  </div>
                  {selectedNetwork === network ? 
                    <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} /> : 
                    <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  }
                </button>

                {selectedNetwork === network && (
                  <div className="mt-2 ml-4 space-y-1">
                    {data.equipments.map((equipment) => (
                      <div
                        key={equipment.type}
                        className="relative"
                        onMouseEnter={() => setHoveredEquipment(equipment.type)}
                        onMouseLeave={() => setHoveredEquipment(null)}
                      >
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, equipment.type, network)}
                          onClick={() => handleEquipmentClick(equipment.type, network)}
                          className={`cursor-pointer p-3 rounded-lg border border-transparent transition-all duration-200 flex items-center gap-3 group ${
                            darkMode 
                              ? 'bg-gray-700 hover:bg-gray-600 hover:border-blue-500' 
                              : 'bg-gray-50 hover:bg-blue-50 hover:border-blue-200'
                          }`}
                        >
                          {getEquipmentIcon(equipment.type)}
                          <span className={`text-sm font-medium transition-colors ${
                            darkMode 
                              ? 'text-gray-200 group-hover:text-blue-300' 
                              : 'text-gray-700 group-hover:text-blue-700'
                          }`}>
                            {equipment.type}
                          </span>
                          <Eye className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto ${
                            darkMode ? 'text-gray-400' : 'text-gray-400'
                          }`} />
                        </div>

                        {/* Tooltip avec prévisualisation des paramètres */}
                        {hoveredEquipment === equipment.type && equipment.params && (
                          <div className={`absolute left-full ml-2 top-0 z-50 border rounded-lg shadow-lg p-3 w-64 ${
                            darkMode 
                              ? 'bg-gray-800 border-gray-600' 
                              : 'bg-white border-gray-200'
                          }`}>
                            <div className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                              darkMode ? 'text-gray-100' : 'text-gray-800'
                            }`}>
                              {getEquipmentIcon(equipment.type)}
                              {equipment.type}
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className={`font-medium mb-1 ${
                                darkMode ? 'text-gray-200' : 'text-gray-700'
                              }`}>
                                Paramètres configurables :
                              </div>
                              {equipment.params.map((param, idx) => (
                                <div key={idx} className={`flex items-center gap-1 ${
                                  darkMode ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                  {param}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {Object.keys(filteredNetworks).length === 0 && searchTerm && (
              <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Search className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className="text-sm">Aucun équipement trouvé pour "{searchTerm}"</p>
              </div>
            )}
          </>
        ) : (
          // Mode rétracté - Icônes seulement
          <div className="space-y-2">
            {Object.entries(filteredNetworks).map(([network, data]) => (
              <div key={network} className="relative group">
                <button
                  onClick={() => setSelectedNetwork(selectedNetwork === network ? null : network)}
                  className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-blue-500 hover:bg-gray-700' 
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  } hover:shadow-md`}
                >
                  {getNetworkIcon(network)}
                </button>
                
                {/* Tooltip pour mode rétracté */}
                <div className={`absolute left-full ml-2 top-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border rounded-lg shadow-lg p-2 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200 text-gray-800'
                } whitespace-nowrap`}>
                  <div className="text-sm font-medium">{network}</div>
                  <div className="text-xs text-gray-500">{getNetworkCount(network)} équipements</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer avec statistiques */}
      {!isCollapsed && (
        <div className={`p-3 border-t text-xs ${
          darkMode 
            ? 'bg-gray-800 border-gray-700 text-gray-400' 
            : 'bg-white border-gray-200 text-gray-500'
        }`}>
          <div className="flex justify-between">
            <span>Total: {Object.values(filteredNetworks).reduce((acc, data) => acc + data.equipments.length, 0)} équipements</span>
            <span>{Object.keys(filteredNetworks).length} catégories</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Bouton toggle mobile */}
      <MobileToggleButton />

      {/* Overlay pour mobile */}
      {isMobile && isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />
      )}

      {/* Sidebar */}
      <div className={`sidebar-container relative transition-all duration-300 ease-in-out ${
        isMobile
          ? `fixed top-0 left-0 z-40 h-full ${
              isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            } w-80`
          : `h-full ${isCollapsed ? 'w-16' : 'w-80'}`
      }`}>
        <SidebarContent />
        
        {/* Bouton toggle desktop */}
        <DesktopToggleButton />
      </div>
    </>
  );
}

export default Sidebar;
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Radio, MapPin, Save, Trash2, X, RefreshCw, Eye, Zap, Settings } from 'lucide-react';
import { getCompatibleLinkTypes, linkParams } from '../config/equipmentsConfig';

// Presets enrichis basés sur les équipements
const presets = {
  'Fibre Optique': { 
    'Type liaison': 'Optique', 
    'Portée (km)': '50',
    'Atténuation (dB/km)': '0.2',
    'Perte connecteurs (dB)': '0.5',
    'Perte épissures (dB)': '0.1',
    'Sensibilité récepteur (dBm)': '-25'
  },
  'Faisceau Hertzien': { 
    'Type liaison': 'Hertzien', 
    'Portée (km)': '20',
    'Longueur guide Tx (m)': '10',
    'Longueur guide Rx (m)': '10',
    'Perte guide (dB/100m)': '2.0',
    'Perte branchements (dB)': '1.0'
  },
  'Liaison GSM': { 
    'Type liaison': 'GSM', 
    'Rayon cellule (km)': '15',
    'Bande passante (MHz)': '25',
    'Total fréquences': '124',
    'Surface totale (km²)': '500',
    'Surface cellule (km²)': '10',
    'i': '0',
    'j': '0',
    'Frequencies': ''
  },
  'Liaison 5G': { 
    'Type liaison': '5G', 
    'Portée (km)': '5',
    'Bande passante (MHz)': '100',
    'Couches MIMO': '64',
    'Rapidité modulation (bauds)': '1000000',
    'Valence': '256'
  },
  'Liaison RJ45': { 
    'Type liaison': 'RJ45', 
    'Portée (km)': '0.1'
  }
};

function LinkConfigPopup({ sourceNode, targetNode, saveConfig, closePopup, deleteEdge, updateEdgeConnection, edges, pendingConnection, selectedEdge, nodes = [] }) {
  const [params, setParams] = useState({});
  const [newSource, setNewSource] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [activeTab, setActiveTab] = useState('config');
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);
  const [feasibilityCheck, setFeasibilityCheck] = useState({ status: 'unknown', message: '' });
  const [selectedLinkType, setSelectedLinkType] = useState('');
  const [compatibleLinkTypes, setCompatibleLinkTypes] = useState([]);

  // Fonction pour extraire le type d'équipement
  const getEquipmentType = (node) => {
    return node?.data?.type || node?.type || node?.data?.label || '';
  };

  // Déterminer les types de liaisons compatibles
  useEffect(() => {
    if (sourceNode && targetNode) {
      const sourceType = getEquipmentType(sourceNode);
      const targetType = getEquipmentType(targetNode);

      if (!sourceType || !targetType) {
        setCompatibleLinkTypes([]);
        setFeasibilityCheck({ status: 'error', message: 'Type d\'équipement non défini pour l\'un des nœuds' });
        return;
      }

      const compatible = getCompatibleLinkTypes(sourceType, targetType);
      setCompatibleLinkTypes(compatible || []);

      if (selectedLinkType && !compatible.includes(selectedLinkType)) {
        setSelectedLinkType('');
        setParams(prev => ({ ...prev, 'Type liaison': '' }));
      }
    } else {
      setCompatibleLinkTypes([]);
      setFeasibilityCheck({ status: 'error', message: 'Nœuds source ou cible manquants' });
    }
  }, [sourceNode, targetNode, selectedLinkType]);

  // Initialiser les paramètres depuis l'arête ou la connexion en cours
  useEffect(() => {
    if (selectedEdge) {
      setParams(selectedEdge.data?.params || {});
      setNewSource(selectedEdge.source);
      setNewTarget(selectedEdge.target);
      setSelectedLinkType(selectedEdge.data?.params?.['Type liaison'] || '');
    } else if (pendingConnection) {
      setParams(pendingConnection.data?.params || {});
      setNewSource(pendingConnection.source);
      setNewTarget(pendingConnection.target);
      setSelectedLinkType(pendingConnection.data?.params?.['Type liaison'] || '');
    } else {
      setParams({});
      setNewSource('');
      setNewTarget('');
      setSelectedLinkType('');
    }
  }, [selectedEdge, pendingConnection]);

  // Valider les paramètres et vérifier la faisabilité
  useEffect(() => {
    validateParams(params);
    checkFeasibility();
  }, [params, newSource, newTarget, selectedLinkType, compatibleLinkTypes]);

  const validateParams = (currentParams) => {
    const newErrors = {};
    const portee = parseFloat(currentParams['Portée (km)']);

    if (!currentParams['Type liaison']) {
      newErrors['Type liaison'] = 'Type de liaison requis';
    } else if (!compatibleLinkTypes.includes(currentParams['Type liaison'])) {
      newErrors['Type liaison'] = 'Type de liaison non compatible avec ces équipements';
    }

    if (selectedLinkType === 'Optique') {
      const attenuation = parseFloat(currentParams['Atténuation (dB/km)']);
      if (isNaN(attenuation) || attenuation < 0) {
        newErrors['Atténuation (dB/km)'] = 'Atténuation doit être positive';
      }
      const perteConnecteurs = parseFloat(currentParams['Perte connecteurs (dB)']);
      if (isNaN(perteConnecteurs) || perteConnecteurs < 0) {
        newErrors['Perte connecteurs (dB)'] = 'Perte connecteurs doit être positive';
      }
      const perteEpissures = parseFloat(currentParams['Perte épissures (dB)']);
      if (isNaN(perteEpissures) || perteEpissures < 0) {
        newErrors['Perte épissures (dB)'] = 'Perte épissures doit être positive';
      }
      const sensibilite = parseFloat(currentParams['Sensibilité récepteur (dBm)']);
      if (isNaN(sensibilite)) {
        newErrors['Sensibilité récepteur (dBm)'] = 'Sensibilité récepteur doit être définie';
      }
    }

    if (selectedLinkType === 'Hertzien') {
      if (isNaN(portee) || portee <= 0) {
        newErrors['Portée (km)'] = 'Portée doit être positive';
      }
      if (portee > 100) {
        newErrors['Portée (km)'] = 'Portée max 100km pour faisceau hertzien';
      }
      const longueurTx = parseFloat(currentParams['Longueur guide Tx (m)']);
      if (isNaN(longueurTx) || longueurTx < 0) {
        newErrors['Longueur guide Tx (m)'] = 'Longueur guide Tx doit être positive';
      }
      const longueurRx = parseFloat(currentParams['Longueur guide Rx (m)']);
      if (isNaN(longueurRx) || longueurRx < 0) {
        newErrors['Longueur guide Rx (m)'] = 'Longueur guide Rx doit être positive';
      }
      const perteGuide = parseFloat(currentParams['Perte guide (dB/100m)']);
      if (isNaN(perteGuide) || perteGuide < 0) {
        newErrors['Perte guide (dB/100m)'] = 'Perte guide doit être positive';
      }
      const perteBranchements = parseFloat(currentParams['Perte branchements (dB)']);
      if (isNaN(perteBranchements) || perteBranchements < 0) {
        newErrors['Perte branchements (dB)'] = 'Perte branchements doit être positive';
      }
    }

    if (selectedLinkType === 'GSM') {
      const rayonCellule = parseFloat(currentParams['Rayon cellule (km)']);
      if (isNaN(rayonCellule) || rayonCellule <= 0) {
        newErrors['Rayon cellule (km)'] = 'Rayon cellule doit être positif';
      }
      const totalFreq = parseInt(currentParams['Total fréquences']);
      if (isNaN(totalFreq) || totalFreq <= 0) {
        newErrors['Total fréquences'] = 'Nombre de fréquences doit être positif';
      }
      const bandePassante = parseFloat(currentParams['Bande passante (MHz)']);
      if (isNaN(bandePassante) || bandePassante <= 0) {
        newErrors['Bande passante (MHz)'] = 'Bande passante doit être positive';
      }
    }

    if (selectedLinkType === '5G') {
      const bandwidth = parseFloat(currentParams['Bande passante (MHz)']);
      if (isNaN(bandwidth) || bandwidth <= 0) {
        newErrors['Bande passante (MHz)'] = 'Bande passante doit être positive';
      }
      const mimo = parseInt(currentParams['Couches MIMO']);
      if (isNaN(mimo) || mimo <= 0) {
        newErrors['Couches MIMO'] = 'Nombre de couches MIMO doit être positif';
      }
      const valence = parseInt(currentParams['Valence']);
      if (isNaN(valence) || valence <= 0) {
        newErrors['Valence'] = 'Valence doit être positive';
      }
    }

    if (selectedLinkType === 'RJ45') {
      if (isNaN(portee) || portee <= 0) {
        newErrors['Portée (km)'] = 'Portée doit être positive';
      }
      if (portee > 0.1) {
        newErrors['Portée (km)'] = 'Portée max 100m (0.1km) pour RJ45';
      }
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  };

  const checkFeasibility = () => {
    const portee = parseFloat(params['Portée (km)']);
    const type = params['Type liaison'];

    if (!type) {
      setFeasibilityCheck({ status: 'unknown', message: 'Configuration incomplète' });
      return;
    }

    if (!compatibleLinkTypes.includes(type)) {
      setFeasibilityCheck({ 
        status: 'error', 
        message: 'Type de liaison incompatible avec les équipements sélectionnés' 
      });
      return;
    }

    let status = 'feasible';
    let message = 'Liaison techniquement réalisable';

    switch(type) {
      case 'Hertzien':
        if (portee > 50) {
          status = 'warning';
          message = 'Portée élevée - vérifier les obstacles et zone de Fresnel';
        } else if (portee > 100) {
          status = 'error';
          message = 'Portée excessive pour faisceau hertzien';
        }
        break;
      case '5G':
        if (portee > 5) {
          status = 'warning';
          message = 'Portée élevée pour 5G - performances dégradées possibles';
        } else if (portee > 10) {
          status = 'error';
          message = 'Portée trop élevée pour 5G - densification recommandée';
        }
        break;
      case 'GSM':
        if (portee > 35) {
          status = 'warning';
          message = 'Portée élevée pour GSM - vérifier la couverture';
        }
        break;
      case 'Optique':
        const attenuation = parseFloat(params['Atténuation (dB/km)']);
        const totalAttenuation = attenuation * portee;
        if (totalAttenuation > 15) {
          status = 'warning';
          message = 'Atténuation totale élevée - amplification requise';
        } else if (totalAttenuation > 25) {
          status = 'error';
          message = 'Atténuation excessive - liaison non viable';
        }
        break;
      case 'RJ45':
        if (portee > 0.1) {
          status = 'error';
          message = 'Portée max 100m pour RJ45 - utiliser répéteurs ou fibre';
        }
        break;
    }

    setFeasibilityCheck({ status, message });
  };

  const handleChange = (e) => {
    const newParams = { ...params, [e.target.name]: e.target.value };
    setParams(newParams);

    if (e.target.name === 'Type liaison') {
      setSelectedLinkType(e.target.value);
      setParams({ 'Type liaison': e.target.value });
    }
  };

  const applyPreset = (presetName) => {
    const preset = presets[presetName];
    if (compatibleLinkTypes.includes(preset['Type liaison'])) {
      setParams({ ...preset });
      setSelectedLinkType(preset['Type liaison']);
    }
  };

  const getCompatiblePresets = () => {
    return Object.entries(presets).filter(([name, preset]) => 
      compatibleLinkTypes.includes(preset['Type liaison'])
    );
  };

  const handleSave = () => {
    if (isValid && compatibleLinkTypes.length > 0) {
      saveConfig({ params });
    }
  };

  const handleUpdateConnection = () => {
    if (selectedEdge && newSource && newTarget && (newSource !== selectedEdge.source || newTarget !== selectedEdge.target)) {
      updateEdgeConnection(selectedEdge.id, newSource, newTarget);
    }
    closePopup();
  };

  const getFeasibilityColor = () => {
    switch (feasibilityCheck.status) {
      case 'feasible': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getFeasibilityIcon = () => {
    switch (feasibilityCheck.status) {
      case 'feasible': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return Eye;
    }
  };

  const renderDynamicFields = () => {
    if (!selectedLinkType || !linkParams[selectedLinkType]) return null;

    return linkParams[selectedLinkType].map((paramName) => {
      if (paramName === 'Type liaison') return null;

      const isError = errors[paramName];
      let inputProps = {
        type: 'text',
        placeholder: `Entrer ${paramName.toLowerCase()}`
      };

      if (paramName.includes('(MHz)') || paramName.includes('(GHz)') || paramName.includes('(dB') || 
          paramName.includes('(km)') || paramName.includes('(m)') || paramName.includes('(ms)') || 
          paramName.includes('(bauds)') || paramName === 'Total fréquences' || paramName === 'Couches MIMO' || 
          paramName === 'i' || paramName === 'j' || paramName === 'Valence') {
        inputProps.type = 'number';
        inputProps.step = paramName.includes('(dB') ? '0.1' : paramName.includes('(km)') ? '0.1' : '1';
        inputProps.min = '0';
      }

      return (
        <div key={paramName}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {paramName}
            {paramName.includes('(dB') && <span className="text-xs text-gray-500 ml-1">(décibels)</span>}
            {paramName.includes('(MHz)') && <span className="text-xs text-gray-500 ml-1">(mégahertz)</span>}
            {paramName.includes('(km)') && <span className="text-xs text-gray-500 ml-1">(kilomètres)</span>}
          </label>
          <input
            name={paramName}
            value={params[paramName] || ''}
            onChange={handleChange}
            {...inputProps}
            className={`w-full p-2 border rounded-lg ${
              isError ? 'border-red-300' : 'border-gray-300'
            } focus:ring-2 focus:ring-green-500 focus:border-green-500`}
          />
          {isError && (
            <p className="text-red-500 text-xs mt-1">{isError}</p>
          )}
        </div>
      );
    });
  };

  const getPreviewInfo = () => {
    const type = params['Type liaison'];
    const portee = params['Portée (km)'];

    switch(type) {
      case 'Optique':
        return {
          icon: Zap,
          details: [
            `Atténuation: ${params['Atténuation (dB/km)'] || 'N/A'} dB/km`,
            `Portée: ${portee || 'N/A'} km`,
            `Sensibilité: ${params['Sensibilité récepteur (dBm)'] || 'N/A'} dBm`,
            `Perte totale: ${portee && params['Atténuation (dB/km)'] ? 
              (parseFloat(portee) * parseFloat(params['Atténuation (dB/km)']) + 
               parseFloat(params['Perte connecteurs (dB)'] || 0) + 
               parseFloat(params['Perte épissures (dB)'] || 0)).toFixed(2) + ' dB' : 'N/A'}`
          ]
        };
      case 'Hertzien':
        return {
          icon: Radio,
          details: [
            `Portée: ${portee || 'N/A'} km`,
            `Guide Tx: ${params['Longueur guide Tx (m)'] || 'N/A'} m`,
            `Guide Rx: ${params['Longueur guide Rx (m)'] || 'N/A'} m`,
            `Perte guide: ${params['Perte guide (dB/100m)'] || 'N/A'} dB/100m`
          ]
        };
      case 'GSM':
        return {
          icon: Radio,
          details: [
            `Rayon cellule: ${params['Rayon cellule (km)'] || 'N/A'} km`,
            `Bande passante: ${params['Bande passante (MHz)'] || 'N/A'} MHz`,
            `Fréquences: ${params['Total fréquences'] || 'N/A'}`,
          ]
        };
      case '5G':
        return {
          icon: Settings,
          details: [
            `Bande passante: ${params['Bande passante (MHz)'] || 'N/A'} MHz`,
            `MIMO: ${params['Couches MIMO'] || 'N/A'} couches`,
            `Portée: ${portee || 'N/A'} km`,
            `Modulation: ${params['Rapidité modulation (bauds)'] || 'N/A'} bauds`
          ]
        };
      case 'RJ45':
        return {
          icon: MapPin,
          details: [
            `Portée: ${portee || 'N/A'} km`,
            `Distance max: 100m (Ethernet standard)`
          ]
        };
      default:
        return {
          icon: MapPin,
          details: [`Type: ${type || 'Non défini'}`, `Portée: ${portee || 'N/A'} km`]
        };
    }
  };

  const FeasibilityIcon = getFeasibilityIcon();
  const previewInfo = getPreviewInfo();
  const PreviewIcon = previewInfo.icon;
  const compatiblePresets = getCompatiblePresets();

  const getEquipmentNetworkInfo = () => {
    if (!sourceNode || !targetNode) return null;

    const sourceType = getEquipmentType(sourceNode);
    const targetType = getEquipmentType(targetNode);
    const sourceNetwork = sourceNode?.data?.network || '';
    const targetNetwork = targetNode?.data?.network || '';

    return {
      source: { name: sourceNode.data?.label || sourceNode.id, type: sourceType, network: sourceNetwork },
      target: { name: targetNode.data?.label || targetNode.id, type: targetType, network: targetNetwork }
    };
  };

  const equipmentInfo = getEquipmentNetworkInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Configuration Liaison</h2>
            </div>
            <button onClick={closePopup} className="hover:bg-green-700 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm opacity-90 mt-1">
            {equipmentInfo?.source.name} → {equipmentInfo?.target.name}
          </div>
          <div className="text-xs opacity-75 mt-1">
            {equipmentInfo?.source.type} ({equipmentInfo?.source.network || 'Réseau non défini'}) → {equipmentInfo?.target.type} ({equipmentInfo?.target.network || 'Réseau non défini'})
          </div>
          {compatibleLinkTypes.length > 0 ? (
            <div className="text-xs opacity-75 mt-1 bg-green-600 bg-opacity-50 px-2 py-1 rounded">
              ✓ Types compatibles: {compatibleLinkTypes.join(', ')}
            </div>
          ) : (
            <div className="text-xs opacity-75 mt-1 bg-red-600 bg-opacity-50 px-2 py-1 rounded">
              ✗ Aucun type de liaison compatible détecté
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'config' 
                ? 'border-b-2 border-green-500 text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('connection')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'connection' 
                ? 'border-b-2 border-green-500 text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'presets' 
                ? 'border-b-2 border-green-500 text-green-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Presets ({compatiblePresets.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {activeTab === 'config' && (
            <>
              {compatibleLinkTypes.length === 0 && (
                <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">Incompatibilité détectée</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    Aucun type de liaison compatible entre ces équipements
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    Vérifiez que les types d'équipements sont correctement définis dans les nœuds
                  </p>
                </div>
              )}

              <div className={`bg-gray-50 p-3 rounded-lg border-l-4 ${
                feasibilityCheck.status === 'feasible' ? 'border-green-400' :
                feasibilityCheck.status === 'warning' ? 'border-yellow-400' :
                feasibilityCheck.status === 'error' ? 'border-red-400' : 'border-gray-400'
              }`}>
                <div className="flex items-center gap-2">
                  <FeasibilityIcon className={`w-4 h-4 ${getFeasibilityColor()}`} />
                  <span className="text-sm font-medium">Analyse de faisabilité</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{feasibilityCheck.message}</p>
              </div>

              {selectedLinkType && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <PreviewIcon className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-medium text-gray-700">Aperçu liaison {selectedLinkType}</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    {previewInfo.details.map((detail, index) => (
                      <div key={index} className="text-gray-600">{detail}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de liaison
                  </label>
                  <select
                    name="Type liaison"
                    value={params['Type liaison'] || ''}
                    onChange={handleChange}
                    disabled={compatibleLinkTypes.length === 0}
                    className={`w-full p-2 border rounded-lg ${
                      errors['Type liaison'] ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      compatibleLinkTypes.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">Sélectionner un type de liaison</option>
                    {compatibleLinkTypes.map((linkType) => (
                      <option key={linkType} value={linkType}>
                        {linkType}
                      </option>
                    ))}
                  </select>
                  {errors['Type liaison'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['Type liaison']}</p>
                  )}
                  {compatibleLinkTypes.length === 0 && (
                    <p className="text-gray-500 text-xs mt-1">
                      Aucun type de liaison compatible disponible
                    </p>
                  )}
                </div>

                {renderDynamicFields()}
              </div>
            </>
          )}

          {activeTab === 'connection' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nœud source
                </label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Sélectionner source</option>
                  {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.data?.label || node.id} ({node.data?.type || 'Type non défini'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nœud cible
                </label>
                <select
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Sélectionner cible</option>
                  {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.data?.label || node.id} ({node.data?.type || 'Type non défini'})
                    </option>
                  ))}
                </select>
              </div>

              {newSource && newTarget && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Nouvelle connexion</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {nodes.find(n => n.id === newSource)?.data?.label} → {nodes.find(n => n.id === newTarget)?.data?.label}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-3">
              {compatiblePresets.length === 0 ? (
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Aucun preset compatible</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Les presets disponibles ne sont pas compatibles avec ces équipements
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-sm text-gray-600 mb-3">
                    Presets compatibles avec vos équipements :
                  </div>
                  {compatiblePresets.map(([presetName, preset]) => (
                    <div key={presetName} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">{presetName}</h3>
                        <button
                          onClick={() => applyPreset(presetName)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          <RefreshCw className="w-4 h-4 inline mr-1" />
                          Appliquer
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Type: {preset['Type liaison']}</div>
                        <div>Portée: {preset['Portée (km)'] || 'N/A'} km</div>
                        {preset['Bande passante (MHz)'] && (
                          <div>Bande passante: {preset['Bande passante (MHz)']} MHz</div>
                        )}
                        {preset['Atténuation (dB/km)'] && (
                          <div>Atténuation: {preset['Atténuation (dB/km)']} dB/km</div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {Object.keys(params).length} paramètre(s) configuré(s)
          </div>
          <div className="flex gap-2">
            {selectedEdge && (
              <button
                onClick={() => deleteEdge(selectedEdge.id)}
                className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            )}
            
            {selectedEdge && (newSource !== selectedEdge.source || newTarget !== selectedEdge.target) && (
              <button
                onClick={handleUpdateConnection}
                className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Reconnecter
              </button>
            )}
            
            <button
              onClick={handleSave}
              disabled={!isValid || compatibleLinkTypes.length === 0}
              className={`px-4 py-1.5 text-sm rounded-lg flex items-center gap-1 ${
                isValid && compatibleLinkTypes.length > 0
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkConfigPopup;
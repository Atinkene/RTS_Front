import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Settings, Zap, Euro, Save, Trash2, X, Info, TrendingUp, Activity } from 'lucide-react';
import { getEquipmentProperties } from '../config/equipmentsConfig';

function NodeConfigPopup({ node, saveConfig, closePopup, deleteNode }) {
  const [params, setParams] = useState(node?.data?.params || {});
  const [activeTab, setActiveTab] = useState('config');
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);
  const [equipmentParams, setEquipmentParams] = useState([]);

  // Fonction pour trouver les paramètres d'un équipement
  const getEquipmentParams = (equipmentName) => {
    const equipment = getEquipmentProperties(equipmentName);
    return equipment?.params || [];
  };

  // Presets intelligents basés sur le type d'équipement
  const generatePresets = (equipmentName) => {
    const presets = {};
    
    if (equipmentName.includes('BTS') || equipmentName.includes('NodeB') || equipmentName.includes('eNodeB') || equipmentName.includes('gNodeB')) {
      presets['Configuration Standard'] = { 'Puissance (dBm)': '43', 'Coût unitaire (CFA)': '25000', 'Bande passante (MHz)': '20' };
      presets['Configuration Économique'] = { 'Puissance (dBm)': '37', 'Coût unitaire (CFA)': '15000', 'Bande passante (MHz)': '10' };
      presets['Configuration Haute Performance'] = { 'Puissance (dBm)': '46', 'Coût unitaire (CFA)': '35000', 'Bande passante (MHz)': '40' };
    }
    
    if (equipmentName === 'Routeur') {
      presets['Routeur Entreprise'] = { 'Débit (Gbps)': '10', 'Ports': '24', 'Coût unitaire (CFA)': '5000' };
      presets['Routeur Campus'] = { 'Débit (Gbps)': '40', 'Ports': '48', 'Coût unitaire (CFA)': '15000' };
      presets['Routeur Core'] = { 'Débit (Gbps)': '100', 'Ports': '96', 'Coût unitaire (CFA)': '50000' };
    }
    
    if (equipmentName === 'Switch') {
      presets['Switch Accès'] = { 'Ports': '24', 'Débit (Gbps)': '1', 'Coût unitaire (CFA)': '800' };
      presets['Switch Distribution'] = { 'Ports': '48', 'Débit (Gbps)': '10', 'Coût unitaire (CFA)': '3000' };
      presets['Switch Core'] = { 'Ports': '96', 'Débit (Gbps)': '40', 'Coût unitaire (CFA)': '12000' };
    }
    
    if (equipmentName === 'gNodeB') {
      presets['5G Standard'] = { 'Puissance (dBm)': '46', 'Bande passante (MHz)': '100', 'Latence (ms)': '1', 'Coût unitaire (CFA)': '45000' };
      presets['5G mmWave'] = { 'Puissance (dBm)': '43', 'Bande passante (MHz)': '400', 'Latence (ms)': '0.5', 'Coût unitaire (CFA)': '75000' };
    }
    
    if (equipmentName === 'Répéteur' || equipmentName === 'Amplificateur' || equipmentName === 'Régénérateur') {
      presets['Standard'] = { 'Gain (dB)': '20', 'Coût unitaire (CFA)': '5000', 'Puissance (dBm)': '30' };
      presets['Haute Performance'] = { 'Gain (dB)': '30', 'Coût unitaire (CFA)': '8000', 'Puissance (dBm)': '40' };
    }
    
    return presets;
  };

  useEffect(() => {
    const equipmentType = node?.data?.type || node?.type || node?.data?.label || '';
    if (equipmentType) {
      const availableParams = getEquipmentParams(equipmentType);
      setEquipmentParams(availableParams);
      
      const initialParams = { ...node?.data?.params || {} };
      availableParams.forEach(param => {
        if (!(param in initialParams)) {
          initialParams[param] = '';
        }
      });
      
      setParams(initialParams);
      validateParams(initialParams);
    } else {
      setEquipmentParams([]);
      setParams({});
      setErrors({ general: 'Type d\'équipement non défini' });
      setIsValid(false);
    }
  }, [node?.id, node?.data?.params, node?.data?.type, node?.type]);

  const validateParams = (currentParams) => {
    const newErrors = {};
    
    Object.entries(currentParams).forEach(([key, value]) => {
      if (value === '') return;
      
      const numValue = parseFloat(value);
      
      if (key.includes('Puissance (dBm)')) {
        if (isNaN(numValue) || numValue < -10 || numValue > 50) {
          newErrors[key] = 'Puissance doit être entre -10 et 50 dBm';
        }
      } else if (key.includes('Coût unitaire (CFA)')) {
        if (isNaN(numValue) || numValue <= 0) {
          newErrors[key] = 'Coût doit être positif';
        }
      } else if (key.includes('Débit') || key.includes('Capacité')) {
        if (isNaN(numValue) || numValue <= 0) {
          newErrors[key] = 'Débit/Capacité doit être positif';
        }
      } else if (key.includes('Fréquence')) {
        if (isNaN(numValue) || numValue <= 0) {
          newErrors[key] = 'Fréquence doit être positive';
        }
      } else if (key.includes('Ports')) {
        if (isNaN(numValue) || numValue <= 0 || numValue % 1 !== 0) {
          newErrors[key] = 'Nombre de ports doit être un entier positif';
        }
      } else if (key.includes('Latence')) {
        if (isNaN(numValue) || numValue < 0) {
          newErrors[key] = 'Latence doit être positive ou nulle';
        }
      } else if (key.includes('Bande passante (MHz)')) {
        if (isNaN(numValue) || numValue <= 0) {
          newErrors[key] = 'Bande passante doit être positive';
        }
      } else if (key.includes('Gain (dB)')) {
        if (isNaN(numValue) || numValue <= 0) {
          newErrors[key] = 'Gain doit être positif';
        }
      }
    });

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  };

  const handleChange = (e) => {
    const newParams = { ...params, [e.target.name]: e.target.value };
    setParams(newParams);
    validateParams(newParams);
  };

  const applyPreset = (presetName, preset) => {
    const newParams = { ...params, ...preset };
    setParams(newParams);
    validateParams(newParams);
  };

  const handleSave = () => {
    if (isValid) {
      saveConfig(node.id, { params });
    }
  };

  const getNodeStatus = () => {
    const requiredParams = equipmentParams.filter(param => 
      param.includes('Coût unitaire') || param.includes('Puissance') || param.includes('Débit') || param.includes('Bande passante') || param.includes('Gain')
    );
    const filledParams = requiredParams.filter(param => params[param] && params[param] !== '');
    
    if (filledParams.length === 0) return { status: 'non-configuré', color: 'text-orange-500', icon: AlertCircle };
    if (!isValid) return { status: 'erreur', color: 'text-red-500', icon: AlertCircle };
    if (filledParams.length < requiredParams.length) return { status: 'partiellement configuré', color: 'text-yellow-500', icon: Activity };
    return { status: 'configuré', color: 'text-green-500', icon: CheckCircle };
  };

  const { status, color, icon: StatusIcon } = getNodeStatus();
  const presets = generatePresets(node?.data?.type || node?.type || '');

  const getParamIcon = (param) => {
    if (param.includes('Puissance')) return <Zap className="w-4 h-4 text-yellow-500" />;
    if (param.includes('Coût')) return <Euro className="w-4 h-4 text-green-500" />;
    if (param.includes('Débit') || param.includes('Capacité') || param.includes('Bande passante')) return <TrendingUp className="w-4 h-4 text-blue-500" />;
    if (param.includes('Gain')) return <Zap className="w-4 h-4 text-yellow-500" />;
    return <Settings className="w-4 h-4 text-gray-500" />;
  };

  const getParamUnit = (param) => {
    if (param.includes('(') && param.includes(')')) {
      const match = param.match(/\(([^)]+)\)/);
      return match ? match[1] : '';
    }
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Configuration Nœud</h2>
            </div>
            <button onClick={closePopup} className="hover:bg-blue-700 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <StatusIcon className={`w-4 h-4 ${color}`} />
            <span className="text-sm opacity-90">{node?.data?.type || node?.type || 'Équipement inconnu'} - {status}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'config' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Configuration
          </button>
          {Object.keys(presets).length > 0 && (
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === 'presets' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Presets
            </button>
          )}
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'info' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Infos
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {activeTab === 'config' && (
            <>
              {/* Résumé de configuration */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">État de configuration</h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Paramètres disponibles:</span>
                    <span className="font-medium">{equipmentParams.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Paramètres configurés:</span>
                    <span className="font-medium">{Object.values(params).filter(v => v !== '').length}</span>
                  </div>
                </div>
              </div>

              {/* Champs de configuration dynamiques */}
              {equipmentParams.length === 0 && (
                <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">Erreur</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">Aucun paramètre disponible pour cet équipement</p>
                </div>
              )}
              <div className="space-y-3">
                {equipmentParams.map((param) => (
                  <div key={param}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      {getParamIcon(param)}
                      {param}
                    </label>
                    <div className="relative">
                      <input
                        name={param}
                        value={params[param] || ''}
                        onChange={handleChange}
                        type={param.includes('(dBm)') || param.includes('(Gbps)') || param.includes('(MHz)') || param.includes('(ms)') || param.includes('Ports') || param.includes('(CFA)') || param.includes('(dB)') ? 'number' : 'text'}
                        step={param.includes('(dBm)') || param.includes('(Gbps)') || param.includes('(MHz)') || param.includes('(ms)') || param.includes('(dB)') ? '0.1' : '1'}
                        min="0"
                        placeholder={`Entrer ${param.toLowerCase()}`}
                        className={`w-full p-2 border rounded-lg ${
                          errors[param] ? 'border-red-300' : 'border-gray-300'
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {getParamUnit(param) && (
                        <span className="absolute right-3 top-2.5 text-xs text-gray-400">
                          {getParamUnit(param)}
                        </span>
                      )}
                    </div>
                    {errors[param] && (
                      <p className="text-red-500 text-xs mt-1">{errors[param]}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'presets' && Object.keys(presets).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Configurations prédéfinies</h3>
              {Object.entries(presets).map(([name, preset]) => (
                <div
                  key={name}
                  onClick={() => applyPreset(name, preset)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium text-sm">{name}</div>
                  <div className="text-xs text-gray-500 mt-1 space-y-1">
                    {Object.entries(preset).map(([key, value]) => (
                      <div key={key}>{key}: {value}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-medium text-blue-800">Informations équipement</h3>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div><strong>Type:</strong> {node?.data?.type || node?.type || 'Non défini'}</div>
                  <div><strong>Réseau:</strong> {node?.data?.network || 'Non défini'}</div>
                  <div><strong>ID:</strong> {node?.id || 'Non défini'}</div>
                  <div><strong>Paramètres configurables:</strong> {equipmentParams.length}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Paramètres disponibles:</h4>
                <div className="grid grid-cols-1 gap-1">
                  {equipmentParams.map((param, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {getParamIcon(param)}
                      {param}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t p-4 space-y-2">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg font-medium ${
              isValid
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            Sauvegarder Configuration
          </button>
          <button
            onClick={deleteNode}
            className="w-full flex items-center justify-center gap-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer Nœud
          </button>
        </div>
      </div>
    </div>
  );
}

export default NodeConfigPopup;
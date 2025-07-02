import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, MousePointer, Settings, Calculator, FileText, Download, Lightbulb } from 'lucide-react';

const HelpPopup = ({ isOpen, onClose, darkMode }) => {
  const [activeSection, setActiveSection] = useState(null);

  if (!isOpen) return null;

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const sections = [
    {
      id: 'start',
      title: '1. Démarrage et Prise en Main',
      icon: <MousePointer size={20} />,
      content: [
        'Accueil sur l\'interface principale avec toutes les fonctionnalités disponibles',
        'Interface intuitive avec barre latérale pour les équipements et canvas central',
        'Étapes clés : Ajouter équipements → Configurer → Calculer → Exporter'
      ]
    },
    {
      id: 'build',
      title: '2. Construction du Réseau',
      icon: <Settings size={20} />,
      content: [
        'Ajout d\'équipements : Sélectionnez dans la barre latérale groupée par technologie (GSM, Optique, 5G)',
        'Glissez-déposez (drag & drop) l\'équipement sur le canevas principal',
        'Utilisez la barre de recherche pour trouver rapidement un équipement',
        'Ajout de liaisons : Reliez deux équipements en traçant une connexion entre eux',
        'Configurez chaque liaison avec un type (Optique, Hertzien, RJ45) pour définir ses paramètres'
      ]
    },
    {
      id: 'config',
      title: '3. Configuration des Paramètres',
      icon: <Settings size={20} />,
      content: [
        'Équipements : Cliquez sur un nœud pour ouvrir la popup de configuration',
        'Renseignez les paramètres techniques (puissance, coût, bande passante, etc.)',
        'Des presets intelligents sont proposés selon le type d\'équipement',
        'Validation automatique des champs avec alertes en cas d\'erreur',
        'Liaisons : Cliquez sur une liaison pour configurer ses paramètres',
        'Choisissez le type de liaison et ses paramètres (distance, atténuation, fréquence)',
        'Vérification automatique de la compatibilité des liaisons'
      ]
    },
    {
      id: 'calculate',
      title: '4. Calcul et Analyse des Résultats',
      icon: <Calculator size={20} />,
      content: [
        'Cliquez sur le bouton "Calculer" (icône Play) pour lancer le dimensionnement',
        'Le système effectue automatiquement les calculs pour chaque liaison et équipement',
        'Calculs : budget optique, radio, SNR, capacité, latence, etc.',
        'Affichage des résultats dans une popup dédiée avec :',
        '  Performances de chaque liaison (puissance, perte, capacité, couverture)',
        '  Coût total du réseau',
        '  Alertes et suggestions d\'optimisation',
        '  Visualisations et diagrammes'
      ]
    },
    {
      id: 'export',
      title: '5. Export et Sauvegarde',
      icon: <Download size={20} />,
      content: [
        'Export CSV : Exportez les résultats détaillés exploitables dans Excel',
        'Export PDF : Générez un rapport professionnel complet',
        'Le rapport inclut : schéma réseau, équipements, résultats, coût, suggestions',
        'Sauvegarde/Chargement : Sauvegardez votre projet au format JSON',
        'Rechargez un projet existant à tout moment',
        'Sauvegarde automatique toutes les 30 secondes'
      ]
    },
    {
      id: 'optimize',
      title: '6. Optimisation et Itérations',
      icon: <Lightbulb size={20} />,
      content: [
        'Modifiez les paramètres, ajoutez/supprimez équipements ou liaisons à tout moment',
        'Relancez le calcul après chaque modification',
        'Utilisez l\'historique pour annuler/refaire des actions (Ctrl+Z / Ctrl+Shift+Z)',
        'Suggestions automatiques d\'optimisation :',
        '  Réduction des distances',
        '  Augmentation de puissance',
        '  Changement de technologie',
        'Workflow itératif jusqu\'à obtenir le réseau optimal'
      ]
    },
    {
      id: 'finalize',
      title: '7. Finalisation',
      icon: <FileText size={20} />,
      content: [
        'Vérifiez que toutes les alertes sont levées',
        'Confirmez que le réseau répond aux besoins spécifiés',
        'Exportez le rapport final pour documentation ou remise',
        'Résumé du workflow complet :',
        'Équipements → Liaisons → Configuration → Calcul → Résultats → Export → Optimisation → Rapport final'
      ]
    }
  ];

  const shortcuts = [
    { key: 'Ctrl + Z', action: 'Annuler' },
    { key: 'Ctrl + Shift + Z', action: 'Refaire' },
    { key: 'Ctrl + C', action: 'Copier la sélection' },
    { key: 'Ctrl + V', action: 'Coller' },
    { key: 'Ctrl + S', action: 'Sauvegarder le projet' },
    { key: 'Delete', action: 'Supprimer la sélection' },
    { key: 'Ctrl + Clic', action: 'Sélection multiple' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-2xl font-bold">Guide d'Utilisation - Outil de Dimensionnement Réseau</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''} transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Introduction */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <h3 className="font-semibold text-blue-600 mb-2">Bienvenue dans l'Outil de Dimensionnement Réseau</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Cet outil vous permet de concevoir, dimensionner et optimiser vos réseaux de télécommunications. 
                Suivez ce guide étape par étape pour une prise en main optimale.
              </p>
            </div>

            {/* Workflow Sections */}
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.id} className={`border rounded-lg ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''} transition-colors`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        {section.icon}
                      </div>
                      <span className="font-semibold">{section.title}</span>
                    </div>
                    {activeSection === section.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                  
                  {activeSection === section.id && (
                    <div className={`px-4 pb-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                      <ul className="space-y-2 mt-3">
                        {section.content.map((item, index) => (
                          <li key={index} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-start`}>
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Raccourcis Clavier */}
            <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className="font-semibold mb-3">Raccourcis Clavier</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {shortcut.action}
                    </span>
                    <code className={`px-2 py-1 rounded text-xs font-mono ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-800'}`}>
                      {shortcut.key}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Conseils */}
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
              <h3 className="font-semibold text-green-600 mb-2">💡 Conseils pour une utilisation optimale</h3>
              <ul className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} space-y-1`}>
                <li>Configurez d'abord tous vos équipements avant de lancer le calcul</li>
                <li>Utilisez les presets pour gagner du temps sur la configuration</li>
                <li>Vérifiez la compatibilité des liaisons avec les équipements connectés</li>
                <li>Sauvegardez régulièrement votre projet (sauvegarde auto toutes les 30s)</li>
                <li>Consultez les suggestions d'optimisation après chaque calcul</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPopup;
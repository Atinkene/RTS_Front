# RTS Frontend - Simulateur de Réseaux de Télécommunication

## Description

Interface utilisateur du simulateur de réseaux de télécommunication (RTS) développée en React. Cette application web permet la conception, la configuration et la visualisation de topologies réseau à travers une interface intuitive de type glisser-déposer.

## Fonctionnalités principales

### Gestion de topologie
- Création visuelle de topologies réseau par glisser-déposer
- Ajout d'équipements réseau (BTS, Routeurs, Commutateurs)
- Connexion interactive entre les nœuds
- Suppression et modification des éléments

### Configuration des équipements
- Interface de configuration par popup pour chaque type d'équipement
- Paramétrage des liaisons (GSM, 5G, Fibre optique, Ethernet)
- Validation en temps réel des paramètres saisis
- Gestion des propriétés spécifiques par technologie

### Simulation et analyse
- Calculs de performance réseau en temps réel
- Génération de rapports détaillés
- Visualisation des résultats par graphiques
- Export des données en format CSV

### Interface utilisateur
- Design responsive avec Tailwind CSS
- Graphiques interactifs avec Chart.js
- Système de popups modales
- Barre latérale d'outils contextuels

## Stack technique

- **Framework** : React 18.x
- **Rendu de graphiques réseau** : React Flow
- **Visualisation de données** : Chart.js avec react-chartjs-2
- **Styling** : Tailwind CSS
- **Icônes** : Lucide React
- **Gestion d'état** : React Hooks (useState, useEffect, useCallback)
- **HTTP Client** : Fetch API native

## Prérequis

- Node.js (version 16.x ou supérieure)
- npm ou yarn
- Serveur backend RTS en fonctionnement

## Installation

1. Cloner le repository
```bash
git clone https://github.com/Atinkene/RTS_Front.git
cd RTS_Front
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer l'environnement
```bash
# Créer un fichier .env à la racine
REACT_APP_API_URL=http://localhost:5000
```

4. Démarrer l'application
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## Scripts disponibles

```bash
# Démarrage en mode développement
npm start

# Build de production
npm run build

# Exécution des tests
npm test

# Éjection de la configuration (irréversible)
npm run eject

# Linting du code
npm run lint

# Formatage du code
npm run format
```

## Architecture du projet

```
src/
├── components/
│   ├── Sidebar.jsx              # Barre latérale des équipements
│   ├── NodeConfigPopup.jsx      # Configuration des nœuds
│   ├── LinkConfigPopup.jsx      # Configuration des liaisons
│   ├── ResultsPopup.jsx         # Affichage des résultats
│   ├── NodePanel.jsx            # Panneau de propriétés
│   ├── ResultsPanel.jsx         # Panneau des résultats
│   └── ReportGenerator.jsx      # Génération de rapports
├── utils/
│   └── linkTypes.js             # Définition des types de liaisons
├── styles/
│   └── App.css                  # Styles globaux
├── App.jsx                      # Composant racine
└── index.js                     # Point d'entrée
```

## Configuration API

L'application communique avec le backend via des endpoints REST :

- `POST /api/simulate` - Simulation de topologie
- `GET /api/health` - Vérification de l'état du serveur

## Développement

### Ajout d'un nouveau type d'équipement

1. Modifier `linkTypes.js` pour définir les types de liaisons compatibles
2. Ajouter les icônes correspondantes dans `Sidebar.jsx`
3. Étendre `NodeConfigPopup.jsx` pour les paramètres spécifiques

### Personnalisation des graphiques

Les graphiques utilisent Chart.js. Configuration dans `ResultsPopup.jsx` :

```javascript
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Titre du graphique' }
  }
};
```

## Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm test -- --coverage

# Tests en mode watch
npm test -- --watch
```

## Build et déploiement

### Build de production
```bash
npm run build
```

### Déploiement sur serveur web
```bash
# Après le build, servir le dossier build/
npx serve -s build -l 3000
```

### Variables d'environnement de production
```bash
REACT_APP_API_URL=https://votre-domaine.com/api
REACT_APP_ENVIRONMENT=production
```

## Dépannage

### Problèmes courants

**Erreur de connexion API**
- Vérifier que le backend est démarré
- Contrôler l'URL de l'API dans `.env`
- Vérifier la configuration CORS du backend

**Performance lente**
- Utiliser React DevTools Profiler
- Optimiser les re-renders avec useMemo/useCallback
- Vérifier la taille du bundle avec `npm run build`

**Problèmes de style**
- Purger le cache Tailwind : `npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch`
- Vérifier les conflits de classes CSS

## Contribution

1. Fork du projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit des modifications (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

### Standards de code

- ESLint pour la qualité du code
- Prettier pour le formatage
- Convention de nommage camelCase
- Commentaires JSDoc pour les fonctions complexes

## Licence

MIT License - voir le fichier LICENSE pour plus de détails.

## Auteur

Développé par **Atinkene**

## Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Consulter la documentation API du backend
- Vérifier les logs de la console navigateur

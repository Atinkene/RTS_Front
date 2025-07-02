import React from "react";

export default function OnboardingModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-lg max-w-lg">
        <h2 className="text-xl font-bold mb-4">Bienvenue sur l’outil de dimensionnement !</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Ajoutez des équipements depuis la barre latérale (drag & drop).</li>
          <li>Cliquez sur un nœud ou une liaison pour configurer ses paramètres.</li>
          <li>Lancez le calcul pour obtenir les résultats et suggestions.</li>
          <li>Exportez vos résultats en PDF ou CSV.</li>
        </ul>
        <button
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={onClose}
        >
          Commencer
        </button>
      </div>
    </div>
  );
}
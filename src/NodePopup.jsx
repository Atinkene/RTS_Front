import React, { useState } from 'react';

const NodePopup = ({ node, onSave, onClose }) => {
  const [label, setLabel] = useState(node.data.label);
  const [config, setConfig] = useState(node.data.config || '');

  const handleSave = () => {
    onSave(node.id, { label, config });
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        zIndex: 1000,
      }}
    >
      <h3>Configurer le nœud</h3>
      <div>
        <label>
          Nom :
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </label>
      </div>
      <div style={{ marginTop: '10px' }}>
        <label>
          Configuration :
          <textarea
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            rows="4"
            style={{ marginLeft: '10px', width: '100%' }}
          />
        </label>
      </div>
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSave} style={{ marginRight: '10px' }}>
          Sauvegarder
        </button>
        <button onClick={onClose}>Annuler</button>
      </div>
    </div>
  );
};

export default NodePopup;
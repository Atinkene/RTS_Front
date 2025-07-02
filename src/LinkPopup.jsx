import React, { useState } from 'react';

const LinkPopup = ({ link, onSave, onClose }) => {
  const [bandwidth, setBandwidth] = useState(link.bandwidth || '100 Mbps');

  const handleSave = () => {
    onSave(link.id, { bandwidth });
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
      <h3>Configurer le lien</h3>
      <div>
        <label>
          Bande passante :
          <input
            type="text"
            value={bandwidth}
            onChange={(e) => setBandwidth(e.target.value)}
            style={{ marginLeft: '10px' }}
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

export default LinkPopup;
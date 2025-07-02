
import React from 'react';
import { jsPDF } from 'jspdf';
import generateSuggestions from '../utils/suggestions';

function ReportGenerator({ nodes, edges, results }) {
  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(16);
    doc.text('Rapport de Dimensionnement Réseau', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Coût total : ${results.totalCost?.toFixed(2) || 0} €`, 20, y);
    y += 10;

    doc.text('Équipements :', 20, y);
    y += 10;
    nodes.forEach((node) => {
      doc.text(`- ${node.data.label} (ID: ${node.id})`, 30, y);
      y += 10;
      Object.entries(node.data.params || {}).forEach(([key, value]) => {
        doc.text(`  ${key}: ${value}`, 40, y);
        y += 10;
      });
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.setFontSize(14);
    doc.text('Résultats des liaisons :', 20, y);
    y += 10;
    doc.setFontSize(12);
    (results.results || []).forEach((result) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.text(`Liaison ${result.edgeId}:`, 30, y);
      y += 10;
      const edge = edges.find((e) => e.id === result.edgeId);
      const linkType = edge?.data?.params?.['Type liaison'] || 'Non spécifié';
      doc.text(`Type: ${linkType}`, 40, y);
      y += 10;
      if (result.error) {
        doc.text(`Erreur: ${result.error}`, 40, y);
        y += 10;
      } else {
        if (['Hertzien', 'RJ45'].includes(linkType)) {
          doc.text(`Puissance reçue: ${result.receivedPower?.toFixed(2) || 'N/A'} dBm`, 40, y); y += 10;
          doc.text(`Perte: ${result.loss?.toFixed(2) || 'N/A'} dB`, 40, y); y += 10;
          doc.text(`SNR: ${result.snr_dB?.toFixed(2) || 'N/A'} dB`, 40, y); y += 10;
          doc.text(`Capacité: ${result.capacity?.toFixed(2) || 'N/A'} Mbps`, 40, y); y += 10;
          doc.text(`Débit binaire: ${result.bitrate?.toFixed(2) || 'N/A'} Mbps`, 40, y); y += 10;
          doc.text(`Couverture: ${result.coverage?.toFixed(2) || 'N/A'} km`, 40, y); y += 10;
          doc.text(`Latence: ${result.latency?.toFixed(2) || 'N/A'} ms`, 40, y); y += 10;
        }
        if (linkType === 'Optique') {
          doc.text(`Puissance reçue: ${result.receivedPower?.toFixed(2) || 'N/A'} dBm`, 40, y); y += 10;
          doc.text(`Perte: ${result.loss?.toFixed(2) || 'N/A'} dB`, 40, y); y += 10;
          doc.text(`Marge: ${result.margin?.toFixed(2) || 'N/A'} dB`, 40, y); y += 10;
          doc.text(`Latence: ${result.latency?.toFixed(2) || 'N/A'} ms`, 40, y); y += 10;
        }
        if (linkType === 'GSM') {
          doc.text(`Fréquences par cellule: ${result.frequenciesPerCell?.toFixed(2) || 'N/A'}`, 40, y); y += 10;
          doc.text(`Distance de réutilisation: ${result.reuseDistance?.toFixed(2) || 'N/A'} km`, 40, y); y += 10;
          doc.text(`Capacité cellulaire: ${result.cellularCapacity?.toFixed(2) || 'N/A'} communications`, 40, y); y += 10;
          doc.text(`Largeur de bande par canal: ${result.channelBandwidth?.toFixed(3) || 'N/A'} MHz`, 40, y); y += 10;
        }
        if (linkType === '5G') {
          doc.text(`Capacité: ${result.capacity?.toFixed(2) || 'N/A'} Mbps`, 40, y); y += 10;
          doc.text(`Latence: ${result.latency?.toFixed(2) || 'N/A'} ms`, 40, y); y += 10;
        }
      }
    });

    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.text('Suggestions d\'optimisation :', 20, y);
    y += 10;
    doc.setFontSize(12);
    const suggestions = generateSuggestions(results.results || [], edges);
    if (suggestions.length > 0) {
      suggestions.forEach((sug) => {
        doc.text(`- ${sug.suggestion}`, 30, y);
        y += 10;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    } else {
      doc.text('Aucune suggestion disponible.', 30, y);
      y += 10;
    }

    doc.save('rapport_dimensionnement.pdf');
  };

  return (
    <div className="p-4">
      <button
        onClick={generatePDF}
        className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Générer Rapport PDF
      </button>
    </div>
  );
}

export default ReportGenerator;


function generateSuggestions(results, edges) {
  const suggestions = [];
  results.forEach((result) => {
    if (result.cellularCapacity) {
      const edge = edges.find((e) => e.id === result.edgeId);
      const totalArea = parseFloat(edge.data?.params?.['Surface totale (km²)'] || 1000);
      const totalFrequencies = parseFloat(edge.data?.params?.['Total fréquences'] || 200);
      const currentN = parseFloat(edge.data?.params?.['Taille cluster'] || 9);
      const currentCellArea = parseFloat(edge.data?.params?.['Surface cellule (km²)'] || 5);
      const reducedN = Math.max(3, currentN - 1);
      const newCapacityN = (totalArea / currentCellArea) * (totalFrequencies / reducedN);
      suggestions.push({
        edgeId: result.edgeId,
        suggestion: `Réduire la taille du cluster de ${currentN} à ${reducedN} pour augmenter la capacité à ${newCapacityN.toFixed(2)} communications.`,
      });
      const reducedCellArea = Math.max(1, currentCellArea / 2);
      const newCapacityArea = (totalArea / reducedCellArea) * (totalFrequencies / currentN);
      suggestions.push({
        edgeId: result.edgeId,
        suggestion: `Réduire la surface cellule de ${currentCellArea} à ${reducedCellArea} km² pour augmenter la capacité à ${newCapacityArea.toFixed(2)} communications.`,
      });
    }
  });
  return suggestions;
}

export default generateSuggestions;

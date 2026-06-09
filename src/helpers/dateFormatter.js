export const dateFormatter = {
  // Convierte un string ISO o Date en una fecha legible para tablas
  formatToLocalDate: (dateString) => {
    if (!dateString) return "---";
    const fecha = new Date(dateString);
    return fecha.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  // Extrae la hora exacta HH:MM de cualquier campo timestamp
  formatToLocalTime: (dateString) => {
    if (!dateString) return "00:00";
    // Si viene solo hora formato HH:MM:SS de la DB, recortamos
    if (typeof dateString === 'string' && dateString.includes(':') && !dateString.includes('-')) {
      return dateString.substring(0, 5);
    }
    const fecha = new Date(dateString);
    return fecha.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  },

  // Genera el string exacto YYYY-MM-DD compatible con inputs de tipo fecha
  getSQLDateStr: (date = new Date()) => {
    return date.toLocaleDateString('en-CA');
  }
};
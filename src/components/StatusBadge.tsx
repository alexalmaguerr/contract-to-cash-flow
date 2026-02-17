interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusMap: Record<string, string> = {
  'Aprobada': 'status-success',
  'Finalizada': 'status-success',
  'Activo': 'status-success',
  'Activa': 'status-success',
  'Válida': 'status-success',
  'Validada': 'status-success',
  'Aceptada': 'status-success',
  'Timbrada OK': 'status-success',
  'Disponible': 'status-success',
  'En reparación': 'status-warning',
  'En comité': 'status-warning',
  'En proceso': 'status-warning',
  'Pendiente de alta': 'status-warning',
  'Pendiente': 'status-warning',
  'No válida': 'status-error',
  'Rechazada': 'status-error',
  'Cancelado': 'status-error',
  'Inactivo': 'status-error',
  'Error PAC': 'status-error',
  'Vencida': 'status-error',
  'Por cobrar': 'status-warning',
  'Pagada': 'status-success',
  'Suspendido': 'status-error',
  'Pre-factibilidad': 'status-info',
  'Planeación': 'status-info',
  'Asignada': 'status-info',
};

const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => (
  <span className={`status-badge ${statusMap[status] || 'status-neutral'} ${className}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status}
  </span>
);

export default StatusBadge;

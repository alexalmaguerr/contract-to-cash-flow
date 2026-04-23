/**
 * Plantilla PDF de cotización de solicitud de conexión.
 * Usa @react-pdf/renderer.
 */
import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ConceptoCotizacion } from './cotizacion';
import type { SolicitudRecord, OrdenInspeccionData } from '@/types/solicitudes';

// ── Estilos ────────────────────────────────────────────────────────────────────

const GRAY = '#6b7280';
const DARK = '#111827';
const BORDER = '#e5e7eb';
const ACCENT = '#1d4ed8';
const LIGHT_BG = '#f9fafb';

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: DARK,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 36,
  },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerLeft: { flex: 1 },
  org: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: ACCENT, marginBottom: 2 },
  orgSub: { fontSize: 8, color: GRAY },
  docTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', textAlign: 'right', marginBottom: 2 },
  docFolio: { fontSize: 8, color: GRAY, textAlign: 'right' },
  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginVertical: 12 },
  // Section headers
  sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: GRAY, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  // Cards / info blocks
  card: { backgroundColor: LIGHT_BG, borderWidth: 1, borderColor: BORDER, borderRadius: 4, padding: 10, marginBottom: 10 },
  row2: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  label: { fontSize: 7.5, color: GRAY, marginBottom: 1.5 },
  value: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  valueNormal: { fontSize: 9 },
  // Table
  table: { borderWidth: 1, borderColor: BORDER, borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER },
  tableRowLast: { flexDirection: 'row' },
  tableRowAlt: { flexDirection: 'row', backgroundColor: LIGHT_BG, borderBottomWidth: 1, borderBottomColor: BORDER },
  th: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: GRAY, paddingVertical: 5, paddingHorizontal: 8 },
  td: { fontSize: 8.5, paddingVertical: 5, paddingHorizontal: 8 },
  tdRight: { fontSize: 8.5, paddingVertical: 5, paddingHorizontal: 8, textAlign: 'right' },
  // Total row
  totalRow: { flexDirection: 'row', backgroundColor: '#f0f4ff', borderTopWidth: 1.5, borderTopColor: ACCENT },
  totalLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', paddingVertical: 6, paddingHorizontal: 8, textAlign: 'right' },
  totalValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: ACCENT, paddingVertical: 6, paddingHorizontal: 8, textAlign: 'right' },
  // Inspeccion
  inspGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  inspField: { width: '30%', minWidth: 90 },
  // Footer
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 6 },
  footerText: { fontSize: 7, color: GRAY, textAlign: 'center' },
});

// ── Helpers ────────────────────────────────────────────────────────────────────

const MXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const MATERIAL_LABEL: Record<string, string> = {
  empedrado: 'Empedrado',
  concreto_hidraulico: 'Concreto hidráulico',
  concreto_asfaltico: 'Concreto asfáltico',
  concreto: 'Concreto',
  tierra: 'Tierra',
  adoquin: 'Adoquín',
  otro: 'Otro',
};

function mat(key?: string) {
  if (!key) return '—';
  return MATERIAL_LABEL[key] ?? key;
}

function strOrDash(v?: string | null) {
  return v?.trim() || '—';
}

function buildDomPredio(record: SolicitudRecord): string {
  const fd = record.formData;
  const parts = [
    fd.predioDir?.calle,
    fd.predioDir?.numExterior ? `#${fd.predioDir.numExterior}` : undefined,
    fd.predioDir?.coloniaINEGIId ? `Col. ${fd.predioDir.coloniaINEGIId}` : undefined,
    fd.predioDir?.codigoPostal ? `CP ${fd.predioDir.codigoPostal}` : undefined,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : record.predioResumen;
}

function buildNombrePropietario(record: SolicitudRecord): string {
  const fd = record.formData;
  if (fd.propTipoPersona === 'moral') return fd.propRazonSocial || '—';
  return [fd.propPaterno, fd.propMaterno, fd.propNombre].filter(Boolean).join(' ') || '—';
}

// ── Componente PDF ─────────────────────────────────────────────────────────────

interface CotizacionPdfProps {
  record: SolicitudRecord;
  ordenData: OrdenInspeccionData;
  conceptos: ConceptoCotizacion[];
  tipoContratacionNombre?: string;
  fecha?: string;
}

export function CotizacionPdfDocument({
  record,
  ordenData,
  conceptos,
  tipoContratacionNombre,
  fecha,
}: CotizacionPdfProps) {
  const fd = record.formData;
  const total = conceptos.reduce((s, c) => s + c.subtotal, 0);
  const fechaDoc = fecha ?? new Date().toLocaleDateString('es-MX', { dateStyle: 'long' });
  const vigencia = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX', { dateStyle: 'long' });
  const nombre = buildNombrePropietario(record);
  const domPredio = buildDomPredio(record);

  return (
    <Document title={`Cotización ${record.folio}`} author="CEA Querétaro">
      <Page size="LETTER" style={s.page}>

        {/* ── Header ────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.org}>CEA Querétaro</Text>
            <Text style={s.orgSub}>Comisión Estatal del Agua — Gobierno del Estado de Querétaro</Text>
          </View>
          <View>
            <Text style={s.docTitle}>Cotización de Conexión</Text>
            <Text style={s.docFolio}>Folio: {record.folio}</Text>
            <Text style={s.docFolio}>Fecha: {fechaDoc}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Datos del solicitante ─────────────────────────────────── */}
        <Text style={s.sectionTitle}>Datos del solicitante</Text>
        <View style={s.card}>
          <View style={s.row2}>
            <View style={s.col}>
              <Text style={s.label}>Propietario / Titular</Text>
              <Text style={s.value}>{nombre}</Text>
            </View>
            <View style={s.col}>
              <Text style={s.label}>RFC</Text>
              <Text style={s.valueNormal}>{strOrDash(fd.propRfc)}</Text>
            </View>
          </View>
          <View style={[s.row2, { marginTop: 8 }]}>
            <View style={s.col}>
              <Text style={s.label}>Teléfono</Text>
              <Text style={s.valueNormal}>{strOrDash(fd.propTelefono)}</Text>
            </View>
            <View style={s.col}>
              <Text style={s.label}>Correo electrónico</Text>
              <Text style={s.valueNormal}>{strOrDash(fd.propCorreo)}</Text>
            </View>
          </View>
        </View>

        {/* ── Datos del predio ──────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Predio / Domicilio del servicio</Text>
        <View style={s.card}>
          <View style={s.row2}>
            <View style={s.col}>
              <Text style={s.label}>Dirección</Text>
              <Text style={s.valueNormal}>{domPredio}</Text>
            </View>
            <View style={s.col}>
              <Text style={s.label}>Clave catastral</Text>
              <Text style={s.valueNormal}>{strOrDash(fd.claveCatastral)}</Text>
            </View>
          </View>
          {tipoContratacionNombre ? (
            <View style={{ marginTop: 8 }}>
              <Text style={s.label}>Tipo de contratación</Text>
              <Text style={s.valueNormal}>{tipoContratacionNombre}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Resumen de inspección ─────────────────────────────────── */}
        <Text style={s.sectionTitle}>Resumen de inspección</Text>
        <View style={s.card}>
          <View style={s.inspGrid}>
            {ordenData.fechaInspeccion ? (
              <View style={s.inspField}>
                <Text style={s.label}>Fecha inspección</Text>
                <Text style={s.valueNormal}>{ordenData.fechaInspeccion}</Text>
              </View>
            ) : null}
            {ordenData.numeroOficial ? (
              <View style={s.inspField}>
                <Text style={s.label}>N.º oficial</Text>
                <Text style={s.valueNormal}>{ordenData.numeroOficial}</Text>
              </View>
            ) : null}
            {ordenData.tipoUso ? (
              <View style={s.inspField}>
                <Text style={s.label}>Tipo de uso</Text>
                <Text style={s.valueNormal}>{ordenData.tipoUso}</Text>
              </View>
            ) : null}
            {ordenData.areaTerreno ? (
              <View style={s.inspField}>
                <Text style={s.label}>Área terreno (m²)</Text>
                <Text style={s.valueNormal}>{ordenData.areaTerreno}</Text>
              </View>
            ) : null}
            {ordenData.diametroToma ? (
              <View style={s.inspField}>
                <Text style={s.label}>Diámetro toma</Text>
                <Text style={s.valueNormal}>{ordenData.diametroToma}</Text>
              </View>
            ) : null}
            {ordenData.materialCalle ? (
              <View style={s.inspField}>
                <Text style={s.label}>Material calle</Text>
                <Text style={s.valueNormal}>{mat(ordenData.materialCalle)}</Text>
              </View>
            ) : null}
            {ordenData.materialBanqueta ? (
              <View style={s.inspField}>
                <Text style={s.label}>Material banqueta</Text>
                <Text style={s.valueNormal}>{mat(ordenData.materialBanqueta)}</Text>
              </View>
            ) : null}
            {(ordenData.metrosRupturaAguaCalle ?? ordenData.metrosRupturaCalle) ? (
              <View style={s.inspField}>
                <Text style={s.label}>Metros ruptura calle</Text>
                <Text style={s.valueNormal}>{ordenData.metrosRupturaAguaCalle ?? ordenData.metrosRupturaCalle} ml</Text>
              </View>
            ) : null}
            {(ordenData.metrosRupturaAguaBanqueta ?? ordenData.metrosRupturaBanqueta) ? (
              <View style={s.inspField}>
                <Text style={s.label}>Metros ruptura banqueta</Text>
                <Text style={s.valueNormal}>{ordenData.metrosRupturaAguaBanqueta ?? ordenData.metrosRupturaBanqueta} ml</Text>
              </View>
            ) : null}
            {ordenData.inspectorNombre ? (
              <View style={s.inspField}>
                <Text style={s.label}>Inspector</Text>
                <Text style={s.valueNormal}>{ordenData.inspectorNombre}</Text>
              </View>
            ) : null}
          </View>
          {ordenData.observaciones ? (
            <View style={{ marginTop: 6 }}>
              <Text style={s.label}>Observaciones</Text>
              <Text style={s.valueNormal}>{ordenData.observaciones}</Text>
            </View>
          ) : null}
          {ordenData.resultadoInspeccion ? (
            <View style={{ marginTop: 6 }}>
              <Text style={s.label}>Resultado</Text>
              <Text style={s.valueNormal}>{ordenData.resultadoInspeccion}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Cuantificación y cotización ───────────────────────────── */}
        <Text style={s.sectionTitle}>Cuantificación y cotización</Text>
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={[s.th, { flex: 3 }]}>Concepto</Text>
            <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Cant.</Text>
            <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Unidad</Text>
            <Text style={[s.th, { flex: 1.2, textAlign: 'right' }]}>P.U.</Text>
            <Text style={[s.th, { flex: 1.3, textAlign: 'right' }]}>Subtotal</Text>
          </View>
          {conceptos.map((c, i) => {
            const isLast = i === conceptos.length - 1;
            const rowStyle = isLast ? s.tableRowLast : i % 2 === 0 ? s.tableRow : s.tableRowAlt;
            return (
              <View key={c.descripcion} style={rowStyle}>
                <Text style={[s.td, { flex: 3 }]}>{c.descripcion}</Text>
                <Text style={[s.tdRight, { flex: 1 }]}>{c.cantidad}</Text>
                <Text style={[s.tdRight, { flex: 1 }]}>{c.unidad}</Text>
                <Text style={[s.tdRight, { flex: 1.2 }]}>{MXN.format(c.precioUnitario)}</Text>
                <Text style={[s.tdRight, { flex: 1.3 }]}>{MXN.format(c.subtotal)}</Text>
              </View>
            );
          })}
          <View style={s.totalRow}>
            <Text style={[s.totalLabel, { flex: 6.2 }]}>Total estimado</Text>
            <Text style={[s.totalValue, { flex: 1.3 }]}>{MXN.format(total)}</Text>
          </View>
        </View>

        {/* ── Vigencia ──────────────────────────────────────────────── */}
        <Text style={{ fontSize: 7.5, color: GRAY, marginTop: 4 }}>
          * Los precios son estimados y pueden ajustarse según las condiciones del terreno. Vigencia: {vigencia}.
        </Text>

        {/* ── Firma ─────────────────────────────────────────────────── */}
        <View style={{ marginTop: 32, flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center', width: 160 }}>
            <View style={{ borderTopWidth: 1, borderTopColor: DARK, width: '100%', marginBottom: 4 }} />
            <Text style={{ fontSize: 8 }}>CEA Querétaro</Text>
            <Text style={{ fontSize: 7, color: GRAY }}>Firma autorizada</Text>
          </View>
          <View style={{ alignItems: 'center', width: 160 }}>
            <View style={{ borderTopWidth: 1, borderTopColor: DARK, width: '100%', marginBottom: 4 }} />
            <Text style={{ fontSize: 8 }}>{nombre}</Text>
            <Text style={{ fontSize: 7, color: GRAY }}>Titular / Solicitante</Text>
          </View>
        </View>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            CEA Querétaro — Sistema de Gestión de Agua Potable | Documento generado el {fechaDoc} | Folio {record.folio}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

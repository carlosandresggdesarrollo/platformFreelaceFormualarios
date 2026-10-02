import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

export interface RespuestaIndividual {
  idPregunta: number;
  textoPregunta: string;
  orden: number;
  textoOpcion: string | null;
  esCorrecta: string | null;
}

export interface SesionRespuesta {
  idSesion: number;
  nombreParticipante: string | null;
  emailParticipante: string | null;
  sexo: string | null;
  edad: number | null;
  pais: string | null;
  estado: string | null;
  municipio: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  respuestas: RespuestaIndividual[];
}

export interface PreguntaStats {
  idPregunta: number;
  textoPregunta: string;
  opciones: {
    idOpcion: number;
    textoOpcion: string;
    esCorrecta: string;
    selecciones: string;
  }[];
}

export interface FormularioDashboard {
  idCuestionario: number;
  titulo: string;
  estado: string;
  visitas: number;
  visitasUnicas: number;
  respuestas: number;
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function fechaStr(): string {
  return new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function addHeader(doc: jsPDF, title: string, subtitle?: string): number {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);
  let y = 28;
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, y);
    y += 6;
  }
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generado: ${fechaStr()}`, 14, y);
  doc.setTextColor(0);
  return y + 8;
}

function addPageNumbers(doc: jsPDF): void {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Pagina ${i} de ${total}`, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    doc.setTextColor(0);
  }
}

// ----------------------------------------------------------------------
// Report A — Individual response PDF
// ----------------------------------------------------------------------

export function generateIndividualPDF(formTitle: string, session: SesionRespuesta): void {
  const doc = new jsPDF();
  const y = addHeader(doc, formTitle, 'Reporte de respuesta individual');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Participante:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text(session.nombreParticipante || 'Anonimo', 50, y);

  if (session.emailParticipante) {
    doc.text(`Email: ${session.emailParticipante}`, 14, y + 6);
  }
  if (session.fechaFin) {
    doc.text(`Fecha: ${new Date(session.fechaFin).toLocaleString('es-MX')}`, 14, y + (session.emailParticipante ? 12 : 6));
  }

  const tableY = y + (session.emailParticipante ? 20 : 14);

  autoTable(doc, {
    startY: tableY,
    head: [['#', 'Pregunta', 'Respuesta', 'Correcta']],
    body: session.respuestas.map((r, i) => [
      String(i + 1),
      r.textoPregunta,
      r.textoOpcion || '-',
      Number(r.esCorrecta) === 1 ? 'Si' : 'No',
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [66, 66, 66] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
    },
  });

  addPageNumbers(doc);
  const nombre = (session.nombreParticipante || 'anonimo').replace(/\s+/g, '_');
  doc.save(`respuesta_${nombre}_${session.idSesion}.pdf`);
}

// ----------------------------------------------------------------------
// Report A — Individual responses Excel (all sessions)
// ----------------------------------------------------------------------

export function generateIndividualExcel(formTitle: string, sessions: SesionRespuesta[]): void {
  const rows = sessions.flatMap((s) =>
    s.respuestas.map((r) => ({
      Sesion: s.idSesion,
      Participante: s.nombreParticipante || 'Anonimo',
      Email: s.emailParticipante || '',
      Fecha: s.fechaFin ? new Date(s.fechaFin).toLocaleString('es-MX') : '',
      Pregunta: r.textoPregunta,
      Respuesta: r.textoOpcion || '-',
      Correcta: Number(r.esCorrecta) === 1 ? 'Si' : 'No',
    }))
  );

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 8 }, { wch: 25 }, { wch: 25 }, { wch: 20 },
    { wch: 40 }, { wch: 30 }, { wch: 10 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Respuestas');
  XLSX.writeFile(wb, `respuestas_${formTitle.replace(/\s+/g, '_')}.xlsx`);
}

// ----------------------------------------------------------------------
// Report B — Question stats PDF
// ----------------------------------------------------------------------

export function generateQuestionStatsPDF(
  formTitle: string,
  totalResponses: number,
  questions: PreguntaStats[]
): void {
  const doc = new jsPDF();
  let y = addHeader(doc, formTitle, `Estadisticas por pregunta — ${totalResponses} respuestas totales`);

  questions.forEach((q, qi) => {
    const totalSel = q.opciones.reduce((s, o) => s + Number(o.selecciones), 0);

    if (y > 250) { doc.addPage(); y = 20; }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${qi + 1}. ${q.textoPregunta}`, 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Opcion', 'Selecciones', 'Porcentaje', 'Correcta']],
      body: q.opciones.map((o) => {
        const pct = totalSel > 0 ? Math.round((Number(o.selecciones) / totalSel) * 100) : 0;
        return [
          o.textoOpcion,
          o.selecciones,
          `${pct}%`,
          Number(o.esCorrecta) === 1 ? 'Si' : 'No',
        ];
      }),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [66, 66, 66] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
      },
      didDrawPage: () => {},
    });

    y = (doc as any).lastAutoTable?.finalY + 10 || y + 30;
  });

  addPageNumbers(doc);
  doc.save(`estadisticas_${formTitle.replace(/\s+/g, '_')}.pdf`);
}

// ----------------------------------------------------------------------
// Report B — Question stats Excel
// ----------------------------------------------------------------------

export function generateQuestionStatsExcel(
  formTitle: string,
  totalResponses: number,
  questions: PreguntaStats[]
): void {
  const rows = questions.flatMap((q) => {
    const totalSel = q.opciones.reduce((s, o) => s + Number(o.selecciones), 0);
    return q.opciones.map((o) => {
      const pct = totalSel > 0 ? Math.round((Number(o.selecciones) / totalSel) * 100) : 0;
      return {
        Pregunta: q.textoPregunta,
        Opcion: o.textoOpcion,
        Selecciones: Number(o.selecciones),
        Porcentaje: `${pct}%`,
        Correcta: Number(o.esCorrecta) === 1 ? 'Si' : 'No',
      };
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 40 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Estadisticas');
  XLSX.writeFile(wb, `estadisticas_${formTitle.replace(/\s+/g, '_')}.xlsx`);
}

// ----------------------------------------------------------------------
// Report C — General comparison PDF
// ----------------------------------------------------------------------

export function generateGeneralPDF(
  stats: { totalFormularios: number; totalVisitas: number; visitantesUnicos: number; totalRespuestas: number },
  forms: FormularioDashboard[]
): void {
  const doc = new jsPDF('landscape');
  const y = addHeader(doc, 'Reporte General de Formularios');

  doc.setFontSize(10);
  doc.text(`Total formularios: ${stats.totalFormularios}  |  Visitas: ${stats.totalVisitas}  |  Visitantes unicos: ${stats.visitantesUnicos}  |  Respuestas: ${stats.totalRespuestas}`, 14, y);

  autoTable(doc, {
    startY: y + 8,
    head: [['Titulo', 'Estado', 'Visitas', 'Visitas Unicas', 'Respuestas']],
    body: forms.map((f) => [
      f.titulo,
      f.estado,
      String(f.visitas),
      String(f.visitasUnicas),
      String(f.respuestas),
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [66, 66, 66] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
    },
  });

  addPageNumbers(doc);
  doc.save('reporte_general_formularios.pdf');
}

// ----------------------------------------------------------------------
// Report C — General comparison Excel
// ----------------------------------------------------------------------

export function generateGeneralExcel(
  stats: { totalFormularios: number; totalVisitas: number; visitantesUnicos: number; totalRespuestas: number },
  forms: FormularioDashboard[]
): void {
  const summaryRows = [
    { Metrica: 'Total Formularios', Valor: stats.totalFormularios },
    { Metrica: 'Total Visitas', Valor: stats.totalVisitas },
    { Metrica: 'Visitantes Unicos', Valor: stats.visitantesUnicos },
    { Metrica: 'Total Respuestas', Valor: stats.totalRespuestas },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 22 }, { wch: 14 }];

  const formRows = forms.map((f) => ({
    Titulo: f.titulo,
    Estado: f.estado,
    Visitas: f.visitas,
    'Visitas Unicas': f.visitasUnicas,
    Respuestas: f.respuestas,
  }));
  const wsDetail = XLSX.utils.json_to_sheet(formRows);
  wsDetail['!cols'] = [
    { wch: 35 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Formularios');
  XLSX.writeFile(wb, 'reporte_general_formularios.xlsx');
}

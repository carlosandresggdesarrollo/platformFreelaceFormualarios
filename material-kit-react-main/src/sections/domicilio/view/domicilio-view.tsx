import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import { keyframes } from '@mui/system';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// Animaciones para el fondo
const float1 = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.7; }
  25% { transform: translate(10px, -20px) rotate(5deg); opacity: 1; }
  50% { transform: translate(-5px, -35px) rotate(-3deg); opacity: 0.8; }
  75% { transform: translate(15px, -15px) rotate(8deg); opacity: 0.9; }
`;

const float2 = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.6; }
  33% { transform: translate(-15px, -25px) rotate(-5deg); opacity: 1; }
  66% { transform: translate(10px, -40px) rotate(3deg); opacity: 0.7; }
`;

const float3 = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.5; }
  50% { transform: translate(20px, -30px) rotate(10deg); opacity: 1; }
`;

const float4 = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(-5deg); opacity: 0.6; }
  25% { transform: translate(-20px, -15px) rotate(0deg); opacity: 0.9; }
  50% { transform: translate(-10px, -40px) rotate(5deg); opacity: 1; }
  75% { transform: translate(5px, -25px) rotate(-3deg); opacity: 0.8; }
`;

const float5 = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(3deg); opacity: 0.5; }
  20% { transform: translate(15px, -10px) rotate(-2deg); opacity: 0.7; }
  40% { transform: translate(25px, -30px) rotate(5deg); opacity: 1; }
  60% { transform: translate(10px, -45px) rotate(0deg); opacity: 0.8; }
  80% { transform: translate(-5px, -20px) rotate(-5deg); opacity: 0.6; }
`;

const float6 = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(2deg); opacity: 0.55; }
  30% { transform: translate(-12px, -18px) rotate(-4deg); opacity: 0.85; }
  60% { transform: translate(8px, -38px) rotate(6deg); opacity: 1; }
  90% { transform: translate(-5px, -12px) rotate(0deg); opacity: 0.7; }
`;

const floatSlow = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.4; }
  50% { transform: translate(10px, -50px) rotate(15deg); opacity: 0.8; }
`;

const floatSlow2 = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(-3deg); opacity: 0.35; }
  50% { transform: translate(-15px, -45px) rotate(12deg); opacity: 0.75; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.5; }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
`;

// Componente de sobre flotante
const FloatingEnvelope = ({
  size,
  top,
  left,
  delay,
  duration,
  animation,
  opacity = 0.6,
  blur = false,
}: {
  size: number;
  top: string;
  left: string;
  delay: string;
  duration: string;
  animation: any;
  opacity?: number;
  blur?: boolean;
}) => (
  <Box
    sx={{
      position: 'absolute',
      top,
      left,
      width: size,
      height: size * 0.7,
      border: `2px solid rgba(255,255,255,${opacity})`,
      borderRadius: 1,
      animation: `${animation} ${duration} ease-in-out infinite`,
      animationDelay: delay,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: blur ? 'blur(4px)' : 'none',
      background: `rgba(255,255,255,${opacity * 0.2})`,
      boxShadow: blur ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderTop: `${size / 3}px solid rgba(255,255,255,${opacity * 0.6})`,
      },
    }}
  />
);

// Componente de partícula brillante
const Sparkle = ({ top, left, delay }: { top: string; left: string; delay: string }) => (
  <Box
    sx={{
      position: 'absolute',
      top,
      left,
      width: 6,
      height: 6,
      borderRadius: '50%',
      bgcolor: 'rgba(255,255,255,0.8)',
      animation: `${sparkle} 3s ease-in-out infinite`,
      animationDelay: delay,
      boxShadow: '0 0 10px rgba(255,255,255,0.5)',
    }}
  />
);

// ----------------------------------------------------------------------

export function DomicilioView() {
  const router = useRouter();

  // Estados del formulario
  const [idDatosGenerales, setIdDatosGenerales] = useState(0);
  const [calle, setCalle] = useState('');
  const [noExterior, setNoExterior] = useState('');
  const [noInterior, setNoInterior] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [colonia, setColonia] = useState('');
  const [idPais, setIdPais] = useState('0');
  const [idEstado, setIdEstado] = useState('0');
  const [idMunicipio, setIdMunicipio] = useState('0');

  // Catalogos
  const [paises, setPaises] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const [municipios, setMunicipios] = useState<any[]>([]);

  // Errores
  const [calleError, setCalleError] = useState(false);
  const [noExteriorError, setNoExteriorError] = useState(false);
  const [codigoPostalError, setCodigoPostalError] = useState(false);
  const [coloniaError, setColoniaError] = useState(false);
  const [paisError, setPaisError] = useState(false);
  const [estadoError, setEstadoError] = useState(false);
  const [municipioError, setMunicipioError] = useState(false);

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Mensajes
  const [messageModal, setMessageModal] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'warning'>('success');
  const [messageText, setMessageText] = useState('');

  // ----------------------------------------------------------------------
  // API CALLS
  // ----------------------------------------------------------------------

  const fetchDatosGenerales = async () => {
    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuloSolicitudDomicilio/api/administrador.controller.select.full.php`, {
        method: 'POST',
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching datos generales:', error);
      return { message: 'Error' };
    }
  };

  const fetchPaises = async () => {
    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuloSolicitudDomicilio/api/administrador.controller.select.pais.full.php`, {
        method: 'POST',
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching paises:', error);
      return { message: 'Error' };
    }
  };

  const fetchEstados = async () => {
    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuloSolicitudDomicilio/api/administrador.controller.select.estado.full.php`, {
        method: 'POST',
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching estados:', error);
      return { message: 'Error' };
    }
  };

  const fetchMunicipios = async () => {
    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuloSolicitudDomicilio/api/administrador.controller.select.municipio.full.php`, {
        method: 'POST',
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching municipios:', error);
      return { message: 'Error' };
    }
  };

  const saveDomicilio = async () => {
    const formData = new FormData();
    formData.append('txt_idDatosGenerales', String(idDatosGenerales));
    formData.append('txt_calle', calle);
    formData.append('txt_noExterior', noExterior);
    formData.append('txt_noInterior', noInterior);
    formData.append('txt_codigoPostal', codigoPostal);
    formData.append('txt_colonia', colonia);
    formData.append('cb_idPais', idPais);
    formData.append('cb_idEstado', idEstado);
    formData.append('cb_idMunicipio', idMunicipio);

    try {
      const response = await fetch(`${CONFIG.apiBase}/Modules/ModuloSolicitudDomicilio/api/administrador.controller.crear.php`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      return await response.json();
    } catch (error) {
      console.error('Error saving domicilio:', error);
      return { message: 'Error' };
    }
  };

  // ----------------------------------------------------------------------
  // EFFECTS
  // ----------------------------------------------------------------------

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Cargar catalogos en paralelo
      const [paisesRes, estadosRes, municipiosRes, datosRes] = await Promise.all([
        fetchPaises(),
        fetchEstados(),
        fetchMunicipios(),
        fetchDatosGenerales(),
      ]);

      if (paisesRes.message === 'Good') {
        setPaises(paisesRes.information || []);
      }
      if (estadosRes.message === 'Good') {
        setEstados(estadosRes.information || []);
      }
      if (municipiosRes.message === 'Good') {
        setMunicipios(municipiosRes.information || []);
      }

      // Cargar datos existentes si los hay
      if (datosRes.message === 'Good' && datosRes.information?.length > 0) {
        const dg = datosRes.information[0];
        setIdDatosGenerales(dg.idDgenerales || 0);
        setCalle(dg.calle || '');
        setNoExterior(dg.noExterior || '');
        setNoInterior(dg.noInterior || '');
        setCodigoPostal(dg.codigoPostal || '');
        setColonia(dg.colonia || '');
        setIdPais(dg.idPais || '0');
        setIdEstado(dg.idEstado || '0');
        setIdMunicipio(dg.idMunicipio || '0');
      }

      setLoading(false);
    };

    loadData();
  }, []);

  // ----------------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------------

  const limpiarCaracteresEspeciales = (texto: string) => texto.replace(/['"`]/g, '');

  const handleSave = async () => {
    // Limpiar caracteres especiales
    const calleLimpia = limpiarCaracteresEspeciales(calle);
    const noExteriorLimpio = limpiarCaracteresEspeciales(noExterior);
    const noInteriorLimpio = limpiarCaracteresEspeciales(noInterior);
    const codigoPostalLimpio = limpiarCaracteresEspeciales(codigoPostal);
    const coloniaLimpia = limpiarCaracteresEspeciales(colonia);

    setCalle(calleLimpia);
    setNoExterior(noExteriorLimpio);
    setNoInterior(noInteriorLimpio);
    setCodigoPostal(codigoPostalLimpio);
    setColonia(coloniaLimpia);

    // Reset errores
    setCalleError(false);
    setNoExteriorError(false);
    setCodigoPostalError(false);
    setColoniaError(false);
    setPaisError(false);
    setEstadoError(false);
    setMunicipioError(false);

    // Validacion campos obligatorios
    let hasError = false;

    if (!calleLimpia) {
      setCalleError(true);
      hasError = true;
    }
    if (!noExteriorLimpio) {
      setNoExteriorError(true);
      hasError = true;
    }
    if (!codigoPostalLimpio) {
      setCodigoPostalError(true);
      hasError = true;
    }
    if (!coloniaLimpia) {
      setColoniaError(true);
      hasError = true;
    }
    if (idPais === '0') {
      setPaisError(true);
      hasError = true;
    }
    if (idEstado === '0') {
      setEstadoError(true);
      hasError = true;
    }
    if (idMunicipio === '0') {
      setMunicipioError(true);
      hasError = true;
    }

    if (hasError) {
      setMessageType('warning');
      setMessageText('Asegurate de llenar los campos requeridos antes de continuar.');
      setMessageModal(true);
      return;
    }

    setIsSaving(true);

    const result = await saveDomicilio();

    setIsSaving(false);

    if (result.message === 'Good') {
      // Actualizar el estatus en localStorage
      const jsonInfoStr = localStorage.getItem('JSON_INFORMACION');
      if (jsonInfoStr) {
        try {
          const jsonInfo = JSON.parse(atob(jsonInfoStr));
          jsonInfo.estatus = 'ACTIVO';
          localStorage.setItem('JSON_INFORMACION', btoa(JSON.stringify(jsonInfo)));
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
      }

      // También actualizar el usuario en localStorage
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        try {
          const usuario = JSON.parse(usuarioStr);
          usuario.estatus = 'ACTIVO';
          localStorage.setItem('usuario', JSON.stringify(usuario));
        } catch (e) {
          console.error('Error updating usuario:', e);
        }
      }

      setMessageType('success');
      setMessageText('¡Dirección guardada correctamente!');
      setMessageModal(true);
    } else {
      setMessageType('error');
      setMessageText('Algo salio mal. El sistema no pudo completar la accion. Intenta de nuevo.');
      setMessageModal(true);
    }
  };

  const handleMessageClose = () => {
    setMessageModal(false);
    if (messageType === 'success') {
      // El módulo CLIENTE fue eliminado: tras guardar el domicilio se va al dashboard.
      router.push('/dashboard');
    }
  };

  // Filtrar estados por pais seleccionado
  const estadosFiltrados = estados.filter(e => String(e.idPais) === String(idPais) || idPais === '0');

  // Filtrar municipios por estado seleccionado
  const municipiosFiltrados = municipios.filter(m => String(m.idEstado) === String(idEstado) || idEstado === '0');

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
      }}
    >
      {/* ========== FONDO ANIMADO ========== */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(-45deg, #0097A7, #00BCD4, #0288D1, #26C6DA, #0097A7)',
          backgroundSize: '400% 400%',
          animation: `${gradientMove} 15s ease infinite`,
          zIndex: 0,
        }}
      >
        {/* Círculos de fondo animados */}
        <Box sx={{ position: 'absolute', top: '10%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', animation: `${pulse} 4s ease-in-out infinite` }} />
        <Box sx={{ position: 'absolute', bottom: '20%', right: '5%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', animation: `${pulse} 5s ease-in-out infinite`, animationDelay: '1s' }} />
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', animation: `${pulse} 6s ease-in-out infinite`, animationDelay: '2s' }} />
        <Box sx={{ position: 'absolute', top: '30%', right: '20%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', animation: `${pulse} 7s ease-in-out infinite`, animationDelay: '3s' }} />

        {/* ========== SOBRES FLOTANTES - CAPA TRASERA ========== */}
        <FloatingEnvelope size={25} top="2%" left="3%" delay="0s" duration="15s" animation={floatSlow} opacity={0.3} />
        <FloatingEnvelope size={30} top="5%" left="12%" delay="2s" duration="14s" animation={floatSlow} opacity={0.25} />
        <FloatingEnvelope size={20} top="8%" left="22%" delay="1s" duration="16s" animation={floatSlow2} opacity={0.3} />
        <FloatingEnvelope size={28} top="3%" left="32%" delay="3s" duration="13s" animation={floatSlow} opacity={0.28} />
        <FloatingEnvelope size={22} top="6%" left="42%" delay="0.5s" duration="17s" animation={floatSlow2} opacity={0.25} />
        <FloatingEnvelope size={26} top="4%" left="52%" delay="4s" duration="14s" animation={floatSlow} opacity={0.3} />
        <FloatingEnvelope size={24} top="7%" left="62%" delay="2.5s" duration="15s" animation={floatSlow2} opacity={0.28} />
        <FloatingEnvelope size={21} top="2%" left="72%" delay="1.5s" duration="16s" animation={floatSlow} opacity={0.25} />
        <FloatingEnvelope size={27} top="5%" left="82%" delay="3.5s" duration="14s" animation={floatSlow2} opacity={0.3} />
        <FloatingEnvelope size={23} top="8%" left="92%" delay="0.8s" duration="15s" animation={floatSlow} opacity={0.28} />

        <FloatingEnvelope size={26} top="18%" left="5%" delay="4s" duration="14s" animation={floatSlow} opacity={0.3} />
        <FloatingEnvelope size={24} top="22%" left="95%" delay="2.5s" duration="15s" animation={floatSlow2} opacity={0.28} />

        <FloatingEnvelope size={28} top="35%" left="2%" delay="1.5s" duration="16s" animation={floatSlow} opacity={0.25} />
        <FloatingEnvelope size={22} top="38%" left="97%" delay="3.5s" duration="14s" animation={floatSlow2} opacity={0.3} />

        <FloatingEnvelope size={28} top="52%" left="3%" delay="1.5s" duration="16s" animation={floatSlow} opacity={0.25} />
        <FloatingEnvelope size={22} top="55%" left="95%" delay="3.5s" duration="14s" animation={floatSlow2} opacity={0.3} />

        <FloatingEnvelope size={25} top="72%" left="5%" delay="0.8s" duration="15s" animation={floatSlow} opacity={0.28} />
        <FloatingEnvelope size={30} top="75%" left="15%" delay="2.2s" duration="13s" animation={floatSlow2} opacity={0.25} />
        <FloatingEnvelope size={23} top="78%" left="85%" delay="1.8s" duration="16s" animation={floatSlow} opacity={0.3} />
        <FloatingEnvelope size={27} top="85%" left="50%" delay="0.4s" duration="15s" animation={floatSlow} opacity={0.26} />
        <FloatingEnvelope size={24} top="90%" left="78%" delay="1.3s" duration="14s" animation={floatSlow} opacity={0.28} />
        <FloatingEnvelope size={26} top="92%" left="88%" delay="3.8s" duration="16s" animation={floatSlow2} opacity={0.25} />

        {/* ========== SOBRES FLOTANTES - CAPA MEDIA ========== */}
        <FloatingEnvelope size={45} top="10%" left="8%" delay="0s" duration="10s" animation={float1} opacity={0.5} />
        <FloatingEnvelope size={40} top="12%" left="20%" delay="1.5s" duration="11s" animation={float2} opacity={0.45} />
        <FloatingEnvelope size={50} top="8%" left="35%" delay="0.8s" duration="9s" animation={float3} opacity={0.5} />
        <FloatingEnvelope size={38} top="14%" left="50%" delay="2s" duration="12s" animation={float4} opacity={0.48} />
        <FloatingEnvelope size={42} top="10%" left="65%" delay="0.3s" duration="10s" animation={float5} opacity={0.5} />
        <FloatingEnvelope size={48} top="12%" left="80%" delay="1.2s" duration="11s" animation={float6} opacity={0.45} />
        <FloatingEnvelope size={35} top="16%" left="92%" delay="2.2s" duration="10s" animation={float1} opacity={0.48} />

        <FloatingEnvelope size={38} top="28%" left="5%" delay="2s" duration="12s" animation={float4} opacity={0.48} />
        <FloatingEnvelope size={42} top="32%" left="18%" delay="0.3s" duration="10s" animation={float5} opacity={0.5} />
        <FloatingEnvelope size={36} top="34%" left="82%" delay="2.8s" duration="9s" animation={float6} opacity={0.47} />
        <FloatingEnvelope size={40} top="32%" left="92%" delay="1.8s" duration="10s" animation={float3} opacity={0.46} />

        <FloatingEnvelope size={44} top="48%" left="6%" delay="2.5s" duration="9s" animation={float2} opacity={0.5} />
        <FloatingEnvelope size={40} top="52%" left="18%" delay="0.6s" duration="12s" animation={float3} opacity={0.48} />
        <FloatingEnvelope size={43} top="48%" left="82%" delay="0.9s" duration="9s" animation={float5} opacity={0.5} />
        <FloatingEnvelope size={47} top="56%" left="92%" delay="1.4s" duration="10s" animation={float2} opacity={0.49} />

        <FloatingEnvelope size={42} top="68%" left="4%" delay="1s" duration="11s" animation={float5} opacity={0.5} />
        <FloatingEnvelope size={38} top="72%" left="16%" delay="2.2s" duration="9s" animation={float1} opacity={0.48} />
        <FloatingEnvelope size={46} top="72%" left="85%" delay="0.7s" duration="9s" animation={float4} opacity={0.49} />
        <FloatingEnvelope size={41} top="76%" left="92%" delay="1.9s" duration="12s" animation={float5} opacity={0.46} />

        <FloatingEnvelope size={45} top="85%" left="8%" delay="3.1s" duration="10s" animation={float3} opacity={0.48} />
        <FloatingEnvelope size={48} top="88%" left="25%" delay="0.5s" duration="11s" animation={float6} opacity={0.5} />
        <FloatingEnvelope size={40} top="92%" left="72%" delay="2.7s" duration="10s" animation={float2} opacity={0.49} />
        <FloatingEnvelope size={44} top="88%" left="88%" delay="0.2s" duration="11s" animation={float5} opacity={0.46} />

        {/* ========== SOBRES FLOTANTES - CAPA FRONTAL (blur) ========== */}
        <FloatingEnvelope size={70} top="5%" left="10%" delay="0s" duration="8s" animation={float1} opacity={0.7} blur />
        <FloatingEnvelope size={65} top="8%" left="35%" delay="1s" duration="9s" animation={float2} opacity={0.65} blur />
        <FloatingEnvelope size={72} top="6%" left="60%" delay="2s" duration="10s" animation={float3} opacity={0.68} blur />
        <FloatingEnvelope size={58} top="10%" left="85%" delay="0.5s" duration="8s" animation={float4} opacity={0.62} blur />

        <FloatingEnvelope size={80} top="25%" left="5%" delay="0.5s" duration="10s" animation={float3} opacity={0.7} blur />
        <FloatingEnvelope size={68} top="26%" left="88%" delay="0.8s" duration="8s" animation={float1} opacity={0.67} blur />

        <FloatingEnvelope size={75} top="45%" left="8%" delay="1.5s" duration="9s" animation={float5} opacity={0.7} blur />
        <FloatingEnvelope size={70} top="50%" left="88%" delay="3s" duration="10s" animation={float6} opacity={0.64} blur />

        <FloatingEnvelope size={72} top="62%" left="6%" delay="2.5s" duration="8s" animation={float2} opacity={0.7} blur />
        <FloatingEnvelope size={74} top="66%" left="90%" delay="2.1s" duration="8s" animation={float1} opacity={0.69} blur />

        <FloatingEnvelope size={76} top="80%" left="12%" delay="1.8s" duration="9s" animation={float4} opacity={0.7} blur />
        <FloatingEnvelope size={82} top="85%" left="35%" delay="0.4s" duration="10s" animation={float5} opacity={0.68} blur />
        <FloatingEnvelope size={70} top="88%" left="78%" delay="1s" duration="11s" animation={float1} opacity={0.67} blur />

        {/* ========== PARTÍCULAS BRILLANTES ========== */}
        <Sparkle top="3%" left="8%" delay="0s" />
        <Sparkle top="5%" left="25%" delay="0.3s" />
        <Sparkle top="8%" left="42%" delay="0.6s" />
        <Sparkle top="4%" left="58%" delay="0.9s" />
        <Sparkle top="7%" left="75%" delay="1.2s" />
        <Sparkle top="6%" left="92%" delay="1.5s" />
        <Sparkle top="18%" left="12%" delay="0.2s" />
        <Sparkle top="22%" left="88%" delay="0.5s" />
        <Sparkle top="35%" left="5%" delay="1.4s" />
        <Sparkle top="40%" left="95%" delay="2.3s" />
        <Sparkle top="52%" left="8%" delay="0.4s" />
        <Sparkle top="58%" left="92%" delay="1.3s" />
        <Sparkle top="68%" left="8%" delay="1.6s" />
        <Sparkle top="75%" left="92%" delay="2.5s" />
        <Sparkle top="85%" left="18%" delay="0.45s" />
        <Sparkle top="88%" left="45%" delay="0.75s" />
        <Sparkle top="92%" left="88%" delay="1.35s" />

        {/* Líneas decorativas */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.08,
            backgroundImage: `
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </Box>

      {/* Loading overlay */}
      {(loading || isSaving) && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} sx={{ color: 'white' }} />
        </Box>
      )}

      {/* Formulario */}
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 4,
          p: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxWidth: 600,
          width: '100%',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeIn 0.6s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0288D1 0%, #0097A7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 20px rgba(2,136,209,0.3)',
            }}
          >
            <Iconify icon={"solar:home-2-bold" as any}  width={40} sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#333' }}>
            Datos de Direccion
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            Completa tu direccion para activar tu cuenta
          </Typography>
        </Box>

        {/* Campos del formulario */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Calle */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#444' }}>
              Calle <span style={{ color: '#E91E63' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Nombre de la calle"
              value={calle}
              onChange={(e) => {
                setCalle(e.target.value);
                setCalleError(false);
              }}
              error={calleError}
              helperText={calleError ? 'Este campo es obligatorio' : ''}
              inputProps={{ maxLength: 180 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* No. Exterior y No. Interior */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#444' }}>
                No. Exterior <span style={{ color: '#E91E63' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="No. Ext"
                value={noExterior}
                onChange={(e) => {
                  setNoExterior(e.target.value);
                  setNoExteriorError(false);
                }}
                error={noExteriorError}
                helperText={noExteriorError ? 'Requerido' : ''}
                inputProps={{ maxLength: 18 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#444' }}>
                No. Interior
              </Typography>
              <TextField
                fullWidth
                placeholder="No. Int (opcional)"
                value={noInterior}
                onChange={(e) => setNoInterior(e.target.value)}
                inputProps={{ maxLength: 18 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Codigo Postal y Colonia */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#444' }}>
                Codigo Postal <span style={{ color: '#E91E63' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="C.P."
                value={codigoPostal}
                onChange={(e) => {
                  setCodigoPostal(e.target.value.replace(/\D/g, ''));
                  setCodigoPostalError(false);
                }}
                error={codigoPostalError}
                helperText={codigoPostalError ? 'Requerido' : ''}
                inputProps={{ maxLength: 10 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#444' }}>
                Colonia <span style={{ color: '#E91E63' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                placeholder="Colonia"
                value={colonia}
                onChange={(e) => {
                  setColonia(e.target.value);
                  setColoniaError(false);
                }}
                error={coloniaError}
                helperText={coloniaError ? 'Requerido' : ''}
                inputProps={{ maxLength: 180 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Pais */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#444' }}>
              Pais <span style={{ color: '#E91E63' }}>*</span>
            </Typography>
            <TextField
              select
              fullWidth
              value={idPais}
              onChange={(e) => {
                setIdPais(e.target.value);
                setIdEstado('0');
                setIdMunicipio('0');
                setPaisError(false);
              }}
              error={paisError}
              helperText={paisError ? 'Selecciona un pais' : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="0">-- SELECCIONAR --</MenuItem>
              {paises.map((pais) => (
                <MenuItem key={pais.idPais} value={pais.idPais}>
                  {pais.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Estado */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#444' }}>
              Estado <span style={{ color: '#E91E63' }}>*</span>
            </Typography>
            <TextField
              select
              fullWidth
              value={idEstado}
              onChange={(e) => {
                setIdEstado(e.target.value);
                setIdMunicipio('0');
                setEstadoError(false);
              }}
              error={estadoError}
              helperText={estadoError ? 'Selecciona un estado' : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="0">-- SELECCIONAR --</MenuItem>
              {estadosFiltrados.map((estado) => (
                <MenuItem key={estado.idEstado} value={estado.idEstado}>
                  {estado.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Municipio */}
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#444' }}>
              Municipio <span style={{ color: '#E91E63' }}>*</span>
            </Typography>
            <TextField
              select
              fullWidth
              value={idMunicipio}
              onChange={(e) => {
                setIdMunicipio(e.target.value);
                setMunicipioError(false);
              }}
              error={municipioError}
              helperText={municipioError ? 'Selecciona un municipio' : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="0">-- SELECCIONAR --</MenuItem>
              {municipiosFiltrados.map((municipio) => (
                <MenuItem key={municipio.idMunicipio} value={municipio.idMunicipio}>
                  {municipio.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Boton Guardar */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isSaving}
              fullWidth
              sx={{
                background: 'linear-gradient(135deg, #0288D1 0%, #0097A7 100%)',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: '0 4px 15px rgba(2,136,209,0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0277BD 0%, #00838F 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(2,136,209,0.5)',
                },
              }}
            >
              Guardar Direccion
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Modal de Mensajes */}
      <Dialog
        open={messageModal}
        onClose={handleMessageClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              animation: 'slideIn 0.3s ease-out',
              '@keyframes slideIn': {
                '0%': { opacity: 0, transform: 'scale(0.9) translateY(-20px)' },
                '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
              },
            },
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: messageType === 'success'
                ? 'rgba(76, 175, 80, 0.1)'
                : messageType === 'error'
                  ? 'rgba(244, 67, 54, 0.1)'
                  : 'rgba(255, 152, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Iconify
              icon={
                (messageType === 'success'
                  ? 'solar:check-circle-bold'
                  : messageType === 'error'
                    ? 'solar:close-circle-bold'
                    : 'solar:danger-triangle-bold') as any
              }
              width={40}
              sx={{
                color: messageType === 'success'
                  ? '#4caf50'
                  : messageType === 'error'
                    ? '#f44336'
                    : '#ff9800'
              }}
            />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
            {messageType === 'success' ? 'Exito!' : messageType === 'error' ? 'Error' : 'Advertencia'}
          </Typography>

          <Typography variant="body1" sx={{ color: '#666', mb: 4 }}>
            {messageText}
          </Typography>

          <Button
            variant="contained"
            onClick={handleMessageClose}
            fullWidth
            sx={{
              bgcolor: messageType === 'success'
                ? '#4caf50'
                : messageType === 'error'
                  ? '#f44336'
                  : '#ff9800',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': {
                bgcolor: messageType === 'success'
                  ? '#388e3c'
                  : messageType === 'error'
                    ? '#d32f2f'
                    : '#f57c00',
              },
            }}
          >
            Entendido
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

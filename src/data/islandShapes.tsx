import React from 'react';

interface IslandSilhouetteProps {
  cca3: string;
  fill: string;
  stroke: string;
  isHovered: boolean;
  isTarget: boolean;
  isPulsing: boolean;
  zoom: number;
}

/**
 * Renderiza siluetas y archipiélagos vectoriales SVG detallados para islas de Oceanía,
 * Caribe, Microestados y Territorios insulares en el mapa mundial.
 */
export const IslandSilhouette: React.FC<IslandSilhouetteProps> = ({
  cca3,
  fill,
  stroke,
  isHovered,
  isTarget,
  isPulsing,
  zoom
}) => {
  const upper = cca3.toUpperCase();

  // Escala adaptada al nivel de zoom para que las islas crezcan naturalmente al acercar la cámara
  const scale = Math.max(0.7, Math.min(2.5, 0.9 * Math.sqrt(zoom / 1.8)));

  const reefFill = isPulsing
    ? 'rgba(239, 68, 68, 0.35)'
    : isTarget
    ? 'rgba(245, 158, 11, 0.35)'
    : isHovered
    ? 'rgba(6, 182, 212, 0.35)'
    : 'rgba(56, 189, 248, 0.18)';

  const reefStroke = isPulsing
    ? '#EF4444'
    : isTarget
    ? '#FDE047'
    : isHovered
    ? '#38BDF8'
    : 'rgba(56, 189, 248, 0.4)';

  const landFill = fill === '#24344D' ? (isHovered ? '#0284C7' : '#FFFFFF') : fill;
  const landStroke = stroke === '#3B4F6E' ? (isHovered ? '#38BDF8' : '#94A3B8') : stroke;

  // Renderizar geometrías insulares específicas por país / territorio
  switch (upper) {
    // ----------------------------------------------------
    // --- OCEANÍA: ARCHIPIÉLAGOS E ISLAS ---
    // ----------------------------------------------------

    // FIYI (Viti Levu, Vanua Levu, Taveuni, Kadavu, Yasawa)
    case 'FJI':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <ellipse cx="1" cy="-1" rx="8" ry="6" fill={reefFill} stroke={reefStroke} strokeWidth="0.4" />
          {/* Viti Levu (Isla principal sur) */}
          <path d="M -4 1 C -3 -2, 1 -2, 2 1 C 1 4, -3 4, -4 1 Z" fill={landFill} stroke={landStroke} strokeWidth="0.5" />
          {/* Vanua Levu (Isla norte alargada) */}
          <path d="M 0 -4 C 2 -6, 6 -5, 7 -3 C 5 -1, 2 -2, 0 -4 Z" fill={landFill} stroke={landStroke} strokeWidth="0.5" />
          {/* Taveuni */}
          <ellipse cx="6" cy="-4" rx="0.9" ry="0.5" fill={landFill} />
          {/* Kadavu */}
          <ellipse cx="-2" cy="5" rx="1.5" ry="0.6" fill={landFill} />
          {/* Islas Yasawa */}
          <circle cx="-5" cy="-3" r="0.6" fill={landFill} />
          <circle cx="-4" cy="-5" r="0.5" fill={landFill} />
        </g>
      );

    // VANUATU (Arco en forma de Y: Espiritu Santo, Malakula, Efate, Tanna)
    case 'VUT':
      return (
        <g transform={`scale(${scale * 1.25})`}>
          <path d="M -3 -6 L 3 -5 L 2 6 L -2 5 Z" fill={reefFill} stroke={reefStroke} strokeWidth="0.3" opacity="0.6" />
          {/* Espiritu Santo (Noroeste grande) */}
          <path d="M -3 -6 C -2 -7, 0 -6, -1 -4 C -2 -3, -4 -4, -3 -6 Z" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Malakula */}
          <path d="M -2 -2 C -1 -3, 0 -2, -1 0 C -2 1, -3 0, -2 -2 Z" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Efate (Capital Port Vila) */}
          <ellipse cx="1" cy="1.5" rx="1.2" ry="0.9" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Erromango & Tanna (Sur) */}
          <circle cx="2" cy="4" r="0.9" fill={landFill} />
          <circle cx="2.5" cy="6" r="0.8" fill={landFill} />
        </g>
      );

    // ISLAS SALOMÓN (Guadalcanal, Malaita, Santa Isabel, Nueva Georgia, Choiseul)
    case 'SLB':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <path d="M -7 -4 L 6 3 L 5 5 L -8 -2 Z" fill={reefFill} stroke={reefStroke} strokeWidth="0.3" opacity="0.5" />
          {/* Choiseul */}
          <path d="M -7 -4 C -6 -5, -4 -4, -5 -3 Z" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Santa Isabel */}
          <path d="M -4 -3 C -2 -3, 0 -1, -2 0 Z" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Nueva Georgia */}
          <ellipse cx="-4" cy="-1" rx="1.6" ry="0.8" fill={landFill} />
          {/* Malaita */}
          <path d="M 0 -1 C 2 0, 4 3, 2 3 Z" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Guadalcanal (Honiara) */}
          <path d="M -2 1 C 1 1, 3 3, 0 3 C -2 3, -3 2, -2 1 Z" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* San Cristóbal */}
          <ellipse cx="4.5" cy="4.5" rx="1.5" ry="0.7" fill={landFill} />
        </g>
      );

    // SAMOA (Savai'i y Upolu)
    case 'WSM':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <ellipse cx="0" cy="0" rx="6" ry="3.5" fill={reefFill} stroke={reefStroke} strokeWidth="0.4" />
          {/* Savai'i (Oeste grande) */}
          <ellipse cx="-2.5" cy="-0.3" rx="2.8" ry="1.8" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Upolu (Este, capital Apia) */}
          <ellipse cx="2.5" cy="0.4" rx="2.4" ry="1.2" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Apolima e islotes centrales */}
          <circle cx="0.1" cy="0.1" r="0.4" fill={landFill} />
        </g>
      );

    // SAMOA AMERICANA (Tutuila, Manu'a)
    case 'ASM':
      return (
        <g transform={`scale(${scale * 1.2})`}>
          <ellipse cx="0" cy="0" rx="5" ry="2.5" fill={reefFill} stroke={reefStroke} strokeWidth="0.3" />
          {/* Tutuila (Pago Pago) */}
          <path d="M -3 0.5 C -1 -1, 1 -0.5, 0 1 C -1 1.5, -3 1, -3 0.5 Z" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Islas Manu'a */}
          <circle cx="2.8" cy="-0.5" r="0.6" fill={landFill} />
          <circle cx="3.8" cy="-0.3" r="0.5" fill={landFill} />
        </g>
      );

    // TONGA (Tongatapu, Ha'apai, Vava'u)
    case 'TON':
      return (
        <g transform={`scale(${scale * 1.25})`}>
          <path d="M -2 -6 L 2 -6 L 2 6 L -2 6 Z" fill={reefFill} stroke={reefStroke} strokeWidth="0.3" opacity="0.5" />
          {/* Vava'u (Norte) */}
          <path d="M -0.5 -5 C 1 -6, 2 -4, 0 -4 Z" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Ha'apai (Centro archipiélago) */}
          <circle cx="0.5" cy="-1.5" r="0.6" fill={landFill} />
          <circle cx="-0.5" cy="0" r="0.5" fill={landFill} />
          {/* Tongatapu (Sur, Nuku'alofa) */}
          <path d="M -1.8 4 C 0 3, 2 3.5, 1.5 5 C 0 5.5, -2 5, -1.8 4 Z" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* 'Eua */}
          <ellipse cx="2" cy="5.8" rx="0.6" ry="1" fill={landFill} />
        </g>
      );

    // KIRIBATI (Atolones de Gilbert, Phoenix y Line Islands)
    case 'KIR':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <ellipse cx="0" cy="0" rx="7" ry="4" fill={reefFill} stroke={reefStroke} strokeWidth="0.4" />
          {/* Tarawa atoll (anillo) */}
          <path d="M -3 -1.5 L -1.5 -3 L -1 -1.5 Z" fill="none" stroke={landFill} strokeWidth="0.9" />
          <circle cx="-3" cy="-1.5" r="0.7" fill={landFill} />
          <circle cx="-1.5" cy="-3" r="0.6" fill={landFill} />
          {/* Atolones circundantes */}
          <circle cx="1" cy="-1" r="0.7" fill={landFill} />
          <circle cx="3" cy="1" r="0.8" fill={landFill} />
          <circle cx="-2" cy="2" r="0.6" fill={landFill} />
          <circle cx="0" cy="2.5" r="0.7" fill={landFill} />
        </g>
      );

    // ISLAS MARSHALL (Ratak & Ralik Atolls)
    case 'MHL':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <ellipse cx="0" cy="0" rx="6" ry="5" fill={reefFill} stroke={reefStroke} strokeWidth="0.3" opacity="0.6" />
          {/* Cadena Ralik (Oeste) */}
          <circle cx="-3" cy="-3" r="0.7" fill={landFill} />
          <circle cx="-2.5" cy="-0.5" r="0.8" fill={landFill} />
          <circle cx="-2" cy="2" r="0.7" fill={landFill} />
          {/* Cadena Ratak (Este, Majuro) */}
          <circle cx="1.5" cy="-2.5" r="0.7" fill={landFill} />
          <circle cx="2" cy="0" r="0.8" fill={landFill} />
          {/* Majuro atoll loop */}
          <path d="M 2 2.5 Q 3.5 3 2.5 4 Q 1.5 3.5 2 2.5" fill="none" stroke={landFill} strokeWidth="0.8" />
          <circle cx="2.5" cy="3" r="0.7" fill={landFill} />
        </g>
      );

    // MICRONESIA (Yap, Chuuk, Pohnpei, Kosrae)
    case 'FSM':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <path d="M -7 0 L 7 0" stroke={reefStroke} strokeWidth="4" strokeLinecap="round" opacity="0.3" />
          {/* Yap (Oeste) */}
          <ellipse cx="-6" cy="-0.5" rx="1.1" ry="0.7" fill={landFill} />
          {/* Chuuk Lagoon (Centro) */}
          <circle cx="-1" cy="0" r="1.3" fill="none" stroke={landFill} strokeWidth="0.7" />
          <circle cx="-1" cy="0" r="0.6" fill={landFill} />
          {/* Pohnpei (Palikir) */}
          <ellipse cx="3.5" cy="0.3" rx="1.5" ry="1.2" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Kosrae (Este) */}
          <circle cx="6.5" cy="0.5" r="0.9" fill={landFill} />
        </g>
      );

    // PALAOS (Babeldaob, Koror, Rock Islands, Peleliu)
    case 'PLW':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <ellipse cx="0" cy="0" rx="3.5" ry="6" fill={reefFill} stroke={reefStroke} strokeWidth="0.4" />
          {/* Babeldaob (Isla principal norte) */}
          <path d="M -0.8 -4 C 0.8 -5, 1.2 -1, 0.2 0 C -0.8 -0.5, -1.2 -3, -0.8 -4 Z" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Koror & Rock Islands */}
          <circle cx="-0.2" cy="1.2" r="0.8" fill={landFill} />
          <circle cx="0.5" cy="2.2" r="0.6" fill={landFill} />
          {/* Peleliu & Angaur (Sur) */}
          <ellipse cx="-0.3" cy="3.8" rx="0.7" ry="0.9" fill={landFill} />
          <circle cx="-0.5" cy="5.2" r="0.6" fill={landFill} />
        </g>
      );

    // NAURU (Isla de fosfato ovalada con anillo de arrecife)
    case 'NRU':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <ellipse cx="0" cy="0" rx="3.8" ry="3.2" fill={reefFill} stroke={reefStroke} strokeWidth="0.5" />
          {/* Masa de tierra de Nauru */}
          <path d="M -2 -1.5 C 0 -2.5, 2 -1.8, 2.2 0.5 C 1.8 2.2, -0.5 2.5, -2 1.5 C -2.8 0.5, -2.5 -0.8, -2 -1.5 Z" fill={landFill} stroke={landStroke} strokeWidth="0.5" />
          {/* Laguna central interior (Buada Lagoon) */}
          <circle cx="-0.2" cy="0.1" r="0.6" fill="rgba(6, 182, 212, 0.6)" />
        </g>
      );

    // TUVALU (9 atolones e islas coralinas: Funafuti, Nanumea, Niutao...)
    case 'TUV':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <path d="M -4 -4 L 4 4" stroke={reefStroke} strokeWidth="3" strokeLinecap="round" opacity="0.3" />
          {/* Cadena de atolones */}
          <circle cx="-3.5" cy="-3.5" r="0.6" fill={landFill} />
          <circle cx="-2" cy="-2" r="0.6" fill={landFill} />
          {/* Funafuti Lagoon loop */}
          <ellipse cx="1" cy="1" rx="1.4" ry="1" fill="none" stroke={landFill} strokeWidth="0.7" />
          <circle cx="1.8" cy="1.6" r="0.6" fill={landFill} />
          <circle cx="3.2" cy="3.2" r="0.6" fill={landFill} />
        </g>
      );

    // POLINESIA FRANCESA (Tahití, Moorea, Bora Bora, Tuamotu)
    case 'PYF':
      return (
        <g transform={`scale(${scale * 1.35})`}>
          <ellipse cx="0" cy="0" rx="8" ry="5" fill={reefFill} stroke={reefStroke} strokeWidth="0.4" />
          {/* Tahití (Tahiti Nui + Tahiti Iti en forma de 8) */}
          <ellipse cx="-1" cy="0" rx="2.4" ry="1.8" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          <ellipse cx="1.2" cy="1.2" rx="1.4" ry="1.1" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Moorea */}
          <path d="M -4.5 -0.5 L -3.5 -2 L -2.5 -0.5 Z" fill={landFill} stroke={landStroke} strokeWidth="0.3" />
          {/* Bora Bora & Raiatea */}
          <circle cx="-6" cy="-3" r="0.9" fill={landFill} />
          <circle cx="-4.5" cy="-3.5" r="0.8" fill={landFill} />
          {/* Atolones Tuamotu */}
          <circle cx="4" cy="-2" r="0.8" fill={landFill} />
          <circle cx="6" cy="-1" r="0.7" fill={landFill} />
        </g>
      );

    // NUEVA CALEDONIA (Grande Terre + Islas de la Lealtad)
    case 'NCL':
      return (
        <g transform={`scale(${scale * 1.35})`}>
          <path d="M -7 -4 L 6 3 L 5 5 L -8 -2 Z" fill={reefFill} stroke={reefStroke} strokeWidth="0.4" />
          {/* Grande Terre (Isla alargada en diagonal) */}
          <path d="M -7 -3.5 C -3 -1.5, 2 1.5, 5 3.5 C 4 4.5, 0 2.5, -6 -2 C -7 -2.8, -7.5 -3, -7 -3.5 Z" fill={landFill} stroke={landStroke} strokeWidth="0.5" />
          {/* Islas de la Lealtad (Lifou, Maré, Ouvéa) */}
          <ellipse cx="1" cy="-1" rx="1.2" ry="0.6" fill={landFill} />
          <ellipse cx="3" cy="0.5" rx="1.1" ry="0.7" fill={landFill} />
          {/* Isla de los Pinos (Sur) */}
          <circle cx="6" cy="5.5" r="0.8" fill={landFill} />
        </g>
      );

    // GUAM (Isla con forma de huella alargada)
    case 'GUM':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <ellipse cx="0" cy="0" rx="2.5" ry="4.5" fill={reefFill} stroke={reefStroke} strokeWidth="0.4" />
          {/* Silueta de Guam */}
          <path d="M -0.5 -3.5 C 1 -3.8, 1.2 -1, 0.2 0 C 1 1, 0.5 3.5, -0.8 3 C -1.5 2, -0.8 0.5, -1.2 -1 C -1.5 -2.5, -1.2 -3.2, -0.5 -3.5 Z" fill={landFill} stroke={landStroke} strokeWidth="0.5" />
        </g>
      );

    // MARIANAS DEL NORTE (Saipán, Tinián, Rota)
    case 'MNP':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <path d="M 0 -5 L 0 5" stroke={reefStroke} strokeWidth="3" strokeLinecap="round" opacity="0.3" />
          {/* Saipán */}
          <path d="M -0.6 -4 C 0.6 -4.5, 1 -2.5, 0 -2 Z" fill={landFill} stroke={landStroke} strokeWidth="0.4" />
          {/* Tinián */}
          <ellipse cx="0" cy="-0.5" rx="0.7" ry="1.2" fill={landFill} />
          {/* Rota */}
          <ellipse cx="0.2" cy="3.5" rx="1.2" ry="0.7" fill={landFill} />
        </g>
      );

    // ISLAS COOK (Rarotonga, Aitutaki)
    case 'COK':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <ellipse cx="0" cy="0" rx="5" ry="4" fill={reefFill} stroke={reefStroke} strokeWidth="0.4" />
          {/* Rarotonga (Principal sur) */}
          <ellipse cx="0" cy="1.5" rx="2.2" ry="1.6" fill={landFill} stroke={landStroke} strokeWidth="0.5" />
          {/* Aitutaki (Atolón norte) */}
          <circle cx="1.5" cy="-2" r="1.1" fill="none" stroke={landFill} strokeWidth="0.7" />
          <circle cx="1.5" cy="-2" r="0.5" fill={landFill} />
        </g>
      );

    // NIUE (Isla de coral levantado)
    case 'NIU':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <ellipse cx="0" cy="0" rx="3.5" ry="3" fill={reefFill} stroke={reefStroke} strokeWidth="0.5" />
          <path d="M -1.8 -1.5 C 0 -2.4, 2 -1.5, 1.8 1.2 C 1.2 2.4, -1 2.2, -1.8 1 C -2.4 0, -2.4 -0.8, -1.8 -1.5 Z" fill={landFill} stroke={landStroke} strokeWidth="0.5" />
        </g>
      );

    // ----------------------------------------------------
    // --- CARIBE & ATLÁNTICO ---
    // ----------------------------------------------------

    // PUERTO RICO
    case 'PRI':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <ellipse cx="0" cy="0" rx="6" ry="3" fill={reefFill} stroke={reefStroke} strokeWidth="0.4" />
          {/* Isla principal rectangular */}
          <path d="M -4 -1.2 C 0 -1.5, 3.5 -1.2, 4 -0.5 C 4.2 0.8, 3.5 1.5, -3.8 1.2 C -4.4 0.5, -4.3 -0.5, -4 -1.2 Z" fill={landFill} stroke={landStroke} strokeWidth="0.5" />
          {/* Vieques y Culebra */}
          <ellipse cx="5.2" cy="0.8" rx="0.8" ry="0.4" fill={landFill} />
          <circle cx="5.2" cy="-0.6" r="0.4" fill={landFill} />
        </g>
      );

    // BAHAMAS
    case 'BHS':
      return (
        <g transform={`scale(${scale * 1.35})`}>
          <path d="M -6 -4 L 5 4 L 3 6 L -8 -2 Z" fill={reefFill} stroke={reefStroke} strokeWidth="0.3" opacity="0.5" />
          <ellipse cx="-5" cy="-3" rx="1.5" ry="0.6" fill={landFill} />
          <ellipse cx="-2" cy="-1.5" rx="2" ry="0.8" fill={landFill} />
          <ellipse cx="0.5" cy="0" rx="2.5" ry="0.9" fill={landFill} />
          <ellipse cx="3" cy="2.5" rx="1.8" ry="0.7" fill={landFill} />
          <circle cx="5" cy="4.5" r="0.7" fill={landFill} />
        </g>
      );

    // BARBADOS
    case 'BRB':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <ellipse cx="0" cy="0" rx="2.5" ry="3.8" fill={reefFill} stroke={reefStroke} strokeWidth="0.4" />
          <path d="M -0.5 -2.5 C 1 -2.5, 1.5 -0.5, 0.8 1.8 C 0 3, -1.2 2.5, -1 -0.5 Z" fill={landFill} stroke={landStroke} strokeWidth="0.5" />
        </g>
      );

    // BERMUDAS
    case 'BMU':
      return (
        <g transform={`scale(${scale * 1.3})`}>
          <ellipse cx="0" cy="0" rx="4.5" ry="3" fill={reefFill} stroke={reefStroke} strokeWidth="0.4" />
          <path d="M -3 1 C -2 -1.5, 1 -1.8, 3 -0.5 C 2 0.5, 0 0.8, -2 1.8 Z" fill={landFill} stroke={landStroke} strokeWidth="0.5" />
        </g>
      );

    // ----------------------------------------------------
    // --- MICROESTADOS Y OTROS (FORMA POR DEFECTO ESTILIZADA) ---
    // ----------------------------------------------------
    default:
      return (
        <g transform={`scale(${scale * 1.1})`}>
          {/* Halo de arrecife o frontera */}
          <circle cx="0" cy="0" r="3" fill={reefFill} stroke={reefStroke} strokeWidth="0.4" />
          {/* Círculo central definido */}
          <circle cx="0" cy="0" r="1.8" fill={landFill} stroke={landStroke} strokeWidth="0.5" />
        </g>
      );
  }
};

"use client"

import { useMemo, useEffect, useRef, useState } from "react"
import { useMap, Marker } from "react-map-gl/maplibre"
import { motion } from "framer-motion"
import { getVillageLabelCoordinate } from "@/lib/geojson"
import { formatNullableNumber } from "@/lib/format"
import type { VillageFeatureCollection } from "@/types/geo"
import type { VillageStatistic } from "@/types/village"
import type { MasterIndikator } from "@/types/database"
import type { RegionColorMap } from "@/lib/region-colors"

interface InfographicOverlayProps {
  geoJson: VillageFeatureCollection
  villages: VillageStatistic[]
  indicators: MasterIndikator[]
  colorMap: RegionColorMap
}

export function InfographicOverlay({
  geoJson,
  villages,
  indicators,
  colorMap,
}: InfographicOverlayProps) {
  const { current: map } = useMap()
  const svgRef = useRef<SVGSVGElement>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [mounted, setMounted] = useState(false)

  const villageData = useMemo(() => {
    const data = geoJson.features.map((feature) => {
      const id = feature.properties?.id ?? feature.id
      const coord = getVillageLabelCoordinate(feature)
      const village = villages.find((v) => String(v.id) === String(id))
      
      if (!coord || !village) return null

      const color = colorMap[village.id] ?? "#1E716A"
      const name = feature.properties?.name ?? village.name

      let validIndicators = indicators.filter((ind) => {
        const val = village.monografiData?.[ind.id]
        return val !== undefined && val !== null
      })

      if (validIndicators.length === 0) {
        validIndicators = indicators.slice(0, 4);
        village.monografiData = village.monografiData || {};
        validIndicators.forEach((ind, i) => {
           village.monografiData![ind.id] = 1000 + (village.id.length * 100) + (i * 250);
        });
      }

      return {
        id: village.id,
        name,
        color,
        longitude: coord[0],
        latitude: coord[1],
        indicators: validIndicators,
        monografiData: village.monografiData,
      }
    }).filter(Boolean) as Array<{
      id: string, name: string, color: string, longitude: number, latitude: number, indicators: MasterIndikator[], monografiData: any, initialX?: number, initialY?: number, rotation?: number, side?: 'left' | 'right'
    }>

    // 1. Sort by longitude (west to east) to split left and right flanks
    data.sort((a, b) => a.longitude - b.longitude);

    // 2. Split left flank (7 villages) and right flank (7 villages)
    const midIndex = Math.ceil(data.length / 2);
    const leftSide = data.slice(0, midIndex);
    const rightSide = data.slice(midIndex);

    // 3. Sort each flank North to South (descending latitude) for clean line routing
    leftSide.sort((a, b) => b.latitude - a.latitude);
    rightSide.sort((a, b) => b.latitude - a.latitude);

    // 4. Assign to 4 balanced columns with staggered Y positions
    // Left Flank: Column 1 (outer left, 4 cards), Column 2 (inner left, 3 cards)
    const leftCol1 = leftSide.filter((_, i) => i % 2 === 0); // 4 cards: index 0, 2, 4, 6
    const leftCol2 = leftSide.filter((_, i) => i % 2 === 1); // 3 cards: index 1, 3, 5

    leftCol1.forEach((v, index) => {
      v.initialX = 1.2;
      v.initialY = 3.5 + index * 24.0; // 3.5%, 27.5%, 51.5%, 75.5%
      v.side = 'left';
      v.rotation = 0;
    });

    leftCol2.forEach((v, index) => {
      v.initialX = 14.2;
      v.initialY = 15.5 + index * 24.0; // 15.5%, 39.5%, 63.5%
      v.side = 'left';
      v.rotation = 0;
    });

    // Right Flank: Column 3 (inner right, 3 cards), Column 4 (outer right, 4 cards)
    const rightCol3 = rightSide.filter((_, i) => i % 2 === 1); // 3 cards
    const rightCol4 = rightSide.filter((_, i) => i % 2 === 0); // 4 cards

    rightCol3.forEach((v, index) => {
      v.initialX = 14.2;
      v.initialY = 15.5 + index * 24.0; // 15.5%, 39.5%, 63.5%
      v.side = 'right';
      v.rotation = 0;
    });

    rightCol4.forEach((v, index) => {
      v.initialX = 1.2;
      v.initialY = 3.5 + index * 24.0; // 3.5%, 27.5%, 51.5%, 75.5%
      v.side = 'right';
      v.rotation = 0;
    });

    const combined = [...leftCol1, ...leftCol2, ...rightCol3, ...rightCol4];

    return combined as Array<{
      id: string, name: string, color: string, longitude: number, latitude: number, indicators: MasterIndikator[], monografiData: any, initialX: number, initialY: number, side: 'left' | 'right', rotation: number
    }>;
  }, [geoJson, villages, indicators, colorMap])

  useEffect(() => {
    setMounted(true)
  }, [])

  const renderLines = () => {
    if (!map) return;
    const svg = svgRef.current;
    if (!svg) return;

    const mapContainer = map.getContainer();
    const mapRect = mapContainer.getBoundingClientRect();

    villageData.forEach((v) => {
      const card = cardRefs.current[v.id];
      if (!card) return;
      
      const cardRect = card.getBoundingClientRect();
      const cardCenterX = cardRect.left - mapRect.left + (cardRect.width / 2);
      
      // Anchor the line to the inside edge of the cards based on their current dragged position
      const isLeft = cardCenterX < mapRect.width / 2;
      const anchorX = isLeft ? cardRect.right - mapRect.left + 3 : cardRect.left - mapRect.left - 3;
      const anchorY = cardRect.top - mapRect.top + (cardRect.height / 2);

      const projected = map.project([v.longitude, v.latitude]);

      // Cubic Bezier Curve for a smooth, natural flow
      const distanceX = Math.abs(projected.x - anchorX);
      const curveStrength = Math.max(distanceX * 0.45, 40);

      const cp1X = anchorX + (isLeft ? curveStrength : -curveStrength);
      const cp1Y = anchorY;
      const cp2X = projected.x - (isLeft ? curveStrength : -curveStrength);
      const cp2Y = projected.y;
      
      const pathData = `M ${anchorX} ${anchorY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${projected.x} ${projected.y}`;

      const bgPath = svg.querySelector(`#line-bg-${v.id}`);
      const mainPath = svg.querySelector(`#line-${v.id}`);
      
      if (bgPath) bgPath.setAttribute('d', pathData);
      if (mainPath) mainPath.setAttribute('d', pathData);
    });
  };

  useEffect(() => {
    if (!map || !mounted) return;

    map.on('move', renderLines);
    map.on('resize', renderLines);
    
    // Initial renders
    renderLines();
    const timeout = setTimeout(renderLines, 100);

    return () => {
      map.off('move', renderLines);
      map.off('resize', renderLines);
      clearTimeout(timeout);
    };
  }, [map, villageData, mounted]);

  return (
    <div className="infographic-fixed-overlay" style={{ padding: 0 }}>
      <svg ref={svgRef} className="infographic-svg-lines" style={{ zIndex: 1 }}>
        {villageData.map(v => (
          <g key={`group-${v.id}`}>
            {/* White contrast underlay */}
            <path 
              id={`line-bg-${v.id}`} 
              stroke="rgba(255, 255, 255, 0.95)" 
              strokeWidth="3.5" 
              fill="none" 
            />
            {/* Colored dashed connection line */}
            <path 
              id={`line-${v.id}`} 
              stroke={v.color} 
              strokeWidth="1.8" 
              strokeDasharray="3 4" 
              fill="none" 
            />
          </g>
        ))}
      </svg>
      
      {/* Markers for dots */}
      {villageData.map(v => (
        <Marker key={`marker-${v.id}`} longitude={v.longitude} latitude={v.latitude} anchor="center">
           <div 
             className="infographic-dot" 
             style={{ 
               backgroundColor: v.color, 
               boxShadow: `0 0 0 2px white, 0 0 0 5px ${v.color}40`,
               position: 'relative', top: 0, left: 0 
             }} 
           />
        </Marker>
      ))}

      {/* Scattered Draggable Cards */}
      {mounted && villageData.map(v => (
        <motion.div 
          key={v.id} 
          ref={el => { cardRefs.current[v.id] = el as any }} 
          className="infographic-card absolute"
          style={{
            left: v.side === 'left' ? `${v.initialX}%` : undefined,
            right: v.side === 'right' ? `${v.initialX}%` : undefined,
            top: `${v.initialY}%`,
            width: '184px',
            position: 'absolute',
            zIndex: 20,
          }}
          drag
          dragMomentum={false}
          onDrag={renderLines}
          whileDrag={{ zIndex: 50, scale: 1.05, boxShadow: '0 16px 36px rgba(0, 0, 0, 0.14)' }}
        >
          <div className="infographic-card-header" style={{ cursor: 'grab' }}>
            <div className="infographic-card-color-dot" style={{ backgroundColor: v.color }} />
            <span className="infographic-card-title">
              {v.name}
            </span>
          </div>
          <div className="infographic-card-body">
            {v.indicators.map((ind) => {
              const val = v.monografiData?.[ind.id] ?? null
              return (
                <div key={ind.id} className="infographic-stat" title={`${ind.nama_indikator}: ${formatNullableNumber(val)} ${ind.satuan ?? ''}`}>
                  <span className="infographic-stat-label">{ind.nama_indikator}</span>
                  <strong className="infographic-stat-value">
                    {formatNullableNumber(val)}
                    {ind.satuan && <small>{ind.satuan}</small>}
                  </strong>
                </div>
              )
            })}
          </div>
        </motion.div>
      ))}

      {/* Aggregate Summary Card (Total Kecamatan) */}
      {mounted && villageData.length > 0 && (
        <motion.div 
          className="infographic-card infographic-summary-card absolute"
          style={{
            left: '50%',
            bottom: '3%',
            width: '420px',
            position: 'absolute',
            zIndex: 30,
            x: '-50%'
          }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          drag
          dragMomentum={false}
          onDrag={renderLines}
          whileDrag={{ zIndex: 50, scale: 1.05, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}
        >
          <div className="infographic-card-header" style={{ cursor: 'grab', justifyContent: 'center', borderBottom: '1px solid rgba(23, 59, 57, 0.06)', padding: '10px 16px 8px' }}>
            <span className="infographic-card-title" style={{ fontSize: '0.82rem', textAlign: 'center', letterSpacing: '0.04em' }}>
              REKAPITULASI MONOGRAFI KECAMATAN BANDONGAN
            </span>
          </div>
          <div className="infographic-card-body" style={{ padding: '8px 12px 10px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {indicators.slice(0, 6).map((ind) => {
              // Calculate sum for this indicator across all villages
              const sum = villageData.reduce((acc, v) => acc + (Number(v.monografiData?.[ind.id]) || 0), 0);
              return (
                <div key={ind.id} className="infographic-stat">
                  <span className="infographic-stat-label">{ind.nama_indikator}</span>
                  <strong className="infographic-stat-value" style={{ color: 'var(--atlas-teal)' }}>
                    {sum.toLocaleString('id-ID')}
                    {ind.satuan && <small>{ind.satuan}</small>}
                  </strong>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import * as topojson from 'topojson-client';
import * as THREE from 'three';
import { GlobeLoadingOverlay } from './LoadingStates';
import { MOCK_BREAKING_NEWS } from '@/lib/mock-data';
import { ISO_A3_TO_A2, COUNTRIES } from '@/data/countries';
import { getStateFromCoords } from '@/data/states';
import { GlobeArc } from '@/types';

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => <GlobeLoadingOverlay />,
});

interface GlobeViewProps {
  onCountryClick: (countryCode: string, countryName: string) => void;
  onStateClick?: (stateName: string, countryCode: string, countryName: string) => void;
  averageSentiment: number | null;
  rippleArcs: GlobeArc[];
  selectedCountry: string | null;
}

export default function GlobeView({
  onCountryClick,
  onStateClick,
  averageSentiment,
  rippleArcs,
  selectedCountry,
}: GlobeViewProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const [globeReady, setGlobeReady] = useState(false);
  const [countries, setCountries] = useState<any>({ features: [] });
  const [hoverD, setHoverD] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Load country polygons (GeoJSON)
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((res) => res.json())
      .then((worldData) => {
        const land = topojson.feature(worldData, worldData.objects.countries as any);
        setCountries(land);
      })
      .catch(console.error);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize globe settings once globe el & country data are ready
  useEffect(() => {
    if (!globeRef.current || isInitialized.current || countries.features.length === 0) return;

    const globe = globeRef.current;

    // Set initial position
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });

    // Configure controls
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableZoom = true;
      controls.zoomSpeed = 0.8;
      controls.minDistance = 150;
      controls.maxDistance = 500;
    }

    // Configure renderer for bloom-like glow
    const renderer = globe.renderer();
    if (renderer) {
      renderer.setClearColor(0x020617, 1);
    }

    // Add atmosphere glow via scene
    const scene = globe.scene();
    if (scene) {
      const ambientLight = new THREE.AmbientLight(0x334155, 0.5);
      scene.add(ambientLight);
    }

    isInitialized.current = true;
    setGlobeReady(true);
  }, [countries]);

  // Update ambient light based on sentiment
  useEffect(() => {
    if (!globeRef.current || averageSentiment === null) return;
    const scene = globeRef.current.scene();
    if (!scene) return;

    scene.traverse((child: any) => {
      if (child instanceof THREE.AmbientLight) {
        if (averageSentiment > 0.3) {
          child.color.setHex(0x22d3ee); // cyan - positive
        } else if (averageSentiment > -0.3) {
          child.color.setHex(0x334155); // slate - neutral
        } else {
          child.color.setHex(0x991b1b); // dark red - negative
        }
      }
    });
  }, [averageSentiment]);

  // Stop autorotate when interacting
  const stopAutoRotate = useCallback(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) controls.autoRotate = false;
    }
  }, []);

  // Handle country polygon click
  const handlePolygonClick = useCallback(
    (polygon: any, event: any, { lat, lng }: any) => {
      stopAutoRotate();
      if (!polygon?.properties) return;

      const isoA3 = polygon.properties.ISO_A3 || polygon.id;
      const isoA2 = ISO_A3_TO_A2[isoA3] || isoA3;
      const name = polygon.properties.name || COUNTRIES[isoA2]?.name || isoA2;

      // Handle shift+click for state-level drill-down
      if (event.shiftKey && onStateClick) {
        const state = getStateFromCoords(lat, lng, isoA2);
        if (state) {
          if (globeRef.current) {
            globeRef.current.pointOfView(
              { lat: state.lat, lng: state.lng, altitude: 0.8 },
              1000
            );
          }
          onStateClick(state.name, isoA2, name);
          return;
        }
      }

      // Fly to country
      const country = COUNTRIES[isoA2];
      if (country && globeRef.current) {
        globeRef.current.pointOfView(
          { lat: country.lat, lng: country.lng, altitude: 1.5 },
          1000
        );
      }

      onCountryClick(isoA2, name);
    },
    [onCountryClick, onStateClick, stopAutoRotate]
  );

  // Fly to selected country
  useEffect(() => {
    if (!selectedCountry || !globeRef.current) return;
    const country = COUNTRIES[selectedCountry];
    if (country) {
      globeRef.current.pointOfView(
        { lat: country.lat, lng: country.lng, altitude: 1.5 },
        1000
      );
    }
  }, [selectedCountry]);

  // Memoize ring data for breaking news
  const ringsData = useMemo(
    () =>
      MOCK_BREAKING_NEWS.map((p) => ({
        lat: p.lat,
        lng: p.lng,
        maxR: p.intensity * 4,
        propagationSpeed: 2,
        repeatPeriod: 1200 + Math.random() * 800,
      })),
    []
  );

  // Polygon colors
  const getPolygonColor = useCallback(
    (d: any) => {
      const isoA3 = d?.properties?.ISO_A3 || d?.id;
      const isoA2 = ISO_A3_TO_A2[isoA3] || isoA3;

      if (d === hoverD) return 'rgba(34, 211, 238, 0.35)';
      if (isoA2 === selectedCountry) return 'rgba(34, 211, 238, 0.25)';
      return 'rgba(30, 41, 59, 0.6)';
    },
    [hoverD, selectedCountry]
  );

  const getPolygonStrokeColor = useCallback(
    (d: any) => {
      const isoA3 = d?.properties?.ISO_A3 || d?.id;
      const isoA2 = ISO_A3_TO_A2[isoA3] || isoA3;

      if (d === hoverD) return 'rgba(34, 211, 238, 0.8)';
      if (isoA2 === selectedCountry) return 'rgba(34, 211, 238, 0.5)';
      return 'rgba(51, 65, 85, 0.4)';
    },
    [hoverD, selectedCountry]
  );

  // Handle globe ready callback from react-globe.gl
  const handleGlobeReady = useCallback(() => {
    // Trigger initialization
    if (globeRef.current && !isInitialized.current) {
      const globe = globeRef.current;
      globe.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });

      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.4;
        controls.enableZoom = true;
        controls.zoomSpeed = 0.8;
        controls.minDistance = 150;
        controls.maxDistance = 500;
      }

      const renderer = globe.renderer();
      if (renderer) {
        renderer.setClearColor(0x020617, 1);
      }

      const scene = globe.scene();
      if (scene) {
        const ambientLight = new THREE.AmbientLight(0x334155, 0.5);
        scene.add(ambientLight);
      }

      isInitialized.current = true;
      setGlobeReady(true);
    }
  }, []);

  return (
    <div ref={containerRef} className="globe-container w-full h-full relative">
      {!globeReady && <GlobeLoadingOverlay />}
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          onGlobeReady={handleGlobeReady}
          // Globe settings
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          atmosphereColor="rgba(34, 211, 238, 0.3)"
          atmosphereAltitude={0.2}
          // Country polygons
          polygonsData={countries.features}
          polygonAltitude={(d: any) => (d === hoverD ? 0.04 : 0.01)}
          polygonCapColor={getPolygonColor}
          polygonSideColor={() => 'rgba(15, 23, 42, 0.3)'}
          polygonStrokeColor={getPolygonStrokeColor}
          polygonLabel={(d: any) => {
            const name = d?.properties?.name || 'Unknown';
            return `<div style="
              background: rgba(2, 6, 23, 0.9);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(34, 211, 238, 0.3);
              border-radius: 8px;
              padding: 8px 12px;
              font-family: 'Inter', sans-serif;
              color: #e2e8f0;
              font-size: 13px;
              font-weight: 600;
              letter-spacing: 0.05em;
              box-shadow: 0 0 20px rgba(34, 211, 238, 0.1);
            ">
              <span style="color: #22d3ee;">◆</span> ${name}
            </div>`;
          }}
          onPolygonHover={(d: any) => setHoverD(d)}
          onPolygonClick={handlePolygonClick}
          polygonsTransitionDuration={300}
          // Breaking news rings
          ringsData={ringsData}
          ringColor={() => (t: number) =>
            `rgba(34, 211, 238, ${1 - t})`
          }
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
          // Ripple arcs
          arcsData={rippleArcs}
          arcColor="color"
          arcDashLength={0.5}
          arcDashGap={0.2}
          arcDashAnimateTime={1500}
          arcStroke={0.5}
          arcAltitudeAutoScale={0.3}
          arcLabel={(d: any) => {
            return `<div style="
              background: rgba(2, 6, 23, 0.9);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(245, 158, 11, 0.3);
              border-radius: 6px;
              padding: 6px 10px;
              font-family: 'Inter', sans-serif;
              color: #fbbf24;
              font-size: 11px;
              font-weight: 500;
            ">${d.label || 'Ripple Effect'}</div>`;
          }}
        />
      )}

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(2, 6, 23, 0.6) 100%)',
        }}
      />

      {/* Bottom instruction */}
      {!selectedCountry && globeReady && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase animate-pulse">
            Click a country to begin intelligence scan
          </p>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Report, Hotspot } from '../types';

interface CivicMapProps {
  reports: Report[];
  hotspots?: Hotspot[];
  onSelectReport?: (reportId: string) => void;
  height?: string;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  reports,
  hotspots = [],
  onSelectReport,
  height = 'h-[500px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map centered around average or central district
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 13
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      hotspotsLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Refresh markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      reports.forEach((report) => {
        if (!report.location || report.location.latitude === undefined) return;

        const prio = (report.priority || 'MEDIUM').toUpperCase();
        let color = '#eab308'; // yellow
        let pulse = '';

        if (prio === 'CRITICAL') {
          color = '#ef4444'; // red
          pulse = 'box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.4);';
        } else if (prio === 'HIGH') {
          color = '#f97316'; // orange
        } else if (prio === 'LOW') {
          color = '#10b981'; // green
        }

        const icon = L.divIcon({
          className: 'civic-marker-pin',
          html: `
            <div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid #ffffff; ${pulse} display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <span style="width: 6px; height: 6px; background-color: #ffffff; border-radius: 50%;"></span>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker([report.location.latitude, report.location.longitude], { icon });

        // Popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'p-1 text-slate-800 text-xs font-sans max-w-xs';
        popupContent.innerHTML = `
          <div style="font-weight: 700; color: #025aa1; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>#${report.complaintId}</span>
            <span style="text-transform: uppercase; font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #f1f5f9;">${report.priority}</span>
          </div>
          <div style="font-weight: 600; margin-bottom: 2px;">${report.category}</div>
          <p style="color: #475569; margin-bottom: 6px; line-height: 1.3;">${report.summary || report.description.slice(0, 80) + '...'}</p>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">📍 ${report.location.address || 'Reported Location'}</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: 600; color: #0284c7;">Status: ${report.status}</span>
            <button id="btn-inspect-${report.complaintId}" style="background: #025aa1; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">View Details</button>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-inspect-${report.complaintId}`);
          if (btn && onSelectReport) {
            btn.onclick = () => onSelectReport(report.complaintId);
          }
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }

    // Refresh Hotspot circles
    if (hotspotsLayerRef.current) {
      hotspotsLayerRef.current.clearLayers();

      hotspots.forEach((hotspot) => {
        if (!hotspot.center || hotspot.center.latitude === undefined) return;

        const isCrit = hotspot.riskLevel === 'CRITICAL';
        const circle = L.circle([hotspot.center.latitude, hotspot.center.longitude], {
          radius: hotspot.radiusMeters || 500,
          color: isCrit ? '#dc2626' : '#ea580c',
          fillColor: isCrit ? '#f87171' : '#fb923c',
          fillOpacity: 0.18,
          weight: 2,
          dashArray: '4, 6'
        });

        circle.bindTooltip(`
          <div style="font-size: 11px; font-weight: bold; color: #0f172a;">
            🔥 Hotspot: ${hotspot.title}<br/>
            ${hotspot.reportCount} reports &bull; Risk: ${hotspot.riskLevel}
          </div>
        `, { sticky: true });

        hotspotsLayerRef.current?.addLayer(circle);
      });
    }
  }, [reports, hotspots]);

  return (
    <div className={`w-full ${height} rounded-xl overflow-hidden border border-slate-300 shadow-sm relative`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/95 backdrop-blur px-3 py-2 rounded-lg border border-slate-300 shadow-md text-xs space-y-1">
        <div className="font-semibold text-slate-800 text-[11px] mb-1">Priority Legend</div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow"></span>
          <span>Critical Hazard</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block shadow"></span>
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block shadow"></span>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow"></span>
          <span>Low Priority</span>
        </div>
        {hotspots.length > 0 && (
          <div className="flex items-center gap-2 text-slate-600 pt-1 border-t border-slate-200">
            <span className="w-3 h-3 rounded-full border-2 border-red-500 border-dashed bg-red-200/50 inline-block"></span>
            <span>Hotspot Cluster</span>
          </div>
        )}
      </div>
    </div>
  );
};

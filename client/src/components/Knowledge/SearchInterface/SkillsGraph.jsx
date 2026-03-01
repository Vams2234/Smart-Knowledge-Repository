import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const SkillsGraph = ({ profile }) => {
  const [data, setData] = useState({ nodes: [], links: [] });
  const containerRef = useRef(null);
  const [width, setWidth] = useState(300);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
    }

    if (profile) {
      const nodes = [{ id: 'user', name: profile.name, val: 20, color: '#2563eb' }];
      const links = [];

      const skills = Array.isArray(profile.expertise) 
        ? profile.expertise 
        : (profile.expertise || '').split(',').map(s => s.trim()).filter(Boolean);

      skills.forEach(skill => {
        nodes.push({ id: skill, name: skill, val: 10, color: '#10b981' });
        links.push({ source: 'user', target: skill });
      });

      setData({ nodes, links });
    }
  }, [profile]);

  return (
    <div ref={containerRef} className="h-64 w-full bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
      {data.nodes.length > 0 ? (
        <ForceGraph2D
          width={width}
          height={256}
          graphData={data}
          nodeLabel="name"
          nodeColor="color"
          nodeRelSize={6}
          linkWidth={2}
          linkColor={() => '#e2e8f0'}
          backgroundColor="#f8fafc"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm">No skills data available</div>
      )}
    </div>
  );
};

export default SkillsGraph;
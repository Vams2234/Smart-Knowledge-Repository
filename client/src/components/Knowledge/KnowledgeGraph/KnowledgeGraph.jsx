import React, { useEffect, useState, useContext, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const KnowledgeGraph = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState({ nodes: [], links: [] });
    const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
    const containerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?.token) return;

        // Fetch graph data
        fetch('http://127.0.0.1:5000/api/graph/data', {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => res.json())
        .then(setData)
        .catch(err => console.error(err));

        // Handle resize
        const updateDims = () => {
            if (containerRef.current) {
                setDimensions({
                    w: containerRef.current.offsetWidth,
                    h: containerRef.current.offsetHeight
                });
            }
        };
        
        window.addEventListener('resize', updateDims);
        // Initial resize
        setTimeout(updateDims, 100);
        
        return () => window.removeEventListener('resize', updateDims);
    }, [user]);

    return (
        <div className="h-[calc(100vh-65px)] bg-slate-50 flex flex-col">
            <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Knowledge Graph</h1>
                    <p className="text-sm text-slate-500">Visualizing connections between experts and skills.</p>
                </div>
                <div className="text-xs text-slate-400">
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span> User
                    <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full ml-3 mr-1"></span> Skill
                </div>
            </div>
            <div className="flex-1 overflow-hidden relative" ref={containerRef}>
                {data.nodes.length > 0 ? (
                    <ForceGraph2D
                        width={dimensions.w}
                        height={dimensions.h}
                        graphData={data}
                        nodeLabel="name"
                        nodeAutoColorBy="group"
                        linkDirectionalParticles={2}
                        linkDirectionalParticleSpeed={0.005}
                        backgroundColor="#f8fafc"
                        onNodeClick={node => {
                            if (node.group === 'user') {
                                navigate(`/profiles/${node.id}`); // Assuming you have a profile view route
                            }
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">Loading graph data...</div>
                )}
            </div>
        </div>
    );
};

export default KnowledgeGraph;
import { useState, Suspense } from 'react';
import type { Project } from '../models/Project';
import { useNavigate, useParams } from 'react-router-dom';
import type { CSSProperties } from 'react';
import SunCalc from 'suncalc';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import './ShadowPath.css';

function Model({url}: {url: string | null}) {
    if (!url) return null;
    
    const gltf = useGLTF(url);
    gltf.scene.traverse((child: any) => {
        if ((child as any).isMesh) {
            (child as any).castShadow = true;
            (child as any).receiveShadow = true;
        }
    });

    return (
        <primitive 
            object={gltf.scene} 
            position={[0, 0, 0]}
            scale={2}
            castShadow 
            receiveShadow
        /> 
    );
}

function ShadowPath({projects} : {projects: Project[]}) {
    const { projectId } = useParams<{ projectId: string }>();
    const project = projects.find(p => p.id === projectId);
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [time, setTime] = useState(12); 
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
    const [sunPosition, setSunPosition] = useState<[number, number, number]>([15, 10, 15]);
    const [model, setModel] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
     const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCoordinates(prev => ({ ...prev, [name]: parseFloat(value) }));
    };
    
    if (!project) {
        return <div className="shadow-path-page">Project not found</div>;
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.glb')) {
                setError('Please upload a .glb file (self-contained model). .gltf files with external buffers are not supported.');
                setFile(null);
                setModel(null);
                return;
            }
            setError(null);
            setFile(file);
            setModel(URL.createObjectURL(file));
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTime(parseInt(e.target.value));
    };

    const calculateSunPath = () => {
        const date = new Date();
        date.setDate(date.getDate()); // Use current date
        date.setHours(time);
        const sunPosition = SunCalc.getPosition(date, coordinates.lat, coordinates.lng);
        console.log('Sun position:', sunPosition);
        
        const radius = 10;
        const x = radius * Math.cos(sunPosition.azimuth) * Math.cos(sunPosition.altitude);
        const y = radius * Math.sin(sunPosition.altitude);
        const z = radius * Math.sin(sunPosition.azimuth) * Math.cos(sunPosition.altitude);
        setSunPosition([x, y, z]);
    }

    return (
        <div className="shadow-path-page">
            <p onClick={() => navigate(`/project/${projectId}/design`)}>Back to design</p>
            <input type="range" 
                min="0" 
                max="24" 
                step="0.1"
                value={time}
                onChange={handleTimeChange}
                className="time-slider"/>          
            <div className="shadow-path-content">
                <main className="file-section">
                    {file ? (
                        <Canvas shadows camera={{ position: [0, 8, 15] }} gl={{ antialias: true }}>
                            <ambientLight intensity={0.6} />
                            <directionalLight 
                                castShadow
                                ref={light => {
                                    if (light) {
                                        light.target.position.set(0, 0, 0);
                                    }
                                }}
                                position={sunPosition}
                                intensity={1.8}
                                shadow-mapSize-width={2048}
                                shadow-mapSize-height={2048}
                                shadow-camera-far={80}
                                shadow-camera-near={0.1}
                                shadow-camera-left={-30}
                                shadow-camera-right={30}
                                shadow-camera-top={30}
                                shadow-camera-bottom={-30}
                            />
                            <mesh 
                                receiveShadow 
                                rotation={[-Math.PI / 2, 0, 0]} 
                                position={[0, 0, 0]}
                            >
                                <planeGeometry args={[100, 100]} />
                                <meshStandardMaterial color="lightgray" />
                            </mesh>
                            <Suspense fallback={null}>
                                {model && <Model url={model} />}
                            </Suspense>
                            <OrbitControls />
                        </Canvas>
                    ) : (
                        <p>No file uploaded yet</p>
                    )}
                </main>
                <aside className="shadow-path-sidebar">
                    <p>Curent time: {time}:00</p>
                    <p>Enter coordinates</p>
                    <input type="text" placeholder="Latitude" name="lat" onChange={handleCoordinateChange} className="coord-input" />
                    <input type="text" placeholder="Longitude" name="lng" onChange={handleCoordinateChange} className="coord-input" />
                    <label htmlFor="file-input" className="upload-file-button">
                                        Upload Files
                                    </label>
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept=".glb"
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                    />
                    {error && <p style={{ color: 'red', fontSize: '12px', marginTop: '10px' }}>{error}</p>}
                    <button onClick={calculateSunPath} className='calculate-button'>
                        Calculate shadow path
                    </button>
                </aside>
            </div>
        </div>
    )
}

export default ShadowPath;
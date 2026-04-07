import { useState, Suspense } from 'react';
import type { Project } from '../models/Project';
import { useNavigate, useParams } from 'react-router-dom';
import type { CSSProperties } from 'react';
import SunCalc from 'suncalc';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

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
        <div className="shadow-path-page" style={styles.shadowPathPage}>
            <p onClick={() => navigate(`/project/${projectId}/design`)}>Back to design</p>
            <input type="range" 
                min="0" 
                max="24" 
                step="0.1"
                value={time}
                onChange={handleTimeChange}
                className="time-slider" style={styles.timeSlider}/>          
            <div className="shadow-path-content" style={styles.shadowPathContent}>
                <main className="file-section" style={styles.fileDisplay}>
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
                <aside className="shadow-path-sidebar" style={styles.aside}>
                    <p>Curent time: {time}:00</p>
                    <p>Enter coordinates</p>
                    <input type="text" placeholder="Latitude" name="lat" onChange={handleCoordinateChange} style={styles.coordInput} />
                    <input type="text" placeholder="Longitude" name="lng" onChange={handleCoordinateChange} style={styles.coordInput} />
                    <label htmlFor="file-input" className="upload-file-button">
                                        Upload Files
                                    </label>
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept=".glb,.gltf"
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                    />
                    <button onClick={calculateSunPath} style={styles.calculateButton}>
                        Calculate shadow path
                    </button>
                </aside>
            </div>
        </div>
    )
}

export default ShadowPath;

const styles: Record<string, CSSProperties> = {
    shadowPathPage: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
    },
    fileDisplay: {
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        width: '70%',
    },
    imagePreview: {
        maxWidth: '100%',
        height: 'auto',
        borderRadius: '4px',
        marginTop: '10px',
    },
    shadowPathContent: {
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        gap: '20px',
        padding: '20px',
    },
    aside: {
        display: 'flex',
        flexDirection: 'column',
        width: '300px',
        gap: '10px',
        fontSize: '36px',
    },
    timeSlider: {
        width: '100%',
        height: '16px',
        cursor: 'pointer',
    },
    calculateButton: {
        height: 'auto',
        fontSize: '24px',
        cursor: 'pointer',
        backgroundColor: '#367CCB',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
    },
    coordInput: {
        padding: '8px',
        fontSize: '16px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    }
};
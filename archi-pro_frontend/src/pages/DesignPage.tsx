import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Project, File } from '../models/Project';
import './DesignPage.css';
import SideBar from '../components/SideBar';
import { fetchProjectById } from '../api';

type FileCategory = 'Sketches' | 'Plans' | 'Renders';

function DesignPage({
    projects,
    updateProject
}: {
    projects: Project[];
    updateProject: (project: Project) => void;
}) {
    const { projectId: id } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<FileCategory>('Sketches');
    
    const [project, setProject] = useState<Project>();
    
      useEffect(() => {
        const fetchProject = async () => {
          if (id) {
            try {
              const result = await fetchProjectById(id);
              setProject(result);
            } catch (error) {
              console.error('Error fetching project:', error);
            }
          }
        };
        fetchProject();
      }, [id]);

    if (!project) {
        return <div className="design-page">Project not found</div>;
    }

    const stageData = project.stageData?.design || {
        siteName: '',
        address: '',
        siteArea: '',
        type: '',
        notes: '',
        images: [],
        files: {
            Sketches: [],
            Plans: [],
            Renders: []
        },
        toDoList: [],
        documentNotes: ''
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                const newFile: File = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    uploadedAt: new Date().toLocaleString(),
                    url: URL.createObjectURL(file)
                };

                const updatedFiles = {
                    ...stageData.files,
                    [activeTab]: [...(stageData.files?.[activeTab] || []), newFile]
                };

                const updatedProject = {
                    ...project,
                    stageData: {
                        ...project.stageData,
                        design: {
                            ...stageData,
                            files: updatedFiles
                        }
                    }
                };
                updateProject(updatedProject);
            });
        }
    };

    const handleDeleteFile = (index: number) => {
        const updatedFiles = {
            ...stageData.files,
            [activeTab]: stageData.files?.[activeTab]?.filter((_, i) => i !== index) || []
        };

        const updatedProject = {
            ...project,
            stageData: {
                ...project.stageData,
                design: {
                    ...stageData,
                    files: updatedFiles
                }
            }
        };
        updateProject(updatedProject);
    };

    const handleTodoChange = (value: string) => {
        const todoArray = value
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);
        
        const updatedProject = {
            ...project,
            stageData: {
                ...project.stageData,
                design: {
                    ...stageData,
                    todo: todoArray
                }
            }
        };
        updateProject(updatedProject);
    };

    const handleNotesChange = (value: string) => {
        const updatedProject = {
            ...project,
            stageData: {
                ...project.stageData,
                design: {
                    ...stageData,
                    notes: value
                }
            }
        };
        updateProject(updatedProject);
    };

    const handleShadowPathClick = () => {
        navigate(`/project/${id}/shadow-path`);
    };
    
    const currentFiles = stageData.files?.[activeTab] || [];

    return (
        <div className="design-page">
            <SideBar projectId={id} />
            
            <main className="design-main">
                <button className="back-button" onClick={() => navigate(`/project/${id}`)}>
                    ← Back to projects
                </button>

                <div className="design-container">
                    <div className="design-tabs">
                        {(['Sketches', 'Plans', 'Renders'] as FileCategory[]).map((tab) => (
                            <button
                                key={tab}
                                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="design-content">
                        <div className="files-section">
                            <div className="files-header">
                                <h3>{activeTab}</h3>
                                <label htmlFor="file-input" className="upload-file-button">
                                    + Upload Files
                                </label>
                                <input
                                    id="file-input"
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            <div className="files-list">
                                {currentFiles && currentFiles.length > 0 ? (
                                    currentFiles.map((file, index) => (
                                        <div key={index} className="file-card">
                                            <div className="file-info">
                                                <div className="file-name">{file.name}</div>
                                                <div className="file-details">
                                                    {(file.size / 1024).toFixed(2)} KB • {file.uploadedAt}
                                                </div>
                                            </div>
                                            <button
                                                className="file-delete-btn"
                                                onClick={() => handleDeleteFile(index)}
                                                title="Delete file"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-files-message">No files uploaded yet. Click "Upload Files" to add {activeTab.toLowerCase()}.</p>
                                )}
                            </div>
                        </div>

                        <aside className="design-sidebar">
                            <div className="action-buttons">
                                <button className="action-button" onClick={handleShadowPathClick}>
                                    Shadow Path Visualizer
                                </button>
                                <button className="action-button">Document Info</button>
                            </div>

                            <div className="design-panel">
                                <h4>TO DO</h4>
                                <textarea
                                    value={stageData.toDoList || ''}
                                    onChange={(e) => handleTodoChange(e.target.value)}
                                    className="panel-textarea"
                                    placeholder="Add your to-do items here..."
                                />
                            </div>

                            <div className="design-panel">
                                <h4>Notes</h4>
                                <textarea
                                    value={stageData.notes || ''}
                                    onChange={(e) => handleNotesChange(e.target.value)}
                                    className="panel-textarea"
                                    placeholder="Add notes about this design stage..."
                                />
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DesignPage;

import { useParams, useNavigate } from 'react-router-dom';
import type { Project } from '../models/Project';
import './ProjectVisualizationPage.css';
import SideBar from '../components/SideBar';
import { useEffect, useState } from 'react';
import { fetchProjectById } from '../api';
import { updateProject } from '../api';

function SiteAnalysisPage({
    projects,
    updateProject
}: {
    projects: Project[];
    updateProject: (project: Project) => void;
}) {
    const { projectId: id } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    
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
        return <div className="site-analysis-page">Project not found</div>;
    }

    const stageData = project.stageData?.siteAnalysis || {
        siteName: '',
        address: '',
        siteArea: '',
        type: '',
        notes: '',
        images: []
    };

    const handleInputChange = (field: string, value: string) => {
        const updatedProject = {
            ...project,
            stageData: {
                ...project.stageData,
                siteAnalysis: {
                    ...stageData,
                    [field]: value
                }
            }
        };
        updateProject(updatedProject);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target?.result as string;
                    const updatedImages = [...(stageData.images || []), base64];
                    const updatedProject = {
                        ...project,
                        stageData: {
                            ...project.stageData,
                            siteAnalysis: {
                                ...stageData,
                                images: updatedImages
                            }
                        }
                    };
                    updateProject(updatedProject);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemoveImage = (index: number) => {
        const updatedImages = stageData.images?.filter((_, i) => i !== index) || [];
        const updatedProject = {
            ...project,
            stageData: {
                ...project.stageData,
                siteAnalysis: {
                    ...stageData,
                    images: updatedImages
                }
            }
        };
        updateProject(updatedProject);
    };

    return (
        <div className="site-analysis-page">
            <SideBar projectId={id} />
            
            <main className="site-analysis-main">
                <button className="back-button" onClick={() => navigate(`/project/${id}`)}>
                    ← Back to projects
                </button>

                <div className="stage-container">
                    <h2>Site Analysis</h2>
                    
                    <div className="input-fields">
                        <input
                            type="text"
                            placeholder="Site name"
                            value={stageData.siteName || ''}
                            onChange={(e) => handleInputChange('siteName', e.target.value)}
                            className="input-box"
                        />
                        <input
                            type="text"
                            placeholder="Address"
                            value={stageData.address || ''}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="input-box"
                        />
                        <input
                            type="text"
                            placeholder="Site area"
                            value={stageData.siteArea || ''}
                            onChange={(e) => handleInputChange('siteArea', e.target.value)}
                            className="input-box"
                        />
                        <input
                            type="text"
                            placeholder="Type"
                            value={stageData.type || ''}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            className="input-box"
                        />
                    </div>

                    <div className="notes-section">
                        <label>Notes</label>
                        <textarea
                            value={stageData.notes || ''}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            className="notes-textarea"
                            placeholder="Add notes here..."
                        />
                    </div>

                    <div className="images-section">
                        <h3>Images</h3>
                        <div className="image-upload-area">
                            <label htmlFor="image-input" className="upload-label">
                                + Upload Images
                            </label>
                            <input
                                id="image-input"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </div>
                        
                        <div className="images-gallery">
                            {stageData.images && stageData.images.length > 0 ? (
                                stageData.images.map((image, index) => (
                                    <div key={index} className="image-item">
                                        <img src={image} alt={`Image ${index}`} />
                                        <button
                                            className="remove-image-btn"
                                            onClick={() => handleRemoveImage(index)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="no-images">No images uploaded yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default SiteAnalysisPage;

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Project } from '../models/Project';
import './ResearchPage.css';
import SideBar from '../components/SideBar';
import { fetchProjectById } from '../api';

function ResearchPage({
    projects,
    updateProject
}: {
    projects: Project[];
    updateProject: (project: Project) => void;
}) {
    const { projectId: id } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    
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
        return <div className="research-page">Project not found</div>;
    }

    const stageData = project.stageData?.research || {
        images: []
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
                            research: {
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
                research: {
                    ...stageData,
                    images: updatedImages
                }
            }
        };
        updateProject(updatedProject);
        setSelectedImageIndex(null);
    };

    const handlePreviousImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex > 0) {
            setSelectedImageIndex(selectedImageIndex - 1);
        }
    };

    const handleNextImage = () => {
        if (selectedImageIndex !== null && selectedImageIndex < (stageData.images?.length || 0) - 1) {
            setSelectedImageIndex(selectedImageIndex + 1);
        }
    };

    const handleCloseModal = () => {
        setSelectedImageIndex(null);
    };

    return (
        <div className="research-page">
            <SideBar projectId={id} />
            
            <main className="research-main">
                <button className="back-button" onClick={() => navigate(`/project/${id}`)}>
                    ← Back to projects
                </button>

                <div className="research-container">
                    <div className="research-header">
                        <h2>Research moodboard</h2>
                        <label htmlFor="research-image-input" className="add-image-button">
                            Add image
                        </label>
                        <input
                            id="research-image-input"
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
                                <div 
                                    key={index} 
                                    className="gallery-image-item"
                                    onClick={() => setSelectedImageIndex(index)}
                                >
                                    <img src={image} alt={`Research ${index}`} />
                                    <button
                                        className="delete-image-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveImage(index);
                                        }}
                                        title="Delete image"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="no-images-message">No images added yet. Click "Add image" to start building your research moodboard.</p>
                        )}
                    </div>
                </div>
            </main>

            {selectedImageIndex !== null && stageData.images && (
                <div className="image-modal-overlay" onClick={handleCloseModal}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={handleCloseModal}>✕</button>
                        
                        <div className="modal-image-container">
                            <img src={stageData.images[selectedImageIndex]} alt={`Full size ${selectedImageIndex}`} />
                        </div>

                        <div className="modal-controls">
                            <button 
                                className="modal-nav-btn prev-btn"
                                onClick={handlePreviousImage}
                                disabled={selectedImageIndex === 0}
                            >
                                ← Previous
                            </button>
                            
                            <span className="image-counter">
                                {selectedImageIndex + 1} / {stageData.images.length}
                            </span>

                            <button 
                                className="modal-nav-btn next-btn"
                                onClick={handleNextImage}
                                disabled={selectedImageIndex === (stageData.images.length - 1)}
                            >
                                Next →
                            </button>
                        </div>

                        <button 
                            className="modal-delete-btn"
                            onClick={() => handleRemoveImage(selectedImageIndex)}
                        >
                            🗑️ Delete Image
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResearchPage;

import type { Project } from '../models/Project';

function GenerateProject() {
    const project: Project = {
        id: Date.now().toString(),
        title: chooseRandomProjectName(),
        status: chooseRandomProjectStatus(),
        category: chooseRandomProjectCategory(),
        progress: chooseRandomProjectProgress(),
        currentStage: chooseRandomProjectStage(),
        startDate: chooseRandomProjectStartDate(),
        endDate: chooseRandomProjectDueDate(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        workingHours: chooseRandomWorkingHours(),
        description: chooseRandomProjectDescription()
    }
    return project;
}

function chooseRandomProjectName() {
    const projectNames = [
        "Skyline Tower",
        "Greenwood Residence",
        "Oceanview Villa",
        "Maplewood Apartments",
        "Sunset Boulevard",
        "Pinecrest Manor",
        "Riverside Retreat"];
    const randomIndex = Math.floor(Math.random() * projectNames.length);
    return projectNames[randomIndex];
}

function chooseRandomProjectStatus() {
    const projectStatuses = ['Planning', 'In progress', 'Done'];
    const randomIndex = Math.floor(Math.random() * projectStatuses.length);
    return projectStatuses[randomIndex];
}

function chooseRandomProjectCategory() {
    const projectCategories = ['Residential', 'Commercial', 'Mixed-use', 'Cultural', 'Infrastructure', 'Landscape', 'Urban'];
    const randomIndex = Math.floor(Math.random() * projectCategories.length);
    return projectCategories[randomIndex];
}

function chooseRandomProjectProgress() {
    return Math.floor(Math.random() * 101); // Random progress between 0 and 100
}

function chooseRandomProjectStage() {
    const projectStages = ['Project brief', 'Site analysis', 'Research', 'Design', 'Visualization'];
    const randomIndex = Math.floor(Math.random() * projectStages.length);
    return projectStages[randomIndex];
}

function chooseRandomProjectStartDate() {
    const start = new Date(2023, 0, 1);
    const end = new Date(2023, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toLocaleDateString();
}

function chooseRandomProjectDueDate() {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toLocaleDateString();
}

function chooseRandomWorkingHours() {
    return Math.floor(Math.random() * 101); // Random working hours between 0 and 100
}

function chooseRandomProjectDescription() {
    const descriptions = [
        "A modern residential tower with panoramic city views.",
        "A sustainable mixed-use development with green spaces.",
        "A cultural center featuring art galleries and performance spaces.",
        "An innovative office building with flexible workspaces."];
    const randomIndex = Math.floor(Math.random() * descriptions.length);
    return descriptions[randomIndex];
}

export default GenerateProject;
import { IsDate, IsString, MinLength } from "class-validator";
import { ProjectCategory } from "../Project";

export class UpdateProjectDto {
    @IsString()
    category: ProjectCategory;

    @IsString()
    @MinLength(10, { message: 'Description must be at least 10 characters long' })
    description: string;

    @IsDate()
    endDate: Date;
    
    constructor(category: ProjectCategory, description: string, endDate: Date) {
        this.category = category;
        this.description = description;
        this.endDate = endDate;
    }
}
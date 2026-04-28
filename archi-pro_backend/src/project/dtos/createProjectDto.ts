import { ProjectCategory } from "../Project";
import { IsDate, IsString, MinLength,  } from "class-validator";
export class CreateProjectDto {
    @IsString()
    userId: string;

    @IsString()
    @MinLength(3, { message: 'Title must be at least 3 characters long' })
    title: string;

    @IsString()
    category: ProjectCategory;

    @IsString()
    @MinLength(10, { message: 'Description must be at least 10 characters long' })
    description: string;

    @IsDate()
    startDate: Date;

    @IsDate()
    endDate: Date;
    
    constructor(userId: string, title: string, category: ProjectCategory, description: string, startDate: Date, endDate: Date) {
        this.userId = userId;
        this.title = title;
        this.category = category;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}
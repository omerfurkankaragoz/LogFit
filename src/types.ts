// src/types.ts
// Central type definitions for the LogFit application

export interface RoutineExercise {
    id: string;
    name: string;
    bodyPart?: string;
}

export interface Routine {
    id: string;
    user_id?: string;
    name: string;
    exercises: RoutineExercise[];
}

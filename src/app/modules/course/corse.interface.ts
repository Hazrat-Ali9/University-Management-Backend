export type ICourseCreateData = {
    title: string,
    code: string,
    credits: number,
    preRequisiteCourses: IPrerequisiteCourseRequest[]
}
// course interface
export type IPrerequisiteCourseRequest = {
    courseId: string,
    isDeleted?: null
}

export type ICourseFilterRequest = {
    searchTerm?: string | undefined;
}
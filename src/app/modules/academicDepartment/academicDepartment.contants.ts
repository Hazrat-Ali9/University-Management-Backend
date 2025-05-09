export const academicDepartmentFilterableFields: string[] = [
    'searchTerm',
    'id',
    'academicFacultyId'
];
// academic department constans
export const academicDepartmentSearchableFields: string[] = ['title'];

export const academicDepartmentRelationalFields: string[] = ['academicFacultyId'];
export const academicDepartmentRelationalFieldsMapper: { [key: string]: string } = {
    academicFacultyId: 'academicFaculty'
};

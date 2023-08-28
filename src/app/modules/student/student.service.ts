import {
    Prisma,
    Student
} from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { studentRelationalFields, studentRelationalFieldsMapper, studentSearchableFields } from './student.constants';
import { IStudentFilterRequest } from './student.interface';

const insertIntoDB = async (data: Student): Promise<Student> => {
    const result = await prisma.student.create({
        data,
        include: {
            academicFaculty: true,
            academicDepartment: true,
            academicSemester: true
        }
    });
    return result;
};

const getAllFromDB = async (
    filters: IStudentFilterRequest,
    options: IPaginationOptions
): Promise<IGenericResponse<Student[]>> => {
    const { limit, page, skip } = paginationHelpers.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            OR: studentSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive'
                }
            }))
        });
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                if (studentRelationalFields.includes(key)) {
                    return {
                        [studentRelationalFieldsMapper[key]]: {
                            id: (filterData as any)[key]
                        }
                    };
                } else {
                    return {
                        [key]: {
                            equals: (filterData as any)[key]
                        }
                    };
                }
            })
        });
    }

    const whereConditions: Prisma.StudentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.student.findMany({
        include: {
            academicFaculty: true,
            academicDepartment: true,
            academicSemester: true
        },
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                    createdAt: 'desc'
                }
    });
    const total = await prisma.student.count({
        where: whereConditions
    });

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    };
};

const getByIdFromDB = async (id: string): Promise<Student | null> => {
    const result = await prisma.student.findUnique({
        where: {
            id
        },
        include: {
            academicFaculty: true,
            academicDepartment: true,
            academicSemester: true
        }
    });
    return result;
};

const updateIntoDB = async (id: string, payload: Partial<Student>): Promise<Student> => {
    const result = await prisma.student.update({
        where: {
            id
        },
        data: payload,
        include: {
            academicSemester: true,
            academicDepartment: true,
            academicFaculty: true
        }
    });
    return result;
}

const deleteFromDB = async (id: string): Promise<Student> => {
    const result = await prisma.student.delete({
        where: {
            id
        },
        include: {
            academicSemester: true,
            academicDepartment: true,
            academicFaculty: true
        }
    })
    return result;
}


export const StudentService = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    updateIntoDB,
    deleteFromDB
};
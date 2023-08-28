import { CourseFaculty, Faculty, Prisma } from "@prisma/client";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/pagination";
import prisma from "../../../shared/prisma";
import { facultyRelationalFields, facultyRelationalFieldsMapper, facultySearchableFields } from "./faculty.constants";
import { IFacultyFilterRequest } from "./faculty.interface";

const insertIntoDB = async (data: Faculty): Promise<Faculty> => {
    const result = await prisma.faculty.create({
        data,
        include: {
            academicFaculty: true,
            academicDepartment: true
        }
    });
    return result;
};

const getAllFromDB = async (
    filters: IFacultyFilterRequest,
    options: IPaginationOptions
): Promise<IGenericResponse<Faculty[]>> => {
    const { limit, page, skip } = paginationHelpers.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            OR: facultySearchableFields.map((field) => ({
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
                if (facultyRelationalFields.includes(key)) {
                    return {
                        [facultyRelationalFieldsMapper[key]]: {
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

    const whereConditions: Prisma.FacultyWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.faculty.findMany({
        include: {
            academicFaculty: true,
            academicDepartment: true
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
    const total = await prisma.faculty.count({
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

const getByIdFromDB = async (id: string): Promise<Faculty | null> => {
    const result = await prisma.faculty.findUnique({
        where: {
            id
        },
        include: {
            academicFaculty: true,
            academicDepartment: true
        }
    });
    return result;
};

const updateOneInDB = async (id: string, payload: Partial<Faculty>): Promise<Faculty> => {
    const result = await prisma.faculty.update({
        where: {
            id
        },
        data: payload,
        include: {
            academicFaculty: true,
            academicDepartment: true
        }
    });
    return result;
};

const deleteByIdFromDB = async (id: string): Promise<Faculty> => {
    const result = await prisma.faculty.delete({
        where: {
            id
        },
        include: {
            academicFaculty: true,
            academicDepartment: true
        }
    });
    return result;
};

const assignCourses = async (
    id: string,
    payload: string[]
): Promise<CourseFaculty[]> => {
    await prisma.courseFaculty.createMany({
        data: payload.map((courseId) => ({
            facultyId: id,
            courseId: courseId
        }))
    })

    const assignCoursesData = await prisma.courseFaculty.findMany({
        where: {
            facultyId: id
        },
        include: {
            course: true
        }
    })

    return assignCoursesData;
}

const removeCourses = async (
    id: string,
    payload: string[]
): Promise<CourseFaculty[] | null> => {
    await prisma.courseFaculty.deleteMany({
        where: {
            facultyId: id,
            courseId: {
                in: payload
            }
        }
    })

    const assignCoursesData = await prisma.courseFaculty.findMany({
        where: {
            facultyId: id
        },
        include: {
            course: true
        }
    })

    return assignCoursesData
}


export const FacultyService = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    updateOneInDB,
    deleteByIdFromDB,
    assignCourses,
    removeCourses
};
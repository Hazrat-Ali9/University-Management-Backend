import { OfferedCourseSection, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import { paginationHelpers } from "../../../helpers/paginationHelper";
import { IGenericResponse } from "../../../interfaces/common";
import { IPaginationOptions } from "../../../interfaces/pagination";
import prisma from "../../../shared/prisma";
import { offeredCourseSectionRelationalFields, offeredCourseSectionRelationalFieldsMapper, offeredCourseSectionSearchableFields } from "./offeredCourseSection.constants";
import { IOfferedCourseSectionFilterRequest } from "./offeredCourseSection.interface";

const insertIntoDB = async (data: any): Promise<OfferedCourseSection> => {

    const isExistOfferedCourse = await prisma.offeredCourse.findFirst({
        where: {
            id: data.offeredCourseId
        }
    })

    console.log(isExistOfferedCourse)
    console.log("data: ", data)

    if (!isExistOfferedCourse) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Offered Course does not exist!")
    }

    data.semesterRegistrationId = isExistOfferedCourse.semesterRegistrationId;

    const result = await prisma.offeredCourseSection.create({
        data
    })

    return result;
}

const getAllFromDB = async (
    filters: IOfferedCourseSectionFilterRequest,
    options: IPaginationOptions
): Promise<IGenericResponse<OfferedCourseSection[]>> => {
    const { limit, page, skip } = paginationHelpers.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            OR: offeredCourseSectionSearchableFields.map((field) => ({
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
                if (offeredCourseSectionRelationalFields.includes(key)) {
                    return {
                        [offeredCourseSectionRelationalFieldsMapper[key]]: {
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

    const whereConditions: Prisma.OfferedCourseSectionWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.offeredCourseSection.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                    createdAt: 'desc'
                },
        include: {
            offeredCourse: {
                include: {
                    course: true
                }
            }
        },
    });
    const total = await prisma.offeredCourseSection.count({
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

const getByIdFromDB = async (id: string): Promise<OfferedCourseSection | null> => {
    const result = await prisma.offeredCourseSection.findUnique({
        where: {
            id
        },
        include: {
            offeredCourse: {
                include: {
                    course: true
                }
            }
        }
    });
    return result;
};

const updateOneInDB = async (
    id: string,
    payload: Partial<OfferedCourseSection>
): Promise<OfferedCourseSection> => {
    //update 
    const result = await prisma.offeredCourseSection.update({
        where: {
            id
        },
        data: payload,
        include: {
            offeredCourse: {
                include: {
                    course: true
                }
            }
        }
    });
    return result;
};

const deleteByIdFromDB = async (id: string): Promise<OfferedCourseSection> => {
    const result = await prisma.offeredCourseSection.delete({
        where: {
            id
        },
        include: {
            offeredCourse: {
                include: {
                    course: true
                }
            }
        }
    });
    return result;
};

export const OfferedCourseSectionService = {
    insertIntoDB,
    getAllFromDB,
    getByIdFromDB,
    updateOneInDB,
    deleteByIdFromDB
}
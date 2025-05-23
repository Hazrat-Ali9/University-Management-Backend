import { z } from 'zod';

const create = z.object({
    body: z.object({
        title: z.string({
            required_error: 'Title is required'
        })
    })
});
// academic faculty valid
const update = z.object({
    body: z.object({
        title: z.string({
            required_error: 'Title is required'
        })
    })
});

export const AcademicFacultyValidation = {
    create,
    update
};
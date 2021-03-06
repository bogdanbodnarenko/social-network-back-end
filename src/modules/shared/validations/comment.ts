import * as yup from 'yup';

export const validCommentSchema = yup.object().shape({
    content: yup
        .string()
        .trim()
        .required(),
});

export const validUpdateCommentSchema = yup.object().shape({
    content: yup
        .string()
        .trim()
        .min(1),
});

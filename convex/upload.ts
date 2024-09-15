import {mutation} from './_generated/server';

// Функция для генерации URL для загрузки файла
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
})
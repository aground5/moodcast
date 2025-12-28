import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['ko', 'en', 'de', 'es', 'fr', 'ja', 'pt', 'ru', 'zh'],
    defaultLocale: 'ko'
});

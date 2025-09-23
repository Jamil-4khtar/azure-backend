import prisma from '../../config/db.js';

export const normalizeSlug = (slug) => {
  if (!slug || slug === '/') return '/';
  return ('/' + slug.replace(/^\/+|\/+$/g, '')).replace(/\/+/g, '/');
};

export const getOrCreateDefaultSite = async () => {
    const site = await prisma.site.findFirst({ where: { name: 'Default Site' } });
    if (site) return site;
    return prisma.site.create({ data: { name: 'Default Site' } });
};

export const getOrCreatePageBySlug = async (slug) => {
    const site = await getOrCreateDefaultSite();
    let page = await prisma.page.findFirst({ where: { siteId: site.id, slug } });
    if (!page) {
        page = await prisma.page.create({
            data: {
                siteId: site.id,
                slug,
                title: slug === '/' ? 'Home' : slug.replace('/', '').replace(/-/g, ' '),
            },
        });
    }
    return page;
};

export const ensureDraft = async (pageId) => {
    const existing = await prisma.pageVersion.findFirst({ where: { pageId, status: 'DRAFT' } });
    if (existing) return existing;
    return prisma.pageVersion.create({
        data: { pageId, status: 'DRAFT', content: {} },
    });
};

export const ensurePublished = async (pageId) => {
    const existing = await prisma.pageVersion.findFirst({ where: { pageId, status: 'PUBLISHED' } });
    if(existing) return existing;
    return prisma.pageVersion.create({
        data: { pageId, status: 'PUBLISHED', content: {} }
    });
};
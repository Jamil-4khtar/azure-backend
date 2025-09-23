import prisma from '../../config/db.js';
import { normalizeSlug, getOrCreatePageBySlug, ensureDraft, ensurePublished } from './cms-db.js';

export const getContent = async (slug, stage = 'draft') => {
  const normalizedSlug = normalizeSlug(slug);
  const page = await prisma.page.findFirst({ where: { slug: normalizedSlug } });

  if (!page) {
    return {};
  }

  const version = await prisma.pageVersion.findFirst({
    where: {
      pageId: page.id,
      status: stage.toUpperCase(),
    },
  });

  return version?.content || {};
};

export const saveContent = async (slug, elementId, changes) => {
    const normalizedSlug = normalizeSlug(slug);
    const page = await getOrCreatePageBySlug(normalizedSlug);
    const draft = await ensureDraft(page.id);

    const content = draft.content || {};
    const before = content[elementId] || {};
    const next = { ...before };

    if (changes?.styles) {
        next.styles = { ...(before.styles || {}), ...changes.styles };
    }
    if (changes?.text !== undefined) {
        next.text = changes.text;
    }

    const updatedContent = { ...content, [elementId]: next };

    await prisma.pageVersion.update({
        where: { id: draft.id },
        data: { content: updatedContent },
    });
};

export const publishContent = async (slug) => {
    const normalizedSlug = normalizeSlug(slug);
    const page = await getOrCreatePageBySlug(normalizedSlug);
    const draft = await ensureDraft(page.id);
    const published = await ensurePublished(page.id);

    await prisma.pageVersion.update({
        where: { id: published.id },
        data: { content: draft.content || {} },
    });

    await prisma.page.update({
        where: { id: page.id },
        data: { updatedAt: new Date() },
    });
};

export const clearContent = async (slug, stage) => {
    const normalizedSlug = normalizeSlug(slug);
    const page = await getOrCreatePageBySlug(normalizedSlug);
    
    if (stage && (stage.toUpperCase() === 'DRAFT' || stage.toUpperCase() === 'PUBLISHED')) {
        await prisma.pageVersion.updateMany({
            where: { pageId: page.id, status: stage.toUpperCase() },
            data: { content: {} },
        });
    } else {
        await prisma.pageVersion.updateMany({
            where: { pageId: page.id },
            data: { content: {} },
        });
    }
};
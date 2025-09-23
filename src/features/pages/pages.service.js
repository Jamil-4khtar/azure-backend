import prisma from '../../config/db.js';
import { 
  getOrCreateDefaultSite, 
  normalizeSlug, 
  getOrCreatePageBySlug,
  ensureDraft,
  ensurePublished
} from '../content/cms-db.js';

/**
 * Retrieves all pages for the default site.
 */
export const getAllPages = async () => {
  const site = await getOrCreateDefaultSite();
  const pages = await prisma.page.findMany({
    where: { siteId: site.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      versions: {
        select: { status: true },
      },
    },
  });

  // Format the data to match the original API response
  return pages.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    hasPublished: p.versions.some((v) => v.status === 'PUBLISHED'),
    updatedAt: p.updatedAt,
  }));
};

/**
 * Creates a new page or updates an existing one.
 * @param {string} slug - The raw slug for the page.
 * @param {string} title - The title of the page.
 * @returns {Promise<Page>} The created or retrieved page object.
 */
export const createPage = async (slug, title) => {
  const normalizedSlug = normalizeSlug(slug || '/');
  const page = await getOrCreatePageBySlug(normalizedSlug);

  // Ensure draft and published versions exist for the new page
  await ensureDraft(page.id);
  await ensurePublished(page.id);

  // Update the title if it's provided and different
  if (title && title !== page.title) {
    return await prisma.page.update({
      where: { id: page.id },
      data: { title },
    });
  }

  return page;
};
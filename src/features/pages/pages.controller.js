import { getAllPages, createPage } from './pages.service.js';

export const listPages = async (req, res) => {
  try {
    const pages = await getAllPages();
    res.status(200).json({ pages });
  } catch (error) {
    console.error('List Pages Error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

export const createNewPage = async (req, res) => {
  try {
    const { slug, title } = req.body;
    const page = await createPage(slug, title);
    res.status(201).json({ pageId: page.id, slug: page.slug });
  } catch (error) {
    console.error('Create Page Error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};
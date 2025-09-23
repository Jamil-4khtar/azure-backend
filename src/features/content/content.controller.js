import { getContent, saveContent, publishContent, clearContent } from './content.service.js';

export const getPageContent = async (req, res) => {
  try {
    const { slug } = req.query;
    const stage = req.query.stage || 'draft';
    const content = await getContent(slug, stage);
    res.status(200).json(content);
  } catch (error) {
    console.error('Get Content Error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

export const savePageContent = async (req, res) => {
  try {
    const { slug, elementId, changes } = req.body;
    await saveContent(slug, elementId, changes);
    res.status(200).json({ message: 'Content saved successfully.' });
  } catch (error) {
    console.error('Save Content Error:', error);
    res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};

export const publishPageContent = async (req, res) => {
    try {
        const { slug } = req.body;
        await publishContent(slug);
        res.status(200).json({ message: 'Content published successfully.' });
    } catch (error) {
        console.error('Publish Content Error:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
};

export const clearPageContent = async (req, res) => {
    try {
        const { slug, stage } = req.body;
        await clearContent(slug, stage);
        res.status(200).json({ message: 'Content cleared successfully.' });
    } catch (error) {
        console.error('Clear Content Error:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
};
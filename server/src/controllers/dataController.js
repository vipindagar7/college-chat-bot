import { getCollegeData, updateCollegeData, addFaq, updateFaq, deleteFaq } from '../services/botEngine.js';

// Get all college data
export const getData = (req, res) => {
  try {
    res.json({ success: true, data: getCollegeData() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load data' });
  }
};

// Update entire college data
export const updateData = (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ error: 'Data required' });
    updateCollegeData(data);
    res.json({ success: true, message: 'College data updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update data' });
  }
};

// Update specific sections
export const updateSection = (req, res) => {
  try {
    const { section } = req.params;
    const { value } = req.body;
    const allowed = ['college', 'courses', 'scholarships', 'hostel', 'placements', 'admissionProcess', 'importantDates', 'documentsRequired', 'theme'];
    if (!allowed.includes(section)) return res.status(400).json({ error: 'Invalid section' });

    const data = getCollegeData();
    data[section] = value;
    updateCollegeData(data);
    res.json({ success: true, message: `${section} updated` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update section' });
  }
};

// FAQ CRUD
export const getFaqs = (req, res) => {
  try {
    const { faqs } = getCollegeData();
    res.json({ success: true, faqs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get FAQs' });
  }
};

export const createFaq = (req, res) => {
  try {
    const { question, answer, keywords } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'Question and answer required' });
    const kwArray = Array.isArray(keywords)
      ? keywords
      : (keywords || '').split(',').map(k => k.trim()).filter(Boolean);
    const faq = addFaq({ question, answer, keywords: kwArray });
    res.json({ success: true, faq });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add FAQ' });
  }
};

export const editFaq = (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, keywords } = req.body;
    const kwArray = Array.isArray(keywords)
      ? keywords
      : (keywords || '').split(',').map(k => k.trim()).filter(Boolean);
    const faq = updateFaq(id, { question, answer, keywords: kwArray });
    res.json({ success: true, faq });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update FAQ' });
  }
};

export const removeFaq = (req, res) => {
  try {
    const { id } = req.params;
    deleteFaq(id);
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
};

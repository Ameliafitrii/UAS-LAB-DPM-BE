import express, { Request, Response } from 'express';
import { HealthRecord } from '../models/HealthRecord';
import authenticateToken from '../middleware/authenticateToken';

const router = express.Router();

interface AuthRequest extends Request {
  userId?: string;
}

router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const records = await HealthRecord.find({ userId });
    res.json(records);
  } catch (err) {
    console.error('Error fetching health records:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, value, date } = req.body;
  const userId = req.userId;

  if (!title || !description || !value || !date) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    const newRecord = new HealthRecord({ title, description, value, date, userId });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('Error saving health record:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, value, date } = req.body;
  const userId = req.userId;

  if (!title || !description || !value || !date) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    const updatedRecord = await HealthRecord.findOneAndUpdate(
      { _id: id, userId },
      { title, description, value, date },
      { new: true }
    );

    if (!updatedRecord) {
      res.status(404).json({ error: 'Record not found or unauthorized' });
      return;
    }

    res.json(updatedRecord);
  } catch (err) {
    console.error('Error updating health record:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const record = await HealthRecord.findOneAndDelete({ _id: id, userId });
    if (!record) {
      res.status(404).json({ error: 'Record not found or unauthorized' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting health record:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
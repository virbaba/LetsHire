import express from 'express';
import { getAnswer } from '../controllers/faq.controller.js';

const router = express.Router();
router.post("/getAnswer", getAnswer);

export default router;

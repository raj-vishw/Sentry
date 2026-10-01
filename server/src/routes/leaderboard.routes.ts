import { Router } from 'express';
import * as leaderboardController from '../controllers/leaderboard.controller.js';
import { attachUserIfPresent } from '../middleware/auth.middleware.js';

const router = Router();

// Optional auth: logged-out visitors still see the board, just without a
// "my position" callout.
router.get('/', attachUserIfPresent, leaderboardController.getGlobal);
router.get('/teams', leaderboardController.getTeams);

export default router;

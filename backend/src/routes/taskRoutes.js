const router = require('express').Router();
const auth = require('../middleware/auth');
const { validateCreateTask } = require('../middleware/validate');
const { createTask, getTasks, getTask } = require('../controllers/taskController');
router.use(auth); // All task routes need auth
router.post('/', validateCreateTask, createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
module.exports = router;
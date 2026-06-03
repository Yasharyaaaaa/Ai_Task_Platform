const router = require('express').Router();
const auth = require('../middleware/auth');
const { validateCreateTask } = require('../middleware/validate');
const { createTask, getTasks, getTask, reRunTask, deleteTask } = require('../controllers/taskController');
router.use(auth); // All task routes need auth
router.post('/', validateCreateTask, createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:id', reRunTask);
router.delete('/:id', deleteTask);
module.exports = router;
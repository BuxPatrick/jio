import express from 'express';
import {
  consulateController,
  lawyerController,
  surgeonController,
  shelterController,
  iceResourceController
} from '../controllers/resourceController.js';

const router = express.Router();

// Consulates routes
router.get('/consulates', consulateController.getAll);
router.get('/consulates/search', consulateController.search);
router.get('/consulates/:id', consulateController.getById);
router.post('/consulates', consulateController.create);
router.put('/consulates/:id', consulateController.update);
router.delete('/consulates/:id', consulateController.delete);

// Lawyers routes
router.get('/lawyers', lawyerController.getAll);
router.get('/lawyers/search', lawyerController.search);
router.get('/lawyers/:id', lawyerController.getById);
router.post('/lawyers', lawyerController.create);
router.put('/lawyers/:id', lawyerController.update);
router.delete('/lawyers/:id', lawyerController.delete);

// Civil Surgeons routes
router.get('/surgeons', surgeonController.getAll);
router.get('/surgeons/search', surgeonController.search);
router.get('/surgeons/:id', surgeonController.getById);
router.post('/surgeons', surgeonController.create);
router.put('/surgeons/:id', surgeonController.update);
router.delete('/surgeons/:id', surgeonController.delete);

// Shelters routes
router.get('/shelters', shelterController.getAll);
router.get('/shelters/search', shelterController.search);
router.get('/shelters/:id', shelterController.getById);
router.post('/shelters', shelterController.create);
router.put('/shelters/:id', shelterController.update);
router.delete('/shelters/:id', shelterController.delete);

// ICE Resources routes
router.get('/ice-resources', iceResourceController.getAll);
router.get('/ice-resources/search', iceResourceController.search);
router.get('/ice-resources/:id', iceResourceController.getById);
router.post('/ice-resources', iceResourceController.create);
router.put('/ice-resources/:id', iceResourceController.update);
router.delete('/ice-resources/:id', iceResourceController.delete);

export default router;

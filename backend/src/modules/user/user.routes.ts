import { Router } from 'express';
import { UserController } from './user.controller';

const router = Router();

function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.get('/', (req, res) => {
  res.json({ message: 'User route funcionando!' });
});

router.post('/', asyncHandler(UserController.createUser));
router.get('/:telefone', asyncHandler(UserController.findByTelefone));

export default router; 
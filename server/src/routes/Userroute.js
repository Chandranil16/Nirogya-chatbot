const router= require('express').Router();
const {register,login,logout,getme}= require('../controllers/Usercontroller');
const auth= require('../middlewares/auth');
router.post('/register',register)
router.post('/login',login)
router.post('/logout',auth,logout)
router.get('/me',auth,getme)

module.exports=router;
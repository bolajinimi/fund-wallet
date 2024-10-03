import { Router } from "express";
import {
  createAccount,
  fundAccount,
  getAccount,
  transferFund,
  withdrawFund,
} from "../controller/accountController";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/account", auth, createAccount);

router.get("/account", auth, getAccount);

router.post("/account/fund", auth, fundAccount);

router.post("/account/transfer", auth, transferFund);

router.post("/account/withdraw", auth, withdrawFund);
export default router;

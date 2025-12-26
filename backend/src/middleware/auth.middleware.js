import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) throw new ApiError(401, "No token");

  const token = header.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    next();
  } catch {
    throw new ApiError(401, "Invalid token");
  }
};

export default auth;

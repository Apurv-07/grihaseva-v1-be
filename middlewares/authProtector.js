import jwt from "jsonwebtoken";
import "dotenv/config";
const authProtector = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const verify = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = verify;
    next()
  } catch (err) {
    return res.status(401).json({ message: "Go away! F* off" });
  }
};
export default authProtector;

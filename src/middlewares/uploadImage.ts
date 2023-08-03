import { Request } from "express";
import multer from "multer";
import { normalizeText } from "../utils/normalizeText";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/uploads");
  },
  filename(req, file, cb) {
    function generateFileName(file: any) {
      const fileType = file.mimetype.split("/");
      const fileName = normalizeText(req.body.title);
      return `${fileName}.${fileType[1]}`;
    }
    const fileName = generateFileName(file);
    cb(null, fileName);
  },
});

const fileFilter = (req: Request, file: any, cb: any) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const limits = {
  fileSize: 4024 * 3024 * 5,
};

const upload = multer({ storage, fileFilter, limits });

export default upload;

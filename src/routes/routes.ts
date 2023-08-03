import { Router } from "express";
import cors from "cors";

const routes = Router();
import upload from "../middlewares/uploadImage";
import { Gallery } from "../controllers/GalleryController";

routes.use(cors());

routes.post("/postImage", upload.single("file"), new Gallery().postImage);
routes.get("/getImageData", new Gallery().getImageData);
routes.get("/getImages/:fileName", new Gallery().getImages);
routes.delete("/deleteImage/:id", new Gallery().deleteImage)

export default routes;

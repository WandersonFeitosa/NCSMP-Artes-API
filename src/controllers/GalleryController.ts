import mongoose from "mongoose";
import fs from "fs";
import { normalizeText } from "../utils/normalizeText";

export async function getFileNamesInFolder(folderPath: any) {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (error, files) => {
      if (error) {
        reject(error);
      } else {
        resolve(files);
      }
    });
  });
}

const gallerySchema = new mongoose.Schema({
  name: String,
  author: String,
  title: String,
  newFileName: String,
  password: String,
});

export const ncsmpGallery = mongoose.model("ncsmp-gallery", gallerySchema);

const ncsmpArtsTokensSchema = new mongoose.Schema({
  token: String,
  user: String,
  used: Boolean,
  image: String,
});

const ArtsTokens = mongoose.model("ncsmp-arts-tokens", ncsmpArtsTokensSchema);

export class Gallery {
  async postImage(req: any, res: any) {
    const { name, author, title, password, token } = req.body;

    const checkToken = await ArtsTokens.find({ token });

    if (checkToken.length === 0) {
      return res.status(400).json({ error: "Token inválido" });
    }

    if (checkToken[0].used) {
      return res.status(400).json({ error: "Token já utilizado" });
    }

    const fileType = req.file.mimetype.split("/");
    if (fileType[0] !== "image") return res.send("File is not an image");
    const formatedTitle = normalizeText(title);

    const newFileName = `${formatedTitle}.${fileType[1]}`;

    const gallery = new ncsmpGallery({
      name,
      author,
      title,
      newFileName,
      password,
    });

    await gallery.save();
    await ArtsTokens.updateOne({ token }, { used: true, image: title });
    res.send("Image uploaded successfully");
  }

  async getImageData(req: any, res: any) {
    const images = await ncsmpGallery.find();

    images.sort(() => Math.random() - 0.5);

    res.send({ images });
  }

  async getImages(req: any, res: any) {
    const path = __dirname.split("src")[0];
    const fileName = req.params.fileName;

    res.sendFile(`${path}public/uploads/${fileName}`);
  }
  async deleteImage(req: any, res: any) {
    const { password } = req.body;
    const _id = req.params.id;
    const path = __dirname.split("src")[0];
    const image = await ncsmpGallery.findById(_id);
    if (!image) return res.status(400).json({ error: "Imagem não encontrada" });
    const fileName = image.newFileName;
    const imagePath = `${path}public/uploads/${fileName}`;

    if (password !== image.password) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    fs.unlink(imagePath, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erro ao deletar imagem" });
      }

      await ncsmpGallery.deleteOne({ _id });
      await ArtsTokens.deleteOne({ image: image.title });
      res.status(200).json({ message: "Imagem deletada com sucesso" });
    });
  }
}

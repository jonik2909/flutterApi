import path from "path";
import multer from "multer";
import { v4 } from "uuid";
import sharp from "sharp";
import fs from "fs";

/** MULTER IMAGE UPLOADER **/
function getTargetImageStorage(address: any) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./uploads/${address}`);
    },
    filename: function (req, file, cb) {
      const extension = path.parse(file.originalname).ext.toLowerCase();
      const random_name = v4() + extension;
      cb(null, random_name);
    },
  });
}

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only images in jpeg, jpg, png and webp formats are accepted!"),
      false
    );
  }
};

const makeUploader = (address: string) => {
  const storage = getTargetImageStorage(address);
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  // Rasmlarni siqish uchun middleware
  const processImage = async (req: any, res: any, next: any) => {
    try {
      // Single file uchun
      if (req.file) {
        const filePath = req.file.path;
        await sharp(filePath)
          .resize(800, 600, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .toFile(filePath + "_compressed");

        fs.unlinkSync(filePath);
        fs.renameSync(filePath + "_compressed", filePath);
      }

      // Multiple files uchun
      if (req.files) {
        for (let file of req.files) {
          const filePath = file.path;
          await sharp(filePath)
            .resize(800, 600, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .toFile(filePath + "_compressed");

          fs.unlinkSync(filePath);
          fs.renameSync(filePath + "_compressed", filePath);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  return {
    single: (fieldName: string) => {
      return (req: any, res: any, next: any) => {
        upload.single(fieldName)(req, res, (err: any) => {
          if (err) return next(err);
          processImage(req, res, next);
        });
      };
    },
    array: (fieldName: string, maxCount: number) => {
      return (req: any, res: any, next: any) => {
        upload.array(fieldName, maxCount)(req, res, (err: any) => {
          if (err) return next(err);
          processImage(req, res, next);
        });
      };
    },
  };
};

export default makeUploader;

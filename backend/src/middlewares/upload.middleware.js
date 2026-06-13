import multer from "multer";

const MAX_FILE_SIZE = 25 * 1024 * 1024; //25 mb

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    if (!isImage && !isVideo) {
      cb(new Error("only image or video ploads are Allowed"));
    }

    cb(null, true);
  },
});

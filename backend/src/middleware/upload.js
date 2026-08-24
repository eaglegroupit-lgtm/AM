import multer from "multer";

// Use memoryStorage so uploaded images are converted directly to Base64
// and persisted safely in PostgreSQL database without depending on ephemeral serverless disks.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, png, webp, gif, svg) are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});
